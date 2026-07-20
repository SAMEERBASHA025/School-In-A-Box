import os
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
import auth

# --- User CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize progress table for Students
    if db_user.role == "Student":
        db_progress = models.Progress(user_id=db_user.id)
        db.add(db_progress)
        db.commit()
        
    return db_user

def update_user(db: Session, user_id: int, profile: schemas.ProfileUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    if profile.name is not None:
        db_user.name = profile.name
    if profile.email is not None:
        db_user.email = profile.email
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, user_id: int, new_password_hash: str):
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db_user.password = new_password_hash
    db.commit()
    return True

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

def get_all_users(db: Session):
    return db.query(models.User).all()


# --- Note CRUD ---
def create_note(db: Session, title: str, filename: str, uploaded_by: int):
    db_note = models.Note(
        title=title,
        filename=filename,
        uploaded_by=uploaded_by
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Increment study progress completed_notes count or log activity
    # Check if Progress exists, if not create one
    progress = db.query(models.Progress).filter(models.Progress.user_id == uploaded_by).first()
    if progress:
        # Just update completion metrics
        progress.completed_notes = progress.completed_notes + 1
        db.commit()
        
    return db_note

def get_notes(db: Session):
    return db.query(models.Note).all()

def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def delete_note(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True


# --- Quiz CRUD ---
def create_quiz(db: Session, quiz: schemas.QuizCreate, created_by_id: int):
    db_quiz = models.Quiz(
        title=quiz.title,
        difficulty=quiz.difficulty
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    # Add questions
    for q in quiz.questions:
        db_question = models.Question(
            quiz_id=db_quiz.id,
            question=q.question,
            optionA=q.optionA,
            optionB=q.optionB,
            optionC=q.optionC,
            optionD=q.optionD,
            answer=q.answer
        )
        db.add(db_question)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

def get_quizzes(db: Session):
    return db.query(models.Quiz).all()

def get_quiz(db: Session, quiz_id: int):
    return db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()

def update_quiz(db: Session, quiz_id: int, quiz_update: schemas.QuizUpdate):
    db_quiz = get_quiz(db, quiz_id)
    if not db_quiz:
        return None
    if quiz_update.title is not None:
        db_quiz.title = quiz_update.title
    if quiz_update.difficulty is not None:
        db_quiz.difficulty = quiz_update.difficulty
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

def delete_quiz(db: Session, quiz_id: int):
    db_quiz = get_quiz(db, quiz_id)
    if not db_quiz:
        return False
    db.delete(db_quiz)
    db.commit()
    return True


# --- Quiz Attempt CRUD ---
def create_quiz_attempt(db: Session, user_id: int, quiz_id: int, score: int, total_questions: int):
    db_attempt = models.QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=total_questions
    )
    db.add(db_attempt)
    
    # Update user progress
    progress = db.query(models.Progress).filter(models.Progress.user_id == user_id).first()
    if progress:
        progress.quizzes_completed += 1
        progress.study_hours += 0.5 # Add estimated study time per quiz
    else:
        new_progress = models.Progress(
            user_id=user_id,
            quizzes_completed=1,
            study_hours=0.5
        )
        db.add(new_progress)
        
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

def get_attempts_by_user(db: Session, user_id: int):
    return db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == user_id).all()

def get_leaderboard(db: Session, limit: int = 10):
    results = db.query(
        models.User.name,
        models.User.email,
        models.QuizAttempt.score,
        models.QuizAttempt.total_questions,
        models.Quiz.title,
        models.QuizAttempt.timestamp
    ).join(models.User, models.User.id == models.QuizAttempt.user_id)\
     .join(models.Quiz, models.Quiz.id == models.QuizAttempt.quiz_id)\
     .order_by(models.QuizAttempt.score.desc())\
     .limit(limit).all()
     
    leaderboard = []
    for r in results:
        leaderboard.append(schemas.LeaderboardEntry(
            user_name=r[0],
            user_email=r[1],
            score=r[2],
            total_questions=r[3],
            quiz_title=r[4],
            timestamp=r[5]
        ))
    return leaderboard


# --- Chat History CRUD ---
def create_chat_history(db: Session, user_id: int, question: str, answer: str):
    db_chat = models.ChatHistory(
        user_id=user_id,
        question=question,
        answer=answer
    )
    db.add(db_chat)
    
    # Increment study hours slightly for asking AI questions
    progress = db.query(models.Progress).filter(models.Progress.user_id == user_id).first()
    if progress:
        progress.study_hours += 0.1 # Add 6 minutes of study time
    db.commit()
    db.refresh(db_chat)
    return db_chat

def get_chat_history_by_user(db: Session, user_id: int):
    return db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).order_by(models.ChatHistory.timestamp.asc()).all()


