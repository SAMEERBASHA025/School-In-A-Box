from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Exam & Quiz Reminders"])

@router.post("/reminders", response_model=schemas.ExamReminderResponse)
def create_reminder(
    reminder: schemas.ExamReminderCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_exam_reminder(db, reminder, current_user.id)

@router.get("/reminders", response_model=list[schemas.ExamReminderResponse])
def get_reminders(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_exam_reminders(db, current_user.id)

@router.delete("/reminders/{id}")
def delete_reminder(
    id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_exam_reminder(db, id, current_user.id)
    if not success:
         raise HTTPException(
             status_code=status.HTTP_404_NOT_FOUND,
             detail="Reminder not found or unauthorized"
         )
    return {"message": "Reminder removed successfully"}
