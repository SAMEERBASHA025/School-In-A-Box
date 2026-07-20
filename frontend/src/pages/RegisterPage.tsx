import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { GraduationCap, User, Lock, Mail, ChevronRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Student' | 'Teacher'>('Student');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warn('Please complete all form inputs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/register', {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role
      });

      login(response.data.access_token, response.data.user);
      toast.success(`Account registered! Welcome ${response.data.user.name}`);
      
      if (response.data.user.role === 'Teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg-light dark:bg-apple-bg-dark bg-grid-pattern flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute bottom-1/4 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="text-indigo-500" size={38} />
            <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              School-In-A-Box
            </span>
          </Link>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark font-light">
            Create your digital learning space profile
          </p>
        </div>

        <GlassCard className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Create Account</h2>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
                  required
                />
              </div>
            </div>

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
                  required
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
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark block">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'Student'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/10 text-apple-text-secondary-light dark:text-apple-text-secondary-dark'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Teacher')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'Teacher'
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400'
                      : 'border-apple-border-light dark:border-apple-border-dark bg-white/20 dark:bg-black/10 text-apple-text-secondary-light dark:text-apple-text-secondary-dark'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 mt-2 text-sm font-semibold rounded-xl"
            >
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>

          <div className="text-center text-xs">
            <span className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              Already have an account?{' '}
            </span>
            <Link to="/login" className="text-indigo-500 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterPage;
