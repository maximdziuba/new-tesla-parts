from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Customer, PromoCode, CustomerPromoCodeLink
from dependencies import get_current_admin, get_optional_customer
from pydantic import BaseModel
from typing import List, Optional
from services.crypto import decrypt_value

router = APIRouter(prefix="/promocodes", tags=["promocodes"])

# --- Schemas ---
class PromoCodeCreate(BaseModel):
    code: str
    discount_type: str  # percent, usd, uah
    discount_value: float
    scope: str  # everyone, selected
    customer_ids: Optional[List[int]] = []

class PromoCodeRead(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    scope: str
    is_active: bool
    customer_ids: List[int] = []

class PromoCodeValidateRequest(BaseModel):
    code: str

class PromoCodeValidateResponse(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    valid: bool

# --- Admin Routes ---

@router.get("/", response_model=List[PromoCodeRead], dependencies=[Depends(get_current_admin)])
def get_promocodes(session: Session = Depends(get_session)):
    promocodes = session.exec(select(PromoCode)).all()
    result = []
    for pc in promocodes:
        result.append(PromoCodeRead(
            id=pc.id,
            code=pc.code,
            discount_type=pc.discount_type,
            discount_value=pc.discount_value,
            scope=pc.scope,
            is_active=pc.is_active,
            customer_ids=[c.id for c in pc.customers]
        ))
    return result

@router.post("/", response_model=PromoCodeRead, dependencies=[Depends(get_current_admin)])
def create_promocode(data: PromoCodeCreate, session: Session = Depends(get_session)):
    # Check if code already exists
    existing = session.exec(select(PromoCode).where(PromoCode.code == data.code.upper().strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Промокод з таким кодом вже існує")
    
    promocode = PromoCode(
        code=data.code.upper().strip(),
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        scope=data.scope,
        is_active=True
    )
    session.add(promocode)
    session.commit()
    session.refresh(promocode)
    
    if data.scope == "selected" and data.customer_ids:
        for cid in data.customer_ids:
            customer = session.get(Customer, cid)
            if customer:
                link = CustomerPromoCodeLink(customer_id=cid, promocode_id=promocode.id)
                session.add(link)
        session.commit()
        session.refresh(promocode)
        
    return PromoCodeRead(
        id=promocode.id,
        code=promocode.code,
        discount_type=promocode.discount_type,
        discount_value=promocode.discount_value,
        scope=promocode.scope,
        is_active=promocode.is_active,
        customer_ids=[c.id for c in promocode.customers]
    )

@router.put("/{promocode_id}", response_model=PromoCodeRead, dependencies=[Depends(get_current_admin)])
def update_promocode(promocode_id: int, data: PromoCodeCreate, session: Session = Depends(get_session)):
    promocode = session.get(PromoCode, promocode_id)
    if not promocode:
        raise HTTPException(status_code=404, detail="Промокод не знайдено")
        
    # Check if code is already used by another promocode
    existing = session.exec(
        select(PromoCode).where(PromoCode.code == data.code.upper().strip(), PromoCode.id != promocode_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Промокод з таким кодом вже існує")
        
    promocode.code = data.code.upper().strip()
    promocode.discount_type = data.discount_type
    promocode.discount_value = data.discount_value
    promocode.scope = data.scope
    
    # Update links
    # Delete existing links first
    existing_links = session.exec(
        select(CustomerPromoCodeLink).where(CustomerPromoCodeLink.promocode_id == promocode_id)
    ).all()
    for link in existing_links:
        session.delete(link)
    session.commit()
    
    if data.scope == "selected" and data.customer_ids:
        for cid in data.customer_ids:
            customer = session.get(Customer, cid)
            if customer:
                link = CustomerPromoCodeLink(customer_id=cid, promocode_id=promocode.id)
                session.add(link)
        session.commit()
        
    session.add(promocode)
    session.commit()
    session.refresh(promocode)
    
    return PromoCodeRead(
        id=promocode.id,
        code=promocode.code,
        discount_type=promocode.discount_type,
        discount_value=promocode.discount_value,
        scope=promocode.scope,
        is_active=promocode.is_active,
        customer_ids=[c.id for c in promocode.customers]
    )

@router.delete("/{promocode_id}", dependencies=[Depends(get_current_admin)])
def delete_promocode(promocode_id: int, session: Session = Depends(get_session)):
    promocode = session.get(PromoCode, promocode_id)
    if not promocode:
        raise HTTPException(status_code=404, detail="Промокод не знайдено")
    session.delete(promocode)
    session.commit()
    return {"message": "Промокод успішно видалено"}

# --- Public / Customer Routes ---

@router.post("/validate", response_model=PromoCodeValidateResponse)
def validate_promocode(
    req: PromoCodeValidateRequest,
    session: Session = Depends(get_session),
    customer: Optional[Customer] = Depends(get_optional_customer)
):
    code_str = req.code.upper().strip()
    promocode = session.exec(
        select(PromoCode).where(PromoCode.code == code_str, PromoCode.is_active == True)
    ).first()
    
    if not promocode:
        raise HTTPException(status_code=404, detail="Недійсний промокод")
        
    if promocode.scope == "everyone":
        return PromoCodeValidateResponse(
            code=promocode.code,
            discount_type=promocode.discount_type,
            discount_value=promocode.discount_value,
            valid=True
        )
        
    # Selected scope logic
    if not customer:
        raise HTTPException(
            status_code=400,
            detail="Цей промокод тільки для зареєстрованих клієнтів. Будь ласка, увійдіть в акаунт"
        )
        
    # Check if customer id is linked to the promocode
    is_linked = any(c.id == customer.id for c in promocode.customers)
    if not is_linked:
        raise HTTPException(status_code=400, detail="Цей промокод недійсний для вашого акаунту")
        
    return PromoCodeValidateResponse(
        code=promocode.code,
        discount_type=promocode.discount_type,
        discount_value=promocode.discount_value,
        valid=True
    )
