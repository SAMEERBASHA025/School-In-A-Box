import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Quiz, QuizWithQuestions, Question, QuizAttempt } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import {
  Award,
  Clock,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<QuizWithQuestions | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get<Quiz[]>('/quiz');
        setQuizzes(response.data);
      } catch (err) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeQuiz) return;
    if (timeLeft <= 0) {
      toast.warn('Time expired! Auto-submitting your quiz responses.');
      triggerQuizSubmission();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, activeQuiz]);

  const handleStartQuiz = async (quizId: number) => {
    setLoading(true);
    try {
      const response = await api.get<QuizWithQuestions>(`/quiz/${quizId}`);
      setActiveQuiz(response.data);
      setCurrentQuestionIdx(0);
      setAnswers({});
      // Allocate 60 seconds per question
      setTimeLeft(response.data.questions.length * 60);
    } catch (err) {
      toast.error('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionLetter
    });
  };

  const triggerQuizSubmission = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    
    // Compile answers
    const answersPayload = activeQuiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || 'None'  // Default to None if not answered
    }));

    try {
      const response = await api.post<QuizAttempt>('/quiz/submit', {
        quiz_id: activeQuiz.id,
        answers: answersPayload
      });
      
      toast.success(`Quiz completed! Scored ${response.data.score}/${response.data.total_questions}`);
      
      // Navigate to results screen, passing attempt data via state
      navigate('/quiz/result', { state: { attempt: response.data, quiz: activeQuiz } });
    } catch (err) {
      toast.error('Failed to submit quiz scores');
    } finally {
      setSubmitting(false);
      setActiveQuiz(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Render Solver Viewport
  if (activeQuiz) {
    const q: Question = activeQuiz.questions[currentQuestionIdx];
    const totalQ = activeQuiz.questions.length;
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 text-left pb-20">
        {/* Solver Header */}
        <div className="flex justify-between items-center border-b border-apple-border-light dark:border-apple-border-dark pb-3">
          <div>
            <h3 className="font-extrabold text-xl">{activeQuiz.title}</h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase">
              {activeQuiz.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 font-mono text-sm font-bold border border-orange-500/20">
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Card */}
        <GlassCard className="p-8 space-y-6 border-indigo-500/10 shadow-xl">
          <div className="flex justify-between items-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
            <span>Question {currentQuestionIdx + 1} of {totalQ}</span>
            <span>Progress: {Math.round(((currentQuestionIdx + 1) / totalQ) * 100)}%</span>
          </div>

          <h4 className="text-lg font-bold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            {q.question}
          </h4>

          {/* MCQ Options */}
          <div className="space-y-3">
            {[
              { letter: 'A', text: q.optionA },
              { letter: 'B', text: q.optionB },
              { letter: 'C', text: q.optionC },
              { letter: 'D', text: q.optionD }
            ]
              .filter((opt) => opt.text) // filter out blank option keys
              .map((opt) => {
                const isSelected = answers[q.id] === opt.letter;
                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelectOption(q.id, opt.letter)}
                    className={`w-full text-left p-4 rounded-xl border font-medium text-sm transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'bg-white/40 dark:bg-black/10 border-apple-border-light dark:border-apple-border-dark hover:border-indigo-500/30'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                      {opt.letter}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
          </div>
        </GlassCard>

        {/* Footer Traversal Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
            disabled={currentQuestionIdx === 0}
            className="glass-btn-secondary px-4 py-2.5 disabled:opacity-50"
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {currentQuestionIdx < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
              className="glass-btn-secondary px-4 py-2.5"
            >
              Next Question <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={triggerQuizSubmission}
              disabled={submitting}
              className="glass-btn-primary px-6 py-2.5"
            >
              <CheckCircle size={16} /> {submitting ? 'Submitting Answers...' : 'Submit Answers'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Quizzes Index list
  return (
    <div className="space-y-6 text-left pb-20">
      <div>
        <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
          Platform Quizzes
        </h2>
        <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
          Select any published classroom quiz, review key subjects, and aim for the top leaderboard score.
        </p>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <GlassCard key={quiz.id} hoverable className="flex flex-col justify-between h-48">
              <div className="text-left space-y-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  quiz.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                  quiz.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {quiz.difficulty}
                </span>
                <h3 className="font-bold text-lg leading-snug line-clamp-2">
                  {quiz.title}
                </h3>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz.id)}
                className="w-full glass-btn-primary py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Play size={12} fill="currentColor" /> Start Quiz Taker
              </button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
          No classroom quizzes have been published yet. Check back soon!
        </div>
      )}
    </div>
  );
};

export default QuizPage;
