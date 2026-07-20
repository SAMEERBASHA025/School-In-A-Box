import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { User, Lock, Mail, ShieldAlert, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.warn('Please fill in name and email');
      return;
    }

    setProfileLoading(true);
    try {
      await api.put('/profile', {
        name: name.trim(),
        email: email.trim()
      });
      toast.success('Profile details updated successfully!');
      refreshUser(); // sync context state
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warn('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warn("New password confirmation doesn't match");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Incorrect old password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pb-20">
      <div>
        <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
          Profile Settings
        </h2>
        <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
          Modify your display parameters and keep your credentials secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Profile details card */}
        <div className="md:col-span-4 space-y-6">
          <GlassCard className="p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black mx-auto shadow-md">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-left space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">Full Name</span>
                <p className="text-sm font-semibold">{user?.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">Email Address</span>
                <p className="text-sm font-semibold truncate">{user?.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">Account Role</span>
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-500 mt-0.5">
                  <ShieldAlert size={14} />
                  <span>{user?.role} Access</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Account Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* Edit Profile Form */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-lg border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              Update Profile Information
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Display Name"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@school.com"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="glass-btn-primary py-2 px-5 text-sm font-semibold rounded-xl"
              >
                {profileLoading ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </GlassCard>

          {/* Change Password Form */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-lg border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              Modify Password Credentials
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Old Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="glass-btn-primary py-2 px-5 text-sm font-semibold rounded-xl"
              >
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
