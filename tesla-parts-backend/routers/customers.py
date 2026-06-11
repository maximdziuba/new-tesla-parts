from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlmodel import Session, select
from datetime import datetime, timedelta
import secrets
from database import get_session
from models import Customer, Order, OrderItem
from schemas import CustomerRegister, CustomerVerify, CustomerLogin, CustomerRead, CartItem, CustomerUpdateDiscount, OrderRead, CustomerForgotPassword, CustomerResetPassword
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from services.email import email_service
from typing import List
import json
from dependencies import get_current_customer, get_current_admin
from sqlalchemy.orm import selectinload
from services.pricing import get_exchange_rate

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/register")
async def register_customer(data: CustomerRegister, session: Session = Depends(get_session)):
    from services.crypto import encrypt_value, deterministic_hash
    # Check if customer already exists using hash lookup
    email_h = deterministic_hash(data.email)
    existing = session.exec(select(Customer).where(Customer.email_hash == email_h)).first()
    
    # Fallback to plain email check for legacy compatibility
    if not existing:
        existing = session.exec(select(Customer).where(Customer.email == data.email)).first()
        if existing and not existing.email_hash:
            existing.email_hash = email_h
            existing.email = encrypt_value(data.email)
            session.add(existing)
            session.commit()

    if existing:
        if existing.is_verified:
            raise HTTPException(status_code=400, detail="Користувач з такою поштою вже зареєстрований")
        customer = existing
    else:
        customer = Customer(
            email=encrypt_value(data.email),
            email_hash=email_h
        )
    
    # Generate token
    token = secrets.token_urlsafe(32)
    customer.verification_token = token
    customer.token_expires_at = datetime.utcnow() + timedelta(hours=24)
    
    session.add(customer)
    session.commit()
    
    # Send email using plain email from payload
    email_service.send_verification_email(data.email, token)
    
    return {"message": "Посилання для підтвердження надіслано на вашу пошту"}

