export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  filename: string;
  uploaded_by: number;
  upload_date: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface Quiz {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  timestamp: string;
  quiz_title?: string;
}

export interface LeaderboardEntry {
  user_name: string;
  user_email: string;
  score: number;
  total_questions: number;
  quiz_title: string;
  timestamp: string;
}

export interface ChatMessage {
  question: string;
  answer: string;
  timestamp: string;
}

export interface Progress {
  completed_notes: number;
  quizzes_completed: number;
  study_hours: number;
}

export interface RecentActivity {
  type: 'note_upload' | 'quiz_attempt' | 'ai_question' | 'user_signup';
  description: string;
  timestamp: string;
}

export interface StudentDashboardData {
  uploaded_notes: number;
  total_quizzes: number;
  quiz_scores: number[];
  ai_questions_asked: number;
  study_progress: number;
  recent_activity: RecentActivity[];
  weekly_study_hours: number[];
  quiz_performance: { quiz_title: string; score: number; total: number }[];
  attendance_rate: number;
  upcoming_alarms: ExamReminder[];
}

export interface TeacherDashboardData {
  total_notes_uploaded: number;
  total_quizzes_created: number;
  total_students_enrolled: number;
  average_quiz_score: number;
  recent_activity: RecentActivity[];
  students_performance: { student_id?: number; name: string; email: string; quizzes_completed: number; avg_score: number }[];
}

export interface AdminDashboardData {
  total_users: number;
  total_teachers: number;
  total_students: number;
  total_notes: number;
  storage_used_mb: number;
  activity_logs: RecentActivity[];
  user_growth: { month: string; count: number }[];
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  status: string;
  timestamp: string;
}

export interface ExamReminder {
  id: number;
  user_id: number;
  title: string;
  exam_date: string;
  prep_notes?: string;
  created_at: string;
}

export interface ClassroomAttendance {
  id: number;
  name: string;
  email: string;
  date: string;
  status: string;
  timestamp: string;
}
