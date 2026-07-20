from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Progress & Analytics"])

@router.get("/progress", response_model=schemas.ProgressResponse)
def get_user_progress(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    progress = crud.get_progress(db, current_user.id)
    if not progress:
        # Return empty progress values
        return schemas.ProgressResponse(completed_notes=0, quizzes_completed=0, study_hours=0.0)
    return progress

@router.get("/progress/dashboard", response_model=schemas.StudentDashboardData)
def get_student_dashboard_analytics(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_student_dashboard(db, current_user.id)

@router.get("/progress/teacher", response_model=schemas.TeacherDashboardData)
def get_teacher_dashboard_analytics(
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    return crud.get_teacher_dashboard(db, current_user.id)
