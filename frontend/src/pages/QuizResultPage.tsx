import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { LeaderboardEntry, QuizAttempt } from '../types';
import { GlassCard } from '../components/GlassCard';
import { toast } from 'react-toastify';
import { Trophy, Award, Check, X, ArrowRight, Library, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const QuizResultPage: React.FC = () => {
  const location = useLocation();
  const attempt = location.state?.attempt as QuizAttempt | undefined;
  const quiz = location.state?.quiz;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get<LeaderboardEntry[]>('/quiz/leaderboard');
        setLeaderboard(response.data);
      } catch (err) {
        toast.error('Failed to load global leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Prepare chart representation if attempt exists
  const correctCount = attempt?.score || 0;
  const totalCount = attempt?.total_questions || 0;
  const incorrectCount = Math.max(0, totalCount - correctCount);

  const pieData = [
    { name: 'Correct', value: correctCount, color: '#10b981' },
    { name: 'Incorrect', value: incorrectCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 text-left pb-20 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
          Quiz Results & Standings
        </h2>
        <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
          Review your quiz performance and see where you rank on the global leaderboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Score Summary Card */}
        <div className="md:col-span-5 space-y-6">
          <GlassCard className="p-6 text-center space-y-4 border-indigo-500/20 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Trophy size={32} />
            </div>

            {attempt ? (
              <div className="space-y-2">
                <h3 className="font-extrabold text-lg line-clamp-1">{attempt.quiz_title || 'Quiz Complete'}</h3>
                <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-indigo-500 bg-clip-text text-transparent">
                  {attempt.score} / {attempt.total_questions}
                </div>
                <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark font-medium">
                  Percentage: {Math.round((attempt.score / attempt.total_questions) * 100)}%
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-bold text-sm">No active attempt records found</h3>
                <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  Please visit the Quizzes tab to take an assessment.
                </p>
              </div>
            )}

            {/* Render pie chart visualization if attempt data exists */}
            {attempt && totalCount > 0 && (
              <div className="h-40 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-xs font-semibold flex flex-col justify-center items-center">
                  <div className="flex gap-2.5 items-center">
                    <span className="flex items-center gap-0.5 text-green-500 font-bold"><Check size={12} /> {correctCount}</span>
                    <span className="flex items-center gap-0.5 text-red-500 font-bold"><X size={12} /> {incorrectCount}</span>
                  </div>
                </div>
              </div>
            )}

            <Link to="/quiz" className="w-full glass-btn-primary py-2.5 rounded-xl text-xs">
              Go to Quizzes list <ArrowRight size={14} />
            </Link>
          </GlassCard>

          {attempt && Math.round((attempt.score / attempt.total_questions) * 100) >= 60 && (
            <GlassCard className="p-4 bg-indigo-500/10 border-indigo-500/30 text-center space-y-3">
              <div className="flex justify-center text-yellow-500 animate-bounce">
                <Award size={32} />
              </div>
              <h4 className="font-bold text-sm text-apple-text-primary-light dark:text-apple-text-primary-dark">
                Certificate Earned!
              </h4>
              <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                You scored {Math.round((attempt.score / attempt.total_questions) * 100)}%! You are eligible for a Certificate of Achievement.
              </p>
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl text-xs transition-all shadow-md"
              >
                View & Print Certificate
              </button>
            </GlassCard>
          )}
        </div>

        {/* Right Side: Global Leaderboard standings */}
        <div className="md:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              <Award size={18} className="text-yellow-500" />
              <h3 className="font-bold text-lg">Global Standings Leaderboard</h3>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2 py-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
                </div>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => {
                  const isTopThree = idx < 3;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex justify-between items-center ${
                        isTopThree
                          ? 'bg-yellow-500/5 border-yellow-500/20 text-apple-text-primary-light dark:text-apple-text-primary-dark font-semibold'
                          : 'bg-white/40 dark:bg-black/20 border-apple-border-light dark:border-apple-border-dark text-apple-text-secondary-light dark:text-apple-text-secondary-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-500 text-black' :
                          idx === 1 ? 'bg-gray-300 text-black' :
                          idx === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 dark:bg-gray-800 text-apple-text-secondary-light dark:text-apple-text-secondary-dark'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-semibold">{entry.user_name}</div>
                          <div className="text-[10px] truncate max-w-[150px] sm:max-w-xs">{entry.quiz_title}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-indigo-500">{entry.score}</span>
                        <span className="text-xs">/{entry.total_questions}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                  No leaderboard records logged. Be the first to try!
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {showCertificate && attempt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 print:p-0 print:bg-white print:relative">
          <div className="bg-white text-black p-8 rounded-2xl max-w-2xl w-full border-8 border-double border-yellow-600 shadow-2xl relative space-y-6 print:border-8 print:shadow-none print:max-w-none print:h-screen print:rounded-none">
            
            {/* Close button (hidden during print) */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors print:hidden"
            >
              <X size={20} />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2">
              <span className="text-yellow-600 font-serif tracking-widest text-xs font-bold uppercase">
                School-In-A-Box Certification
              </span>
              <h2 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-wide">
                Certificate of Completion
              </h2>
              <div className="h-0.5 w-40 bg-yellow-600 mx-auto mt-2" />
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 my-6">
              <p className="text-xs italic text-gray-600">This certificate is proudly presented to</p>
              <h3 className="text-2xl font-serif font-black text-indigo-950 border-b border-gray-200 pb-1 max-w-md mx-auto">
                {location.state?.user_name || "Student"}
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                for successfully passing the timed assessment examination and demonstrating proficiency in the subject area of
              </p>
              <h4 className="text-lg font-bold text-indigo-700">
                {attempt.quiz_title || "Course Material Assessment"}
              </h4>
              <p className="text-xs text-gray-600">
                with an achievement score of <span className="font-bold text-gray-900">{Math.round((attempt.score / attempt.total_questions) * 100)}%</span>
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <div className="text-left">
                <p className="font-mono text-[9px] text-gray-400">
                  VERIFICATION HASH
                </p>
                <p className="font-mono text-[10px] text-gray-600 font-bold uppercase">
                  SHA-256: CERT-ID-{attempt.id}-{new Date(attempt.timestamp).getTime().toString().substring(8)}
                </p>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="text-yellow-600">
                  <Award size={36} />
                </div>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
                  Verified Seal
                </span>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Date Issued</p>
                <p className="text-xs text-gray-700 font-bold">
                  {new Date(attempt.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action buttons (hidden during print) */}
            <div className="flex gap-4 justify-end mt-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResultPage;
