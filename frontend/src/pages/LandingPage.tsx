import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, BookOpen, GraduationCap, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const LandingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-apple-bg-light dark:bg-apple-bg-dark bg-grid-pattern relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Brand Nav */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-500" size={32} />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            School-In-A-Box
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-apple-text-primary-light dark:text-apple-text-primary-dark font-medium hover:text-indigo-500 transition-colors"
          >
            Sign In
          </Link>
          <Link to="/register" className="glass-btn-primary py-2 px-4 text-sm">
            Get Started <ChevronRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center z-10 flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-7 space-y-6 text-left"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wide"
          >
            <Sparkles size={12} /> Next-Gen AI Digital Learning Platform
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold leading-[1.1] text-apple-text-primary-light dark:text-apple-text-primary-dark"
          >
            Your Entire Campus,<br />
            Powered by{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Artificial Intelligence.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-apple-text-secondary-light dark:text-apple-text-secondary-dark max-w-2xl font-light"
          >
            School-In-A-Box organizes notes, generates smart vector indexes for interactive AI chats, crafts dynamic teacher quizzes, and visualizes progress—all within a premium, responsive glassmorphic interface.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
            <Link to="/register" className="glass-btn-primary text-base px-6 py-3">
              Register Free Account
            </Link>
            <Link to="/login" className="glass-btn-secondary text-base px-6 py-3">
              Explore Demo Logins
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <GlassCard hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-lg">Smart Notes</h3>
            <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Upload PDF materials. The AI parses text and indexes chapters for RAG.
            </p>
          </GlassCard>

          <GlassCard hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500">
              <BrainCircuit size={20} />
            </div>
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Ask deep questions directly to notes. Get answers backed by document contexts.
            </p>
          </GlassCard>

          <GlassCard hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-500">
              <Trophy size={20} />
            </div>
            <h3 className="font-bold text-lg">Smart Quizzes</h3>
            <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Test knowledge with timers. Compete on student leaderboards.
            </p>
          </GlassCard>

          <GlassCard hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
              <GraduationCap size={20} />
            </div>
            <h3 className="font-bold text-lg">Core Analytics</h3>
            <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Student progress charts, study durations logs, and teacher insight tables.
            </p>
          </GlassCard>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-apple-border-light dark:border-apple-border-dark flex flex-col sm:flex-row justify-between items-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark z-10 gap-4">
        <div>
          &copy; {new Date().getFullYear()} School-In-A-Box Inc. Built for Final Year B.Tech CS Project.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-500">Terms</a>
          <a href="#" className="hover:text-indigo-500">Privacy</a>
          <a href="#" className="hover:text-indigo-500">API Documentation</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
