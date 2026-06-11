from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select # Import Session and select
from models import User, Customer # Import User and Customer models
from database import get_session # Import get_session
from auth import verify_token
from typing import Optional

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)

async def get_current_admin(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme_optional),
    session: Session = Depends(get_session)
):
    if not token:
        token = request.cookies.get("accessToken") or request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user # Return the user object

async def get_current_customer(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme_optional),
    session: Session = Depends(get_session)
):
    if not token:
        token = request.cookies.get("customerToken") or request.cookies.get("customer_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload.get("sub")
    role = payload.get("role")
    if email is None or role != "customer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    from services.crypto import deterministic_hash, decrypt_value
    email_h = deterministic_hash(email)
    customer = session.exec(select(Customer).where(Customer.email_hash == email_h)).first()
    if customer is None:
        customer = session.exec(select(Customer).where(Customer.email == email)).first()
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Decrypt fields in-place
    customer.email = decrypt_value(customer.email)
    customer.first_name = decrypt_value(customer.first_name)
    customer.last_name = decrypt_value(customer.last_name)
    customer.phone = decrypt_value(customer.phone)
    customer.default_address = decrypt_value(customer.default_address)
    return customer

async def get_optional_customer(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme_optional),
    session: Session = Depends(get_session)
):
    if not token:
        token = request.cookies.get("customerToken") or request.cookies.get("customer_token")
        
    if not token:
        return None
    payload = verify_token(token)
    if payload is None:
        return None
    email = payload.get("sub")
    role = payload.get("role")
    if email is None or role != "customer":
        return None
    from services.crypto import deterministic_hash, decrypt_value
    email_h = deterministic_hash(email)
    customer = session.exec(select(Customer).where(Customer.email_hash == email_h)).first()
    if customer is None:
        customer = session.exec(select(Customer).where(Customer.email == email)).first()
    if customer is not None:
        customer.email = decrypt_value(customer.email)
        customer.first_name = decrypt_value(customer.first_name)
        customer.last_name = decrypt_value(customer.last_name)
        customer.phone = decrypt_value(customer.phone)
        customer.default_address = decrypt_value(customer.default_address)
    return customer
