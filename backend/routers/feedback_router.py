from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Teacher Feedback"])

@router.post("/feedback", response_model=schemas.FeedbackResponse)
def submit_feedback(
    feedback: schemas.FeedbackCreate,
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    student = crud.get_user(db, feedback.student_id)
    if not student or student.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid student ID"
        )
    db_fb = crud.create_feedback(db, feedback, current_user.id)
    
    # Send a notification to the student about the feedback
    crud.create_notification(
        db,
        title="New Teacher Feedback",
        message=f"Teacher {current_user.name} submitted a progress advice review for you.",
        user_id=student.id
    )
    
    return {
        "id": db_fb.id,
        "student_id": db_fb.student_id,
        "teacher_id": db_fb.teacher_id,
        "feedback_text": db_fb.feedback_text,
        "created_at": db_fb.created_at,
        "teacher_name": current_user.name
    }

@router.get("/feedback/student", response_model=list[schemas.FeedbackResponse])
def get_my_feedback(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_student_feedbacks(db, current_user.id)