# --- Progress CRUD ---
def get_progress(db: Session, user_id: int):
    return db.query(models.Progress).filter(models.Progress.user_id == user_id).first()


# --- Dashboard Visualizers ---
def get_student_dashboard(db: Session, user_id: int) -> schemas.StudentDashboardData:
    uploaded_notes_count = db.query(models.Note).count()
    total_quizzes_count = db.query(models.Quiz).count()
    
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == user_id).all()
    quiz_scores = [att.score for att in attempts]
    
    ai_questions_count = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).count()
    
    progress = get_progress(db, user_id)
    study_progress_percent = 0.0
    if progress:
        # Calculate progress based on quizzes completed & notes uploaded, cap at 100%
        # e.g., Let's say target is 5 notes and 5 quizzes completed
        total_target = 10.0
        completed = progress.completed_notes + progress.quizzes_completed
        study_progress_percent = min(100.0, (completed / total_target) * 100.0) if total_target > 0 else 0.0
        
    # Build recent activities
    recent_activity = []
    
    # 1. Notes uploaded
    notes = db.query(models.Note).order_by(models.Note.upload_date.desc()).limit(3).all()
    for n in notes:
        recent_activity.append(schemas.RecentActivity(
            type="note_upload",
            description=f"New study material uploaded: {n.title}",
            timestamp=n.upload_date
        ))
        
    # 2. Quiz attempts
    user_attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == user_id)\
        .order_by(models.QuizAttempt.timestamp.desc()).limit(3).all()
    for att in user_attempts:
        quiz = db.query(models.Quiz).filter(models.Quiz.id == att.quiz_id).first()
        title = quiz.title if quiz else "Quiz"
        recent_activity.append(schemas.RecentActivity(
            type="quiz_attempt",
            description=f"Attempted quiz '{title}' and scored {att.score}/{att.total_questions}",
            timestamp=att.timestamp
        ))
        
    # 3. AI chat questions
    chats = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id)\
        .order_by(models.ChatHistory.timestamp.desc()).limit(3).all()
    for c in chats:
        recent_activity.append(schemas.RecentActivity(
            type="ai_question",
            description=f"Asked AI: \"{c.question[:40]}...\"",
            timestamp=c.timestamp
        ))
        
    recent_activity = sorted(recent_activity, key=lambda x: x.timestamp, reverse=True)[:5]
    
    # Weekly study hours (Mon-Sun mock distribution based on progress.study_hours)
    base_hours = progress.study_hours if progress else 2.0
    # spread base hours across the week
    weekly_study_hours = [
        round(base_hours * 0.1, 1),
        round(base_hours * 0.15, 1),
        round(base_hours * 0.25, 1),
        round(base_hours * 0.1, 1),
        round(base_hours * 0.2, 1),
        round(base_hours * 0.1, 1),
        round(base_hours * 0.1, 1)
    ]
    
    # Quiz performance detail
    quiz_perf = []
    for att in attempts:
        quiz = db.query(models.Quiz).filter(models.Quiz.id == att.quiz_id).first()
        if quiz:
            quiz_perf.append({
                "quiz_title": quiz.title,
                "score": att.score,
                "total": att.total_questions
            })
            
    # Calculate attendance rate
    user = db.query(models.User).filter(models.User.id == user_id).first()
    present_days = db.query(models.Attendance).filter(models.Attendance.user_id == user_id, models.Attendance.status == "Present").count()
    if user:
        # Calculate days since signup (at least 1)
        days_since_signup = max(1, (datetime.datetime.utcnow().date() - user.created_at.date()).days + 1)
        attendance_rate = min(100.0, (present_days / days_since_signup) * 100.0)
    else:
        attendance_rate = 0.0

    # Fetch reminders
    upcoming_reminders = db.query(models.ExamReminder).filter(models.ExamReminder.user_id == user_id).order_by(models.ExamReminder.exam_date.asc()).all()

    return schemas.StudentDashboardData(
        uploaded_notes=uploaded_notes_count,
        total_quizzes=total_quizzes_count,
        quiz_scores=quiz_scores,
        ai_questions_asked=ai_questions_count,
        study_progress=study_progress_percent,
        recent_activity=recent_activity,
        weekly_study_hours=weekly_study_hours,
        quiz_performance=quiz_perf,
        attendance_rate=attendance_rate,
        upcoming_alarms=upcoming_reminders
    )

