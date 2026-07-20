import os
import shutil
import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud
from services import ai_service

router = APIRouter(tags=["Notes"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.NoteResponse)
def upload_note(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_student), # Students, Teachers, Admins can upload
    db: Session = Depends(get_db)
):
    allowed_extensions = (".pdf", ".mp3", ".mp4", ".wav", ".m4a", ".mpeg")
    filename_lower = file.filename.lower()
    if not filename_lower.endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Supported: {', '.join(allowed_extensions)}"
        )
        
    # Generate unique filename to prevent collisions
    filename = f"{current_user.id}_{int(time.time())}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save file on local disk
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    # Save metadata in SQL DB
    db_note = crud.create_note(db, title=title, filename=filename, uploaded_by=current_user.id)
    
    # Run text extraction/transcription based on file type
    if filename_lower.endswith(".pdf"):
        indexed = ai_service.process_pdf(filepath, db_note.id)
    else:
        indexed = ai_service.process_video(filepath, db_note.id, db)
        
    if not indexed:
         print(f"Warning: File indexing in vector store failed for Note ID: {db_note.id}")
         
    # Trigger notification
    try:
        uploader = db.query(models.User).filter(models.User.id == current_user.id).first()
        uploader_name = uploader.name if uploader else "Instructor"
        crud.create_broadcast_notification(
            db,
            title="New Study Material",
            message=f"'{title}' has been uploaded by {uploader_name} in the Library."
        )
    except Exception as ne:
        print(f"Notification trigger failed: {ne}")
         
    return db_note

@router.get("/notes", response_model=list[schemas.NoteResponse])
def get_all_notes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_notes(db)

@router.get("/notes/{id}", response_model=schemas.NoteResponse)
def get_note_by_id(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = crud.get_note(db, id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return db_note

@router.get("/notes/{id}/download")
def download_note_file(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = crud.get_note(db, id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    filepath = os.path.join(UPLOAD_DIR, db_note.filename)
    if not os.path.exists(filepath):
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File does not exist on disk"
        )
    return FileResponse(filepath, filename=db_note.filename, media_type="application/pdf")

@router.delete("/notes/{id}")
def delete_note_by_id(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_teacher)):
    db_note = crud.get_note(db, id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
        
    # Delete from disk
    filepath = os.path.join(UPLOAD_DIR, db_note.filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Error deleting file from disk: {str(e)}")
            
    # Delete from DB
    crud.delete_note(db, id)
    return {"message": "Note deleted successfully"}


@router.get("/notes/{id}/content")
def get_note_text_content(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_note = crud.get_note(db, id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    filepath = os.path.join(UPLOAD_DIR, db_note.filename)
    if not os.path.exists(filepath):
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content file does not exist on disk"
        )
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read content: {str(e)}"
        )
