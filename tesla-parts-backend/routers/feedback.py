from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import Feedback
from schemas import FeedbackRead
from services.image_uploader import image_uploader
from dependencies import get_current_admin

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.get("/", response_model=List[FeedbackRead])
async def get_feedback(session: Session = Depends(get_session)):
    statement = select(Feedback).order_by(Feedback.sort_order.desc(), Feedback.created_at.desc())
    results = session.exec(statement).all()
    return results

@router.post("/", response_model=FeedbackRead)
async def create_feedback(
    file: UploadFile = File(...),
    sort_order: int = Form(0),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_admin)
):
    image_url = await image_uploader.upload_image(file, folder="feedback")
    if not image_url:
        raise HTTPException(status_code=400, detail="Failed to upload image")
    
    feedback = Feedback(image_url=image_url, sort_order=sort_order)
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback

@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_admin)
):
    feedback = session.get(Feedback, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    session.delete(feedback)
    session.commit()
    return {"message": "Feedback deleted"}

@router.put("/{feedback_id}/sort")
async def update_feedback_sort(
    feedback_id: int,
    sort_order: int = Form(...),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_admin)
):
    feedback = session.get(Feedback, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.sort_order = sort_order
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback
