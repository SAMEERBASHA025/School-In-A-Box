from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Notifications"])

@router.get("/notifications", response_model=list[schemas.NotificationResponse])
def get_my_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_notifications(db, current_user.id)

@router.post("/notifications/read")
def mark_my_notifications_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    crud.mark_notifications_as_read(db, current_user.id)
    return {"message": "Notifications marked as read"}