def get_teacher_dashboard(db: Session, teacher_id: int) -> schemas.TeacherDashboardData:
    total_notes = db.query(models.Note).count()
    total_quizzes = db.query(models.Quiz).count()
    total_students = db.query(models.User).filter(models.User.role == "Student").count()
    
    avg_score_query = db.query(func.avg(models.QuizAttempt.score)).scalar()
    avg_score = float(avg_score_query) if avg_score_query is not None else 0.0
    
    # Recent activity system wide
    recent_activity = []
    notes = db.query(models.Note).order_by(models.Note.upload_date.desc()).limit(3).all()
    for n in notes:
        recent_activity.append(schemas.RecentActivity(
            type="note_upload",
            description=f"Note '{n.title}' uploaded by teacher/student",
            timestamp=n.upload_date
        ))
    attempts = db.query(models.QuizAttempt).order_by(models.QuizAttempt.timestamp.desc()).limit(3).all()
    for att in attempts:
        user = db.query(models.User).filter(models.User.id == att.user_id).first()
        quiz = db.query(models.Quiz).filter(models.Quiz.id == att.quiz_id).first()
        student_name = user.name if user else "Student"
        quiz_title = quiz.title if quiz else "Quiz"
        recent_activity.append(schemas.RecentActivity(
            type="quiz_attempt",
            description=f"Student {student_name} scored {att.score}/{att.total_questions} on {quiz_title}",
            timestamp=att.timestamp
        ))
    recent_activity = sorted(recent_activity, key=lambda x: x.timestamp, reverse=True)[:5]
    
    # Students performance list
    students = db.query(models.User).filter(models.User.role == "Student").all()
    students_performance = []
    for s in students:
        s_attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == s.id).all()
        q_completed = len(s_attempts)
        avg_s_score = sum([att.score for att in s_attempts]) / q_completed if q_completed > 0 else 0.0
        students_performance.append({
            "student_id": s.id,
            "name": s.name,
            "email": s.email,
            "quizzes_completed": q_completed,
            "avg_score": round(avg_s_score, 1)
        })
        
    return schemas.TeacherDashboardData(
        total_notes_uploaded=total_notes,
        total_quizzes_created=total_quizzes,
        total_students_enrolled=total_students,
        average_quiz_score=round(avg_score, 1),
        recent_activity=recent_activity,
        students_performance=students_performance
    )

def get_admin_dashboard(db: Session) -> schemas.AdminDashboardData:
    total_users = db.query(models.User).count()
    total_teachers = db.query(models.User).filter(models.User.role == "Teacher").count()
    total_students = db.query(models.User).filter(models.User.role == "Student").count()
    total_notes = db.query(models.Note).count()
    
    # Calculate storage size of backend/uploads
    storage_size_mb = 0.0
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        for f in os.listdir(uploads_dir):
            fp = os.path.join(uploads_dir, f)
            if os.path.isfile(fp):
                storage_size_mb += os.path.getsize(fp) / (1024 * 1024)
    storage_size_mb = round(storage_size_mb, 2)
    
    # System logs / recent actions
    activity_logs = []
    users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    for u in users:
        activity_logs.append(schemas.RecentActivity(
            type="user_signup",
            description=f"New user registered: {u.name} ({u.role})",
            timestamp=u.created_at
        ))
    notes = db.query(models.Note).order_by(models.Note.upload_date.desc()).limit(5).all()
    for n in notes:
        activity_logs.append(schemas.RecentActivity(
            type="note_upload",
            description=f"Note uploaded: {n.title}",
            timestamp=n.upload_date
        ))
    activity_logs = sorted(activity_logs, key=lambda x: x.timestamp, reverse=True)[:10]
    
    # Growth analytics mock
    user_growth = [
        {"month": "Feb", "count": int(total_users * 0.5)},
        {"month": "Mar", "count": int(total_users * 0.7)},
        {"month": "Apr", "count": int(total_users * 0.8)},
        {"month": "May", "count": int(total_users * 0.9)},
        {"month": "Jun", "count": total_users}
    ]
    
    return schemas.AdminDashboardData(
        total_users=total_users,
        total_teachers=total_teachers,
        total_students=total_students,
        total_notes=total_notes,
        storage_used_mb=storage_size_mb,
        activity_logs=activity_logs,
        user_growth=user_growth
    )


