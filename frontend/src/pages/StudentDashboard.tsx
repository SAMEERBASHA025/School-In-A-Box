import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StudentDashboardData } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Award,
  MessageSquare,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  CheckSquare,
  Bell,
  Trash2,
  AlertTriangle,
  Plus,
  UploadCloud,
  FileUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alarmTitle, setAlarmTitle] = useState('');
  const [alarmDate, setAlarmDate] = useState('');
  const [alarmNotes, setAlarmNotes] = useState('');
  const [reminders, setReminders] = useState<any[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setReminders(data.upcoming_alarms || []);
    }
  }, [data]);

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFile) {
      toast.warn('Please fill in title and select a file');
      return;
    }
    const allowed = ['.pdf', '.mp3', '.mp4', '.wav', '.m4a', '.mpeg'];
    const hasAllowedExt = allowed.some((ext) => uploadFile.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExt) {
      toast.warn(`Supported formats: ${allowed.join(', ')}`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Lecture note generated and processed successfully!');
      setUploadTitle('');
      setUploadFile(null);
      // Reload dashboard data
      const response = await api.get<StudentDashboardData>('/progress/dashboard');
      setData(response.data);
      const fbRes = await api.get<any[]>('/feedback/student');
      setFeedbacks(fbRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload and generate notes');
    } finally {
      setUploading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/reminders', {
        title: alarmTitle,
        exam_date: alarmDate,
        prep_notes: alarmNotes || null
      });
      setReminders([...reminders, response.data]);
      setAlarmTitle('');
      setAlarmDate('');
      setAlarmNotes('');
      toast.success('Exam reminder scheduled successfully!');
    } catch (err) {
      toast.error('Failed to schedule reminder');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders(reminders.filter((rem) => rem.id !== id));
      toast.success('Reminder removed');
    } catch (err) {
      toast.error('Failed to remove reminder');
    }
  };

  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<StudentDashboardData>('/progress/dashboard');
        setData(response.data);
        const fbRes = await api.get<any[]>('/feedback/student');
        setFeedbacks(fbRes.data);
      } catch (err) {
        toast.error('Failed to load student analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">No analytics data available</h2>
        <p className="text-gray-500">Try seeding the database first!</p>
      </div>
    );
  }

  // Prepping chart data
  const studyHoursChartData = [
    { day: 'Mon', Hours: data.weekly_study_hours[0] || 0 },
    { day: 'Tue', Hours: data.weekly_study_hours[1] || 0 },
    { day: 'Wed', Hours: data.weekly_study_hours[2] || 0 },
    { day: 'Thu', Hours: data.weekly_study_hours[3] || 0 },
    { day: 'Fri', Hours: data.weekly_study_hours[4] || 0 },
    { day: 'Sat', Hours: data.weekly_study_hours[5] || 0 },
    { day: 'Sun', Hours: data.weekly_study_hours[6] || 0 },
  ];

  const quizPerformanceData = data.quiz_performance.length > 0
    ? data.quiz_performance.map((q) => ({
        name: q.quiz_title.length > 15 ? `${q.quiz_title.substring(0, 15)}...` : q.quiz_title,
        Score: q.score,
        Total: q.total
      }))
    : [{ name: 'No Quizzes', Score: 0, Total: 10 }];

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            Student Workspace
          </h2>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
            Track study milestones, quizzes completed, and AI assistant questions.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 border border-apple-border-light dark:border-apple-border-dark text-xs font-semibold">
          <Calendar size={14} className="text-indigo-500" />
          Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <GlassCard hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{data.uploaded_notes}</div>
            <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Uploaded Notes
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Award size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{data.total_quizzes}</div>
            <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Available Quizzes
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{data.ai_questions_asked}</div>
            <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              AI Queries Made
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{Math.round(data.study_progress)}%</div>
            <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Study Progress
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{Math.round(data.attendance_rate)}%</div>
            <div className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Daily Attendance
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Progress Chart Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly study hours chart */}
        <GlassCard className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" />
            <h3 className="font-bold text-lg">Weekly Study Durations (Hours)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyHoursChartData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(220, 220, 220, 0.5)'
                  }}
                />
                <Area type="monotone" dataKey="Hours" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Quiz scores bar chart */}
        <GlassCard className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-purple-500" />
            <h3 className="font-bold text-lg">Recent Quiz Score Review</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Score" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Exam Preparation Alarms & Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduler Form (5 cols) */}
        <GlassCard className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-indigo-500" />
            <h3 className="font-bold text-lg text-apple-text-primary-light dark:text-apple-text-primary-dark">
              Schedule Exam / Quiz Prep
            </h3>
          </div>
          <form onSubmit={handleAddReminder} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                Exam/Quiz Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Algorithms Midterm"
                value={alarmTitle}
                onChange={(e) => setAlarmTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={alarmDate}
                onChange={(e) => setAlarmDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                Preparation Notes
              </label>
              <textarea
                placeholder="e.g. Read chapters 1-4, review notes..."
                value={alarmNotes}
                onChange={(e) => setAlarmNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Add Reminder Alarm
            </button>
          </form>
        </GlassCard>

        {/* Reminders List & Alarms (7 cols) */}
        <GlassCard className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-pink-500" />
            <h3 className="font-bold text-lg text-apple-text-primary-light dark:text-apple-text-primary-dark">
              Upcoming Reminders & Exam Alarms
            </h3>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {reminders.length > 0 ? (
              reminders.map((rem) => {
                const daysLeft = Math.ceil(
                  (new Date(rem.exam_date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysLeft >= 0 && daysLeft <= 3;
                return (
                  <div
                    key={rem.id}
                    className={`p-3 rounded-xl border flex justify-between items-start transition-all ${
                      isUrgent
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-white/10 dark:bg-white/5 border-apple-border-light dark:border-apple-border-dark'
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        {isUrgent && <AlertTriangle size={14} className="text-red-500 animate-bounce" />}
                        <h4 className="font-bold text-sm text-apple-text-primary-light dark:text-apple-text-primary-dark">
                          {rem.title}
                        </h4>
                        {isUrgent && (
                          <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Active Alarm
                          </span>
                        )}
                      </div>
                      {rem.prep_notes && (
                        <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark leading-relaxed">
                          {rem.prep_notes}
                        </p>
                      )}
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">
                        Target Date: {new Date(rem.exam_date).toLocaleDateString()} ({daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow!' : `${daysLeft} days left`})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-apple-text-secondary-light hover:text-red-500 dark:text-apple-text-secondary-dark dark:hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark text-sm">
                No scheduled reminders. Add one to prepare for your exams!
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Quick Upload & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Upload AI Note Generator (6 cols) */}
        <GlassCard className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <UploadCloud size={18} className="text-blue-500" />
            <h3 className="font-bold text-lg text-apple-text-primary-light dark:text-apple-text-primary-dark">
              AI Video & Document Note Generator
            </h3>
          </div>
          <form onSubmit={handleQuickUpload} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                Note Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. History Lecture on Romans"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-apple-text-primary-light dark:text-apple-text-primary-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark mb-1">
                Select Video, Audio, or PDF
              </label>
              <div className="border border-dashed border-apple-border-light dark:border-apple-border-dark rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-indigo-500 transition-all relative">
                <input
                  type="file"
                  accept="application/pdf,audio/*,video/*"
                  required
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) setUploadFile(files[0]);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="text-gray-400" size={24} />
                <span className="text-xs font-medium text-apple-text-secondary-light dark:text-apple-text-secondary-dark truncate max-w-xs">
                  {uploadFile ? uploadFile.name : 'Select file (.mp4, .mp3, .pdf, etc.)'}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transcribing & Summarizing...
                </>
              ) : (
                'Upload & Generate AI Notes'
              )}
            </button>
          </form>
        </GlassCard>

        {/* Feedback Feed & Activity (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Teacher Feedback Feed */}
          <GlassCard className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              <MessageSquare size={18} className="text-purple-500" />
              <h3 className="font-bold text-lg text-apple-text-primary-light dark:text-apple-text-primary-dark">
                Teacher Feedback & Guidance
              </h3>
            </div>
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
              {feedbacks.length > 0 ? (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-apple-border-light dark:border-apple-border-dark space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-500">{fb.teacher_name}</span>
                      <span className="text-[9px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-apple-text-primary-light dark:text-apple-text-primary-dark leading-relaxed">
                      "{fb.feedback_text}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  No guidance logs received from your instructors yet.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Recent Activity Logs */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-pink-500" />
              <h3 className="font-bold text-lg">Recent Activity Logs</h3>
            </div>
            <div className="divide-y divide-apple-border-light dark:divide-apple-border-dark max-h-[140px] overflow-y-auto pr-1">
              {data.recent_activity.length > 0 ? (
                data.recent_activity.map((act, index) => (
                  <div key={index} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 text-left">
                      <span className="text-base">
                        {act.type === 'note_upload' && '📚'}
                        {act.type === 'quiz_attempt' && '📝'}
                        {act.type === 'ai_question' && '🤖'}
                        {act.type === 'user_signup' && '✨'}
                      </span>
                      <div>
                        <p className="font-medium text-apple-text-primary-light dark:text-apple-text-primary-dark line-clamp-1">
                          {act.description}
                        </p>
                        <p className="text-[9px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                          Category: {act.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark shrink-0 pl-2">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  No recent activity recorded yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
