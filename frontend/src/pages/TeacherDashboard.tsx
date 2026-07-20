import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TeacherDashboardData, Quiz } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Plus,
  Trash,
  Settings,
  PlusCircle,
  MessageSquare
} from 'lucide-react';

interface QuestionInput {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);

  // Feedback State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !feedbackText.trim()) {
      toast.warn('Please select a student and enter feedback');
      return;
    }
    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        student_id: parseInt(selectedStudentId),
        feedback_text: feedbackText
      });
      toast.success('Feedback sent to student successfully!');
      setFeedbackText('');
      setSelectedStudentId('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Quiz Builder Modal / Form State
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: 'A' }
  ]);

  const fetchData = async () => {
    try {
      const dashboardRes = await api.get<TeacherDashboardData>('/progress/teacher');
      const quizzesRes = await api.get<Quiz[]>('/quiz');
      const attendanceRes = await api.get<any[]>('/attendance/teacher');
      setData(dashboardRes.data);
      setQuizzes(quizzesRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      toast.error('Failed to load teacher analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddQuestionField = () => {
    setQuestions([
      ...questions,
      { question: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: 'A' }
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestionField = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      toast.warn('Please enter a quiz title');
      return;
    }

    // Verify questions
    for (const q of questions) {
      if (!q.question.trim() || !q.optionA.trim() || !q.optionB.trim()) {
        toast.warn('Please fill in the question text and at least Options A & B');
        return;
      }
    }

    try {
      await api.post('/quiz', {
        title: quizTitle,
        difficulty: quizDifficulty,
        questions: questions
      });

      toast.success('New quiz created successfully!');
      setShowQuizBuilder(false);
      setQuizTitle('');
      setQuestions([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: 'A' }]);
      fetchData(); // Reload stats and quizzes
    } catch (err) {
      toast.error('Could not create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quiz/${quizId}`);
      toast.success('Quiz deleted');
      fetchData();
    } catch (err) {
      toast.error('Could not delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            Teacher Analytics Dashboard
          </h2>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
            Evaluate student grade statistics and manage classroom materials.
          </p>
        </div>
        <button
          onClick={() => setShowQuizBuilder(true)}
          className="glass-btn-primary py-2.5 text-sm"
        >
          <Plus size={16} /> Create New Quiz
        </button>
      </div>

      {/* Metrics Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-2xl font-black">{data.total_notes_uploaded}</div>
              <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Notes Materials
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Award size={24} />
            </div>
            <div>
              <div className="text-2xl font-black">{data.total_quizzes_created}</div>
              <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Quizzes Published
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-black">{data.total_students_enrolled}</div>
              <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Students Enrolled
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-black">{data.average_quiz_score}</div>
              <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Average Class Score
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Classroom tables block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Performance List */}
        <GlassCard className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-lg">Enrolled Students & Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-apple-border-light dark:border-apple-border-dark text-xs uppercase text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  <th className="py-3 px-2">Student Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2 text-center">Quizzes Done</th>
                  <th className="py-3 px-2 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border-light dark:divide-apple-border-dark text-sm">
                {data && data.students_performance.length > 0 ? (
                  data.students_performance.map((s, idx) => (
                    <tr key={idx} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium">{s.name}</td>
                      <td className="py-3 px-2 text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                        {s.email}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-indigo-500">{s.quizzes_completed}</td>
                      <td className="py-3 px-2 text-right font-semibold text-green-500">{s.avg_score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                      No student attempts registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Quizzes List & Deletes + Feedback Form */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-lg">Manage Classroom Quizzes</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {quizzes.length > 0 ? (
                quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-apple-border-light dark:border-apple-border-dark flex justify-between items-center"
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold">{q.title}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuiz(q.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  No quizzes configured. Click 'Create New Quiz' to build one.
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              <MessageSquare size={18} className="text-purple-500" />
              <h3 className="font-bold text-base">Send Student Feedback</h3>
            </div>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                  Select Student
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
                >
                  <option value="" className="text-black dark:text-white">-- Select Student --</option>
                  {data?.students_performance.map((std) => (
                    <option key={std.student_id} value={std.student_id} className="text-black dark:text-white">
                      {std.name} ({std.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                  Feedback & Advice
                </label>
                <textarea
                  required
                  placeholder="Provide study tips, quiz reviews, or progress suggestions..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
                />
              </div>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold transition-all"
              >
                {submittingFeedback ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Daily Attendance Registry */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-teal-500" />
            <h3 className="font-bold text-lg text-apple-text-primary-light dark:text-apple-text-primary-dark">
              Daily Attendance Registry (Student Logins)
            </h3>
          </div>
          <div className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark bg-white/20 dark:bg-white/5 border border-apple-border-light dark:border-apple-border-dark px-3 py-1.5 rounded-xl font-semibold">
            Total Logins Tracked: {attendance.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-apple-border-light dark:border-apple-border-dark text-xs uppercase text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                <th className="py-3 px-2">Student Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Date Checked In</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Login Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border-light dark:divide-apple-border-dark text-sm">
              {attendance.length > 0 ? (
                attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-medium">{att.name}</td>
                    <td className="py-3 px-2 text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                      {att.email}
                    </td>
                    <td className="py-3 px-2 font-semibold text-indigo-500">{att.date}</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-500/10 text-green-500">
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                      {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                    No student daily logins recorded yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Quiz Builder Overlay Modal */}
      {showQuizBuilder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-apple-bg-light dark:bg-apple-bg-dark rounded-2xl max-w-2xl w-full border border-apple-border-light dark:border-apple-border-dark shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Quiz Configuration Builder</h3>
              <button
                onClick={() => setShowQuizBuilder(false)}
                className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark hover:text-red-500 font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Python Functions Intermediate"
                    className="w-full glass-input text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Difficulty</label>
                  <select
                    value={quizDifficulty}
                    onChange={(e: any) => setQuizDifficulty(e.target.value)}
                    className="w-full glass-input text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Questions Array */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-apple-border-light dark:border-apple-border-dark pb-2">
                  <h4 className="text-sm font-bold uppercase text-indigo-500">Quiz MCQs</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Add MCQ Field
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white/20 dark:bg-black/10 rounded-xl space-y-3 relative border border-apple-border-light dark:border-apple-border-dark">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                        Question #{idx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionField(idx)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                      placeholder="Question Prompt text"
                      className="w-full glass-input text-sm"
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold">Option A</label>
                        <input
                          type="text"
                          value={q.optionA}
                          onChange={(e) => handleQuestionChange(idx, 'optionA', e.target.value)}
                          placeholder="Option A"
                          className="w-full glass-input text-xs py-1.5 px-3"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold">Option B</label>
                        <input
                          type="text"
                          value={q.optionB}
                          onChange={(e) => handleQuestionChange(idx, 'optionB', e.target.value)}
                          placeholder="Option B"
                          className="w-full glass-input text-xs py-1.5 px-3"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold">Option C</label>
                        <input
                          type="text"
                          value={q.optionC}
                          onChange={(e) => handleQuestionChange(idx, 'optionC', e.target.value)}
                          placeholder="Option C"
                          className="w-full glass-input text-xs py-1.5 px-3"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold">Option D</label>
                        <input
                          type="text"
                          value={q.optionD}
                          onChange={(e) => handleQuestionChange(idx, 'optionD', e.target.value)}
                          placeholder="Option D"
                          className="w-full glass-input text-xs py-1.5 px-3"
                        />
                      </div>
                    </div>

                    <div className="w-1/3">
                      <label className="text-[10px] font-bold block mb-1">Correct Answer Option</label>
                      <select
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                        className="w-full glass-input text-xs py-1.5"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full glass-btn-primary py-3 rounded-xl font-bold"
              >
                Assemble & Publish Quiz
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
