import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<any[]>('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel border-t-0 border-l-0 border-r-0 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          School-In-A-Box
        </h1>
        <span className="hidden md:inline text-xs bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium border border-indigo-500/20">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
              className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-apple-border-light dark:border-apple-border-dark text-apple-text-primary-light dark:text-apple-text-primary-dark hover:bg-white/60 dark:hover:bg-white/10 transition-colors relative"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel border border-apple-border-light dark:border-apple-border-dark shadow-2xl rounded-2xl p-4 z-40 text-left">
                <div className="flex justify-between items-center border-b border-apple-border-light dark:border-apple-border-dark pb-2 mb-2">
                  <h4 className="font-bold text-sm text-apple-text-primary-light dark:text-apple-text-primary-dark">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-xl border transition-all text-xs ${
                          n.is_read
                            ? 'bg-transparent border-transparent'
                            : 'bg-indigo-500/5 dark:bg-indigo-400/5 border-indigo-500/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-apple-text-primary-light dark:text-apple-text-primary-dark">
                            {n.title}
                          </h5>
                          <span className="text-[8px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark leading-relaxed mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-apple-border-light dark:border-apple-border-dark text-apple-text-primary-light dark:text-apple-text-primary-dark hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Info & Dropdown */}
        {user && (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-apple-border-light dark:hover:border-apple-border-dark"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-apple-text-primary-light dark:text-apple-text-primary-dark">
                  {user.name}
                </div>
                <div className="text-[10px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark font-medium capitalize">
                  {user.role}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/15"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