# --- Attendance & Reminders CRUD ---
def mark_attendance(db: Session, user_id: int, status: str = "Present") -> models.Attendance:
    today_str = datetime.date.today().isoformat()
    # Check if already marked for today
    existing = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.date == today_str
    ).first()
    
    if existing:
        return existing
        
    db_att = models.Attendance(
        user_id=user_id,
        date=today_str,
        status=status
    )
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

def get_attendance_history(db: Session, user_id: int) -> list[models.Attendance]:
    return db.query(models.Attendance).filter(models.Attendance.user_id == user_id).order_by(models.Attendance.date.desc()).all()

def create_exam_reminder(db: Session, reminder: schemas.ExamReminderCreate, user_id: int) -> models.ExamReminder:
    db_rem = models.ExamReminder(
        user_id=user_id,
        title=reminder.title,
        exam_date=reminder.exam_date,
        prep_notes=reminder.prep_notes
    )
    db.add(db_rem)
    db.commit()
    db.refresh(db_rem)
    return db_rem

def get_exam_reminders(db: Session, user_id: int) -> list[models.ExamReminder]:
    return db.query(models.ExamReminder).filter(models.ExamReminder.user_id == user_id).order_by(models.ExamReminder.exam_date.asc()).all()

def delete_exam_reminder(db: Session, reminder_id: int, user_id: int) -> bool:
    db_rem = db.query(models.ExamReminder).filter(
        models.ExamReminder.id == reminder_id,
        models.ExamReminder.user_id == user_id
    ).first()
    if not db_rem:
        return False
    db.delete(db_rem)
    db.commit()
    return True


# --- Notifications & Feedback CRUD ---
def create_notification(db: Session, title: str, message: str, user_id: int) -> models.Notification:
    db_notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def create_broadcast_notification(db: Session, title: str, message: str):
    students = db.query(models.User).filter(models.User.role == "Student").all()
    for s in students:
        db_notif = models.Notification(
            user_id=s.id,
            title=title,
            message=message
        )
        db.add(db_notif)
    db.commit()

def get_user_notifications(db: Session, user_id: int) -> list[models.Notification]:
    return db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).order_by(models.Notification.created_at.desc()).all()

def mark_notifications_as_read(db: Session, user_id: int) -> bool:
    db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return True

def create_feedback(db: Session, feedback: schemas.FeedbackCreate, teacher_id: int) -> models.Feedback:
    db_fb = models.Feedback(
        student_id=feedback.student_id,
        teacher_id=teacher_id,
        feedback_text=feedback.feedback_text
    )
    db.add(db_fb)
    db.commit()
    db.refresh(db_fb)
    return db_fb

def get_student_feedbacks(db: Session, student_id: int):
    feedbacks = db.query(models.Feedback).filter(
        models.Feedback.student_id == student_id
    ).order_by(models.Feedback.created_at.desc()).all()
    
    results = []
    for f in feedbacks:
        teacher = db.query(models.User).filter(models.User.id == f.teacher_id).first()
        teacher_name = teacher.name if teacher else "Teacher"
        results.append({
            "id": f.id,
            "student_id": f.student_id,
            "teacher_id": f.teacher_id,
            "feedback_text": f.feedback_text,
            "created_at": f.created_at,
            "teacher_name": teacher_name
        })
    return results
