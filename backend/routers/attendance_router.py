from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Attendance Tracking"])

@router.post("/attendance/check-in", response_model=schemas.AttendanceResponse)
def check_in_today(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.mark_attendance(db, current_user.id)

@router.get("/attendance/history", response_model=list[schemas.AttendanceResponse])
def get_user_attendance_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_attendance_history(db, current_user.id)

@router.get("/attendance/teacher")
def get_classroom_attendance(
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    # Retrieve all student attendance records joined with User info
    results = db.query(
        models.Attendance.id,
        models.User.name,
        models.User.email,
        models.Attendance.date,
        models.Attendance.status,
        models.Attendance.timestamp
    ).join(models.User, models.User.id == models.Attendance.user_id)\
     .order_by(models.Attendance.timestamp.desc()).all()
     
    return [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "date": r[3],
            "status": r[4],
            "timestamp": r[5]
        }
        for r in results
    ]
