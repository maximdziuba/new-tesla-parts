from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from database import get_session
from models import Customer, EmailList, CustomerEmailListLink
from dependencies import get_current_admin
from services.email import email_service
from services.crypto import decrypt_value
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/email-campaigns", tags=["email-campaigns"])

# --- Schemas ---
class EmailListCreate(BaseModel):
    name: str
    customer_ids: Optional[List[int]] = []

class EmailListCustomerRead(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class EmailListRead(BaseModel):
    id: int
    name: str
    created_at: str
    customers: List[EmailListCustomerRead] = []

class SendCampaignRequest(BaseModel):
    subject: str
    body: str

class SendDirectCampaignRequest(BaseModel):
    subject: str
    body: str
    customer_ids: Optional[List[int]] = []
    emails: Optional[List[str]] = []

# --- Helper sending task ---
def send_bulk_emails(recipients: List[str], subject: str, body: str):
    for email in recipients:
        email_service.send_custom_email(email, subject, body)

# --- Routes ---

@router.get("/lists", response_model=List[EmailListRead], dependencies=[Depends(get_current_admin)])
def get_email_lists(session: Session = Depends(get_session)):
    lists = session.exec(select(EmailList)).all()
    result = []
    for el in lists:
        customers_read = []
        for c in el.customers:
            customers_read.append(EmailListCustomerRead(
                id=c.id,
                email=decrypt_value(c.email),
                first_name=decrypt_value(c.first_name),
                last_name=decrypt_value(c.last_name)
            ))
        result.append(EmailListRead(
            id=el.id,
            name=el.name,
            created_at=el.created_at.isoformat(),
            customers=customers_read
        ))
    return result

@router.post("/lists", response_model=EmailListRead, dependencies=[Depends(get_current_admin)])
def create_email_list(data: EmailListCreate, session: Session = Depends(get_session)):
    email_list = EmailList(name=data.name)
    session.add(email_list)
    session.commit()
    session.refresh(email_list)
    
    if data.customer_ids:
        for cid in data.customer_ids:
            customer = session.get(Customer, cid)
            if customer:
                link = CustomerEmailListLink(customer_id=cid, email_list_id=email_list.id)
                session.add(link)
        session.commit()
        session.refresh(email_list)
        
    customers_read = []
    for c in email_list.customers:
        customers_read.append(EmailListCustomerRead(
            id=c.id,
            email=decrypt_value(c.email),
            first_name=decrypt_value(c.first_name),
            last_name=decrypt_value(c.last_name)
        ))
        
    return EmailListRead(
        id=email_list.id,
        name=email_list.name,
        created_at=email_list.created_at.isoformat(),
        customers=customers_read
    )

@router.delete("/lists/{list_id}", dependencies=[Depends(get_current_admin)])
def delete_email_list(list_id: int, session: Session = Depends(get_session)):
    email_list = session.get(EmailList, list_id)
    if not email_list:
        raise HTTPException(status_code=404, detail="Список розсилки не знайдено")
    session.delete(email_list)
    session.commit()
    return {"message": "Список розсилки успішно видалено"}

@router.post("/lists/{list_id}/send", dependencies=[Depends(get_current_admin)])
def send_campaign_to_list(
    list_id: int,
    req: SendCampaignRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    email_list = session.get(EmailList, list_id)
    if not email_list:
        raise HTTPException(status_code=404, detail="Список розсилки не знайдено")
        
    recipients = [decrypt_value(c.email) for c in email_list.customers if c.email]
    if not recipients:
        raise HTTPException(status_code=400, detail="Цей список розсилки порожній")
        
    background_tasks.add_task(send_bulk_emails, recipients, req.subject, req.body)
    return {"message": f"Розсилку запущено для {len(recipients)} отримувачів"}

@router.post("/send-direct", dependencies=[Depends(get_current_admin)])
def send_direct_campaign(
    req: SendDirectCampaignRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    recipients = []
    
    # Custom emails
    if req.emails:
        for email in req.emails:
            if email.strip():
                recipients.append(email.strip())
                
    # Targeted customer IDs
    if req.customer_ids:
        for cid in req.customer_ids:
            customer = session.get(Customer, cid)
            if customer and customer.email:
                recipients.append(decrypt_value(customer.email))
                
    # Unique recipients
    recipients = list(set(recipients))
    if not recipients:
        raise HTTPException(status_code=400, detail="Не вказано жодного отримувача")
        
    background_tasks.add_task(send_bulk_emails, recipients, req.subject, req.body)
    return {"message": f"Розсилку запущено для {len(recipients)} отримувачів"}
