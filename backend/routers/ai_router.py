from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud
from services import ai_service
import os
import uuid

router = APIRouter(tags=["AI Chat"])

@router.post("/chat", response_model=schemas.ChatResponse)
def chat_with_pdf(
    payload: schemas.ChatQuery,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty"
        )
        
    # Get answer from RAG chain
    answer = ai_service.query_pdf(payload.question, payload.note_id)
    
    # Store chat history in DB
    chat_entry = crud.create_chat_history(
        db,
        user_id=current_user.id,
        question=payload.question,
        answer=answer
    )
    
    return chat_entry

@router.get("/chat/history", response_model=list[schemas.ChatResponse])
def get_chat_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_chat_history_by_user(db, current_user.id)


@router.post("/chat/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    temp_dir = "temp_voice"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"voice_{uuid.uuid4().hex}_{file.filename}")
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    try:
        client = ai_service.get_openai_client()
        with open(temp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        transcription_text = transcript.text
    except Exception as e:
        transcription_text = f"Transcription error: {str(e)}"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return {"text": transcription_text}
