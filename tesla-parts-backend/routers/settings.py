from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Settings
from pydantic import BaseModel
from typing import List
from schemas import SocialLinks
import os
from dependencies import get_current_admin



router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

class SettingUpdate(BaseModel):
    value: str

@router.get("/social-links", response_model=SocialLinks)
def get_social_links(session: Session = Depends(get_session)):
    instagram_link = session.get(Settings, "instagram_link")
    telegram_link = session.get(Settings, "telegram_link")
    viber_link = session.get(Settings, "viber_link")
    whatsapp_link = session.get(Settings, "whatsapp_link")
    return SocialLinks(
        instagram=instagram_link.value if instagram_link else "",
        telegram=telegram_link.value if telegram_link else "",
        viber=viber_link.value if viber_link else "",
        whatsapp=whatsapp_link.value if whatsapp_link else ""
    )

@router.post("/social-links", dependencies=[Depends(get_current_admin)])
def update_social_links(links: SocialLinks, session: Session = Depends(get_session)):
    for key, value in links.model_dump().items():
        db_key = f"{key}_link"
        setting = session.get(Settings, db_key)
        if not setting:
            setting = Settings(key=db_key, value=value or "")
            session.add(setting)
        else:
            setting.value = value or ""
            session.add(setting)

    session.commit()
    return {"message": "Social links updated successfully"}


@router.get("/", dependencies=[Depends(get_current_admin)])
def get_all_settings(session: Session = Depends(get_session)):
    settings = session.exec(select(Settings)).all()
    return settings

@router.get("/{key}")
def get_setting(key: str, session: Session = Depends(get_session)):
    setting = session.get(Settings, key)
    if not setting:
        # Return defaults if not found
        if key == "exchange_rate":
            return {"key": key, "value": "40.0"}
        return {"key": key, "value": ""}
    return setting

@router.post("/{key}", dependencies=[Depends(get_current_admin)])
def update_setting(key: str, update: SettingUpdate, session: Session = Depends(get_session)):
    setting = session.get(Settings, key)
    if not setting:
        setting = Settings(key=key, value=update.value)
        session.add(setting)
    else:
        setting.value = update.value
        session.add(setting)
    session.commit()
    session.refresh(setting)
    return setting
