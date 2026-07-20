import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { GraduationCap, ArrowRight, User, ShieldCheck, Key, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please fill in all credentials');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      login(response.data.access_token, response.data.user);
      toast.success(`Signed in as ${response.data.user.name}`);

      // Role routing
      if (response.data.user.role === 'Admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'Teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Helper helper to fast-login with seeded demo users
  const triggerDemoLogin = async (demoEmail: string, demoRole: string) => {
    setLoading(true);
    try {
      // Proactively call /seed to verify data is populated
      try {
        await api.post('/seed');
      } catch (err) {
        // Silently skip if seeding fails or database is already populated
      }

      const formData = new FormData();
      formData.append('username', demoEmail);
      formData.append('password', 'password');

      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      login(response.data.access_token, response.data.user);
      toast.success(`Demo Mode: Welcome back, ${response.data.user.name}!`);

      if (demoRole === 'Admin') navigate('/admin');
      else if (demoRole === 'Teacher') navigate('/teacher');
      else navigate('/dashboard');
    } catch (err: any) {
      toast.error('Could not initialize demo login. Make sure the API backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg-light dark:bg-apple-bg-dark bg-grid-pattern flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="text-indigo-500" size={38} />
            <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              School-In-A-Box
            </span>
          </Link>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark font-light text-center">
            AI-powered digital school platform management
          </p>
        </div>

        {/* Login Form Card */}
        <GlassCard className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Sign In</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 mt-2 text-sm font-semibold rounded-xl"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs">
            <span className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Don't have an account?{' '}
            </span>
            <Link to="/register" className="text-indigo-500 font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </GlassCard>

        {/* Demo Roles Panel */}
        <GlassCard className="p-6 border-indigo-500/10 bg-indigo-500/5 dark:bg-indigo-400/5">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-3 text-center">
            Demo Login Accounts (Auto-Seeded)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerDemoLogin('student@school.com', 'Student')}
              className="flex flex-col items-center gap-1.5 p-2 bg-white/40 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40 border border-apple-border-light dark:border-apple-border-dark rounded-xl transition-all"
            >
              <User size={16} className="text-indigo-500" />
              <span className="text-[10px] font-bold">Student</span>
            </button>

            <button
              onClick={() => triggerDemoLogin('teacher@school.com', 'Teacher')}
              className="flex flex-col items-center gap-1.5 p-2 bg-white/40 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40 border border-apple-border-light dark:border-apple-border-dark rounded-xl transition-all"
            >
              <ShieldCheck size={16} className="text-purple-500" />
              <span className="text-[10px] font-bold">Teacher</span>
            </button>

            <button
              onClick={() => triggerDemoLogin('admin@school.com', 'Admin')}
              className="flex flex-col items-center gap-1.5 p-2 bg-white/40 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40 border border-apple-border-light dark:border-apple-border-dark rounded-xl transition-all"
            >
              <Key size={16} className="text-pink-500" />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginPage;
