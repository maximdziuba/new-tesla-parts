from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, delete
from models import User, UserSession
from database import get_session
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    verify_password,
    get_password_hash,
)
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class ResetPasswordRequest(BaseModel):
    old_password: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

def set_auth_cookies(response: Response, request: Request, access_token: str, refresh_token: str):
    # Dynamic domain check: if on production domain, set shared cookie across subdomains
    host = request.headers.get("host", "")
    domain = None
    if "teslafix.com.ua" in host:
        domain = ".teslafix.com.ua"
        
    response.set_cookie(
        key="accessToken",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        domain=domain,
        max_age=30 * 24 * 3600 # 30 days
    )
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        domain=domain,
        max_age=30 * 24 * 3600 # 30 days
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильне ім'я користувача чи пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Optional: clean up expired sessions for this user
    session.exec(delete(UserSession).where(UserSession.user_id == user.id, UserSession.expires_at < datetime.utcnow()))
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    refresh_token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_session = UserSession(user_id=user.id, refresh_token=refresh_token, expires_at=expires_at)
    session.add(new_session)
    session.commit()

    # Set secure HttpOnly cookies
    set_auth_cookies(response, request, access_token, refresh_token)

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/reset-password")
async def reset_admin_password(
    request: ResetPasswordRequest, session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == "admin")).first()
    if not user:
        raise HTTPException(status_code=500, detail="Admin user not found.")

    if not verify_password(request.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect old password",
        )

    user.hashed_password = get_password_hash(request.new_password)
    session.add(user)
    
    # Optional: delete all active sessions for security on password change
    session.exec(delete(UserSession).where(UserSession.user_id == user.id))
    
    session.commit()
    return {"message": "Admin password reset successfully."}

@router.post("/refresh-token", response_model=Token)
async def refresh_access_token(
    response: Response,
    fastapi_request: Request,
    request_data: Optional[RefreshTokenRequest] = None,
    session: Session = Depends(get_session)
):
    refresh_token = None
    if request_data:
        refresh_token = request_data.refresh_token
        
    if not refresh_token:
        refresh_token = fastapi_request.cookies.get("refreshToken") or fastapi_request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db_session = session.exec(
        select(UserSession).where(UserSession.refresh_token == refresh_token)
    ).first()

    if not db_session or db_session.expires_at < datetime.utcnow():
        if db_session:
            session.delete(db_session)
            session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = session.get(User, db_session.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    new_refresh_token = str(uuid.uuid4())
    db_session.refresh_token = new_refresh_token
    db_session.expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    session.add(db_session)
    session.commit()

    # Set secure HttpOnly cookies
    set_auth_cookies(response, fastapi_request, new_access_token, new_refresh_token)

    return {"access_token": new_access_token, "token_type": "bearer", "refresh_token": new_refresh_token}

@router.post("/logout")
async def logout(response: Response, fastapi_request: Request, session: Session = Depends(get_session)):
    host = fastapi_request.headers.get("host", "")
    domain = None
    if "teslafix.com.ua" in host:
        domain = ".teslafix.com.ua"
        
    refresh_token = fastapi_request.cookies.get("refreshToken") or fastapi_request.cookies.get("refresh_token")
    if refresh_token:
        db_session = session.exec(
            select(UserSession).where(UserSession.refresh_token == refresh_token)
        ).first()
        if db_session:
            session.delete(db_session)
            session.commit()
            
    response.delete_cookie("accessToken", domain=domain)
    response.delete_cookie("access_token", domain=domain)
    response.delete_cookie("refreshToken", domain=domain)
    response.delete_cookie("refresh_token", domain=domain)
    return {"message": "Logged out successfully"}
