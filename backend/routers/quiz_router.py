from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
import crud

router = APIRouter(tags=["Quizzes"])

@router.post("", response_model=schemas.QuizResponse)
def create_new_quiz(
    quiz: schemas.QuizCreate,
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    db_quiz = crud.create_quiz(db, quiz, current_user.id)
    # Trigger notification
    try:
        crud.create_broadcast_notification(
            db,
            title="New Timed Quiz",
            message=f"A new '{db_quiz.title}' ({db_quiz.difficulty}) quiz has been published."
        )
    except Exception as ne:
        print(f"Quiz notification trigger failed: {ne}")
    return db_quiz

@router.get("", response_model=list[schemas.QuizResponse])
def get_all_quizzes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_quizzes(db)

@router.get("/{id}", response_model=schemas.QuizWithQuestionsResponse)
def get_quiz_by_id(
    id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_quiz = crud.get_quiz(db, id)
    if not db_quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    return db_quiz

@router.put("/{id}", response_model=schemas.QuizResponse)
def update_quiz_by_id(
    id: int,
    quiz_update: schemas.QuizUpdate,
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    updated = crud.update_quiz(db, id, quiz_update)
    if not updated:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    return updated

@router.delete("/{id}")
def delete_quiz_by_id(
    id: int,
    current_user: models.User = Depends(auth.require_teacher),
    db: Session = Depends(get_db)
):
    success = crud.delete_quiz(db, id)
    if not success:
         raise HTTPException(
             status_code=status.HTTP_404_NOT_FOUND,
             detail="Quiz not found"
         )
    return {"message": "Quiz deleted successfully"}

@router.post("/submit", response_model=schemas.QuizAttemptResponse)
def submit_quiz(
    payload: schemas.QuizSubmitRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == payload.quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_440_NOT_FOUND,
            detail="Quiz not found"
        )
        
    questions = quiz.questions
    questions_map = {q.id: q for q in questions}
    
    score = 0
    total_questions = len(questions)
    
    for ans in payload.answers:
        q = questions_map.get(ans.question_id)
        if q and q.answer.strip().upper() == ans.selected_option.strip().upper():
            score += 1
            
    attempt = crud.create_quiz_attempt(
        db,
        user_id=current_user.id,
        quiz_id=payload.quiz_id,
        score=score,
        total_questions=total_questions
    )
    
    # Attach title for the UI schema
    attempt.quiz_title = quiz.title
    return attempt

@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry])
def get_quiz_leaderboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_leaderboard(db)