@router.post("/verify")
async def verify_customer(data: CustomerVerify, session: Session = Depends(get_session)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Паролі не співпадають")
    
    customer = session.exec(
        select(Customer).where(Customer.verification_token == data.token)
    ).first()
    
    if not customer:
        raise HTTPException(status_code=400, detail="Недійсний токен")
    
    if customer.token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Термін дії посилання вичерпано")
    
    customer.hashed_password = get_password_hash(data.password)
    customer.is_verified = True
    customer.verification_token = None
    customer.token_expires_at = None
    
    session.add(customer)
    session.commit()
    
    return {"message": "Акаунт успішно підтверджено. Тепер ви можете увійти"}

@router.post("/forgot-password")
async def forgot_password(data: CustomerForgotPassword, session: Session = Depends(get_session)):
    import hashlib
    from services.crypto import deterministic_hash, decrypt_value
    
    email_h = deterministic_hash(data.email)
    customer = session.exec(select(Customer).where(Customer.email_hash == email_h)).first()
    if not customer:
        customer = session.exec(select(Customer).where(Customer.email == data.email)).first()
        
    if customer and customer.is_verified:
        # Generate raw token
        token = secrets.token_urlsafe(32)
        # Store securely: hash it
        customer.reset_token_hash = hashlib.sha256(token.encode()).hexdigest()
        customer.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        session.add(customer)
        session.commit()
        
        # Send reset email
        plain_email = decrypt_value(customer.email)
        email_service.send_password_reset_email(plain_email, token)
        
    # Always return success message for security to prevent user enumeration
    return {"message": "Якщо пошта існує в системі, посилання для відновлення паролю надіслано на вашу пошту"}

@router.post("/reset-password")
async def reset_password(data: CustomerResetPassword, session: Session = Depends(get_session)):
    import hashlib
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Паролі не співпадають")
        
    # Secure hash of token
    token_hash = hashlib.sha256(data.token.encode()).hexdigest()
    
    # Retrieve customer with reset token
    customer = session.exec(
        select(Customer).where(Customer.reset_token_hash == token_hash)
    ).first()
    
    if not customer:
        raise HTTPException(status_code=400, detail="Недійсний токен відновлення паролю")
        
    # Handle timezone-aware/naive comparison for Postgres/SQLite compatibility
    expiry = customer.reset_token_expires_at
    if expiry and expiry.tzinfo is not None:
        expiry = expiry.replace(tzinfo=None)
        
    if not expiry or expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Недійсний або прострочений токен")
        
    customer.hashed_password = get_password_hash(data.password)
    customer.reset_token_hash = None
    customer.reset_token_expires_at = None
    
    session.add(customer)
    session.commit()
    
    return {"message": "Пароль успішно оновлено. Тепер ви можете увійти"}

@router.post("/login")
async def login_customer(
    response: Response,
    request: Request,
    data: CustomerLogin,
    session: Session = Depends(get_session)
):
    from services.crypto import deterministic_hash, decrypt_value
    email_h = deterministic_hash(data.email)
    customer = session.exec(select(Customer).where(Customer.email_hash == email_h)).first()
    if not customer:
        customer = session.exec(select(Customer).where(Customer.email == data.email)).first()
    
    if not customer or not customer.is_verified or not verify_password(data.password, customer.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильна пошта або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Using plain email decoded from storage for sub
    plain_email = decrypt_value(customer.email)
    access_token = create_access_token(
        data={"sub": plain_email, "role": "customer"}, expires_delta=access_token_expires
    )
    
    # Dynamic domain check
    host = request.headers.get("host", "")
    domain = None
    if "teslafix.com.ua" in host:
        domain = ".teslafix.com.ua"
        
    response.set_cookie(
        key="customerToken",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        domain=domain,
        max_age=30 * 24 * 3600 # 30 days
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout_customer(response: Response, request: Request):
    host = request.headers.get("host", "")
    domain = None
    if "teslafix.com.ua" in host:
        domain = ".teslafix.com.ua"
        
    response.delete_cookie("customerToken", domain=domain)
    response.delete_cookie("customer_token", domain=domain)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=CustomerRead)
async def get_me(customer: Customer = Depends(get_current_customer)):
    return customer

@router.get("/cart", response_model=List[CartItem])
async def get_cart(
    customer: Customer = Depends(get_current_customer),
    session: Session = Depends(get_session)
):
    if not customer.cart_data:
        return []
    try:
        return json.loads(customer.cart_data)
    except Exception:
        return []

@router.post("/cart")
async def save_cart(
    cart_items: List[CartItem],
    customer: Customer = Depends(get_current_customer),
    session: Session = Depends(get_session)
):
    cart_dicts = [item.model_dump(mode="json") for item in cart_items]
    customer.cart_data = json.dumps(cart_dicts)
    session.add(customer)
    session.commit()
    return {"message": "Кошик успішно збережено"}

@router.get("/", response_model=List[CustomerRead], dependencies=[Depends(get_current_admin)])
async def get_customers(session: Session = Depends(get_session)):
    from services.crypto import decrypt_value
    customers = session.exec(select(Customer)).all()
    for customer in customers:
        customer.email = decrypt_value(customer.email)
        customer.first_name = decrypt_value(customer.first_name)
        customer.last_name = decrypt_value(customer.last_name)
        customer.phone = decrypt_value(customer.phone)
    return customers

@router.get("/{customer_id}/orders", response_model=List[OrderRead], dependencies=[Depends(get_current_admin)])
async def get_customer_orders(customer_id: int, session: Session = Depends(get_session)):
    orders = session.exec(select(Order).where(Order.customer_id == customer_id).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    )).all()
    rate = get_exchange_rate(session)
    
    orders_with_uah = []
    for order in orders:
        total_usd = order.totalUSD or 0.0
        order_read = OrderRead.model_validate(order, from_attributes=True)
        order_read.totalUAH = round(total_usd * rate, 2) if rate else 0.0
        
        # Manually populate product names
        for i, item in enumerate(order.items):
            if item.product:
                order_read.items[i].product_name = item.product.name
            else:
                order_read.items[i].product_name = "Product Deleted"
        orders_with_uah.append(order_read)
        
    return orders_with_uah

@router.put("/{customer_id}/discount", dependencies=[Depends(get_current_admin)])
async def update_customer_discount(
    customer_id: int, 
    discount_data: CustomerUpdateDiscount, 
    session: Session = Depends(get_session)
):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")
    
    dtype = discount_data.discount_type
    dvalue = discount_data.discount_value
    
    if dtype not in ["percent", "usd", "uah"]:
        raise HTTPException(status_code=400, detail="Некоректний тип знижки")
        
    if dvalue < 0:
        raise HTTPException(status_code=400, detail="Значення знижки не може бути від'ємним")
        
    if dtype == "percent" and dvalue > 100:
        raise HTTPException(status_code=400, detail="Знижка у відсотках не може перевищувати 100%")
        
    customer.discount_type = dtype
    customer.discount_value = round(dvalue, 2)
    # Maintain legacy discount_percent column for backward compatibility
    customer.discount_percent = round(dvalue, 2) if dtype == "percent" else 0.0
    
    session.add(customer)
    session.commit()
    session.refresh(customer)
    
    return {
        "message": "Знижку успішно оновлено", 
        "customer_id": customer.id, 
        "discount_type": customer.discount_type,
        "discount_value": customer.discount_value,
        "discount_percent": customer.discount_percent
    }

from pydantic import BaseModel

class CustomerProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    phone: str

@router.put("/profile", response_model=CustomerRead)
async def update_profile(
    data: CustomerProfileUpdate,
    customer: Customer = Depends(get_current_customer),
    session: Session = Depends(get_session)
):
    from services.crypto import encrypt_value, decrypt_value
    customer.first_name = encrypt_value(data.first_name)
    customer.last_name = encrypt_value(data.last_name)
    customer.phone = encrypt_value(data.phone)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    
    customer.email = decrypt_value(customer.email)
    customer.first_name = decrypt_value(customer.first_name)
    customer.last_name = decrypt_value(customer.last_name)
    customer.phone = decrypt_value(customer.phone)
    return customer
