from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import secrets

from database import get_session
from models import ApiKey
from schemas import ApiKeyRead, ApiKeyCreate, ApiKeyCreateResponse
from dependencies import get_current_admin
from auth import get_password_hash

router = APIRouter(
    prefix="/apikeys",
    tags=["apikeys"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("/", response_model=List[ApiKeyRead])
def list_api_keys(session: Session = Depends(get_session)):
    keys = session.exec(select(ApiKey).order_by(ApiKey.created_at.desc())).all()
    return keys

@router.post("/", response_model=ApiKeyCreateResponse)
def create_api_key(payload: ApiKeyCreate, session: Session = Depends(get_session)):
    # Generate new key: 8 char prefix + 32 char secret
    prefix = secrets.token_urlsafe(8)[:8]
    secret = secrets.token_urlsafe(32)
    raw_key = f"{prefix}.{secret}"
    
    hashed_secret = get_password_hash(secret)
    
    new_key = ApiKey(
        name=payload.name,
        key_prefix=prefix,
        hashed_key=hashed_secret,
        discount_percent=payload.discount_percent
    )
    
    session.add(new_key)
    session.commit()
    session.refresh(new_key)
    
    response = ApiKeyCreateResponse(
        id=new_key.id,
        name=new_key.name,
        key_prefix=new_key.key_prefix,
        discount_percent=new_key.discount_percent,
        requests_this_month=new_key.requests_this_month,
        is_active=new_key.is_active,
        created_at=new_key.created_at,
        raw_key=raw_key
    )
    return response

@router.put("/{key_id}/revoke", response_model=ApiKeyRead)
def revoke_api_key(key_id: int, session: Session = Depends(get_session)):
    key = session.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
        
    key.is_active = False
    session.add(key)
    session.commit()
    session.refresh(key)
    return key

@router.delete("/{key_id}")
def delete_api_key(key_id: int, session: Session = Depends(get_session)):
    key = session.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
        
    session.delete(key)
    session.commit()
    return {"message": "API Key deleted"}
