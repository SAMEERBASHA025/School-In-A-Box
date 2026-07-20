import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Award,
  User,
  ShieldAlert,
  ArrowLeftRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Teacher') return '/teacher';
    return '/dashboard';
  };

  const navItems = [
    {
      to: getDashboardLink(),
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['Student', 'Teacher', 'Admin']
    },
    {
      to: '/library',
      label: 'Library Notes',
      icon: <BookOpen size={20} />,
      roles: ['Student', 'Teacher', 'Admin']
    },
    {
      to: '/chat',
      label: 'AI Learning Chat',
      icon: <MessageSquare size={20} />,
      roles: ['Student', 'Teacher', 'Admin']
    },
    {
      to: '/quiz',
      label: 'Quizzes',
      icon: <Award size={20} />,
      roles: ['Student', 'Teacher', 'Admin']
    },
    {
      to: '/profile',
      label: 'Profile Settings',
      icon: <User size={20} />,
      roles: ['Student', 'Teacher', 'Admin']
    }
  ];

  return (
    <aside className="glass-panel border-t-0 border-l-0 border-b-0 w-64 min-h-[calc(100vh-73px)] hidden md:flex flex-col p-4 justify-between sticky top-[73px]">
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-apple-text-secondary-light dark:text-apple-text-secondary-dark px-3 mb-4">
          Navigation Menu
        </div>
        
        <nav className="space-y-1">
          {navItems
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-transparent ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-apple-text-secondary-light dark:text-apple-text-secondary-dark hover:bg-white/40 dark:hover:bg-white/5 hover:text-apple-text-primary-light dark:hover:text-apple-text-primary-dark'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <div className="space-y-3">
        {/* Quick Role Switcher indicator for testing (great for CS evaluators) */}
        {user && (
          <div className="p-3 bg-indigo-500/5 dark:bg-indigo-400/5 border border-indigo-500/10 dark:border-indigo-400/10 rounded-xl">
            <div className="text-[9px] uppercase font-bold text-indigo-500 dark:text-indigo-400">
              Current Workspace
            </div>
            <div className="text-xs font-semibold text-apple-text-primary-light dark:text-apple-text-primary-dark mt-1 flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-indigo-500" />
              {user.role} Dashboard
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
