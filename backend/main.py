import os
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import auth
import crud
import schemas

# Import Routers
from routers.auth_router import router as auth_router
from routers.notes_router import router as notes_router
from routers.ai_router import router as ai_router
from routers.quiz_router import router as quiz_router
from routers.progress_router import router as progress_router
from routers.admin_router import router as admin_router
from routers.attendance_router import router as attendance_router
from routers.reminder_router import router as reminder_router
from routers.notification_router import router as notification_router
from routers.feedback_router import router as feedback_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="School-In-A-Box API",
    description="Backend API for the School-In-A-Box AI-powered digital learning platform.",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)
# Serve uploaded PDFs statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(notes_router)
app.include_router(ai_router)
app.include_router(quiz_router, prefix="/quiz")
app.include_router(progress_router)
app.include_router(admin_router)
app.include_router(attendance_router)
app.include_router(reminder_router)
app.include_router(notification_router)
app.include_router(feedback_router)


@app.get("/")
def root():
    return {"message": "Welcome to School-In-A-Box API. Please head to /docs for Swagger documentation."}


@app.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_database(db: Session = Depends(get_db)):
    """
    Seeds database with demo accounts, sample quizzes, and initial questions.
    """
    # 1. Seed Users
    users_data = [
        {"name": "Alice Student", "email": "student@school.com", "role": "Student"},
        {"name": "Bob Teacher", "email": "teacher@school.com", "role": "Teacher"},
        {"name": "Charlie Admin", "email": "admin@school.com", "role": "Admin"}
    ]
    
    seeded_users = []
    for u in users_data:
        existing = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not existing:
            hashed_pw = auth.get_password_hash("password")
            db_user = models.User(
                name=u["name"],
                email=u["email"],
                password=hashed_pw,
                role=u["role"]
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            if db_user.role == "Student":
                db_progress = models.Progress(
                    user_id=db_user.id,
                    completed_notes=0,
                    quizzes_completed=0,
                    study_hours=0.0
                )
                db.add(db_progress)
                db.commit()
            seeded_users.append(db_user)
        else:
            seeded_users.append(existing)

    # 2. Seed Quizzes and Questions
    quizzes_data = [
        {
            "title": "Introduction to Python Programming",
            "difficulty": "Easy",
            "questions": [
                {
                    "question": "What is the output of print(type([]) in Python?",
                    "optionA": "<class 'list'>",
                    "optionB": "<class 'dict'>",
                    "optionC": "<class 'tuple'>",
                    "optionD": "<class 'set'>",
                    "answer": "A"
                },
                {
                    "question": "Which of the following is used to define a block of code in Python?",
                    "optionA": "Curly braces",
                    "optionB": "Parentheses",
                    "optionC": "Indentation",
                    "optionD": "Semicolons",
                    "answer": "C"
                },
                {
                    "question": "How do you start a comment in Python?",
                    "optionA": "//",
                    "optionB": "#",
                    "optionC": "/*",
                    "optionD": "<!--",
                    "answer": "B"
                }
            ]
        },
        {
            "title": "Machine Learning & AI Basics",
            "difficulty": "Medium",
            "questions": [
                {
                    "question": "What does RAG stand for in the context of Large Language Models?",
                    "optionA": "Random Access Generation",
                    "optionB": "Retrieval-Augmented Generation",
                    "optionC": "Regularized Autoencoder Gradient",
                    "optionD": "Recurrent Adversarial Graph",
                    "answer": "B"
                },
                {
                    "question": "Which type of machine learning model learns without labeled training data?",
                    "optionA": "Supervised Learning",
                    "optionB": "Reinforcement Learning",
                    "optionC": "Unsupervised Learning",
                    "optionD": "Semi-supervised Learning",
                    "answer": "C"
                },
                {
                    "question": "What is ChromaDB primarily used for?",
                    "optionA": "Storing images and video files",
                    "optionB": "Relational SQL database storage",
                    "optionC": "Vector embeddings database for semantic search",
                    "optionD": "Key-value cache storing session states",
                    "answer": "C"
                }
            ]
        }
    ]

    seeded_quizzes_count = 0
    for q_data in quizzes_data:
        existing_quiz = db.query(models.Quiz).filter(models.Quiz.title == q_data["title"]).first()
        if not existing_quiz:
            db_quiz = models.Quiz(title=q_data["title"], difficulty=q_data["difficulty"])
            db.add(db_quiz)
            db.commit()
            db.refresh(db_quiz)
            
            for quest in q_data["questions"]:
                db_question = models.Question(
                    quiz_id=db_quiz.id,
                    question=quest["question"],
                    optionA=quest["optionA"],
                    optionB=quest["optionB"],
                    optionC=quest["optionC"],
                    optionD=quest["optionD"],
                    answer=quest["answer"]
                )
                db.add(db_question)
            db.commit()
            seeded_quizzes_count += 1

    return {
        "message": "Database seeded successfully!",
        "seeded_users": [u.email for u in seeded_users],
        "seeded_quizzes_count": seeded_quizzes_count
    }
