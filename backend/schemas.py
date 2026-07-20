from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Student" # Student, Teacher, Admin

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str


# --- Note Schemas ---
class NoteResponse(BaseModel):
    id: int
    title: str
    filename: str
    uploaded_by: int
    upload_date: datetime

    class Config:
        from_attributes = True


# --- Quiz & Question Schemas ---
class QuestionCreate(BaseModel):
    question: str
    optionA: str
    optionB: str
    optionC: str
    optionD: str
    answer: str  # "A", "B", "C", "D"

class QuestionResponse(QuestionCreate):
    id: int
    quiz_id: int

    class Config:
        from_attributes = True

class QuizCreate(BaseModel):
    title: str
    difficulty: str = "Medium"
    questions: List[QuestionCreate]

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    difficulty: str

    class Config:
        from_attributes = True

class QuizWithQuestionsResponse(QuizResponse):
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


# --- Quiz Attempt Schemas ---
class QuizSubmitAnswer(BaseModel):
    question_id: int
    selected_option: str  # "A", "B", "C", "D"

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: List[QuizSubmitAnswer]

class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    score: int
    total_questions: int
    timestamp: datetime
    quiz_title: Optional[str] = None

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_name: str
    user_email: str
    score: int
    total_questions: int
    quiz_title: str
    timestamp: datetime


# --- Chat History Schemas ---
class ChatQuery(BaseModel):
    question: str
    note_id: Optional[int] = None # Optional limit to specific document context

class ChatResponse(BaseModel):
    question: str
    answer: str
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Progress Schemas ---
class ProgressResponse(BaseModel):
    completed_notes: int
    quizzes_completed: int
    study_hours: float

    class Config:
        from_attributes = True


# --- Attendance & Exam Reminder Schemas ---
class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ExamReminderCreate(BaseModel):
    title: str
    exam_date: str  # "YYYY-MM-DD"
    prep_notes: Optional[str] = None

class ExamReminderResponse(ExamReminderCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Notification & Feedback Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    student_id: int
    feedback_text: str

class FeedbackResponse(FeedbackCreate):
    id: int
    teacher_id: int
    created_at: datetime
    teacher_name: str

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---
class RecentActivity(BaseModel):
    type: str # "note_upload", "quiz_attempt", "ai_question"
    description: str
    timestamp: datetime

class StudentDashboardData(BaseModel):
    uploaded_notes: int
    total_quizzes: int
    quiz_scores: List[int]
    ai_questions_asked: int
    study_progress: float # 0 to 100 percentage
    recent_activity: List[RecentActivity]
    weekly_study_hours: List[float] # Mon to Sun hours array
    quiz_performance: List[dict] # { quiz_title: str, score: int }
    attendance_rate: float
    upcoming_alarms: List[ExamReminderResponse]

class TeacherDashboardData(BaseModel):
    total_notes_uploaded: int
    total_quizzes_created: int
    total_students_enrolled: int
    average_quiz_score: float
    recent_activity: List[RecentActivity]
    students_performance: List[dict] # { name: str, email: str, quizzes_completed: int, avg_score: float }

class AdminDashboardData(BaseModel):
    total_users: int
    total_teachers: int
    total_students: int
    total_notes: int
    storage_used_mb: float
    activity_logs: List[RecentActivity]
    user_growth: List[dict] # { month: str, count: int }
