from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Admin Operations"])

@router.get("/admin/dashboard", response_model=schemas.AdminDashboardData)
def get_admin_dashboard_stats(
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return crud.get_admin_dashboard(db)

@router.get("/admin/users", response_model=list[schemas.UserResponse])
def admin_list_users(
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return crud.get_all_users(db)

@router.post("/admin/users", response_model=schemas.UserResponse)
def admin_create_user(
    user_payload: schemas.UserCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    existing = crud.get_user_by_email(db, user_payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_user(db, user_payload)

@router.delete("/admin/users/{id}")
def admin_delete_user(
    id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    if current_user.id == id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot delete their own account"
        )
    success = crud.delete_user(db, id)
    if not success:
         raise HTTPException(
             status_code=status.HTTP_404_NOT_FOUND,
             detail="User not found"
         )
    return {"message": "User deleted successfully"}
