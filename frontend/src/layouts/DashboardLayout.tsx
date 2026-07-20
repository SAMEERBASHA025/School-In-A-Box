import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If auth is loading, render a placeholder page
  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-apple-bg-light dark:bg-apple-bg-dark">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-apple-text-primary-light dark:text-apple-text-primary-dark">
          Initializing Platform...
        </h2>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-apple-bg-light dark:bg-apple-bg-dark flex flex-col">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Navbar />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile navigation footer for smaller screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-b-0 border-l-0 border-r-0 py-2 px-6 flex justify-around items-center z-40">
        <OutletNameMobile />
      </div>
    </div>
  );
};

// Simple mobile menu navigation
const OutletNameMobile: React.FC = () => {
  const { user } = useAuth();
  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Teacher') return '/teacher';
    return '/dashboard';
  };
  
  const links = [
    { to: getDashboardLink(), label: 'Home' },
    { to: '/library', label: 'Library' },
    { to: '/chat', label: 'AI Chat' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/profile', label: 'Profile' }
  ];

  return (
    <>
      {links.map((lnk) => (
        <NavLinkMobile key={lnk.to} to={lnk.to} label={lnk.label} />
      ))}
    </>
  );
};

import { NavLink as RRDNavLink } from 'react-router-dom';
const NavLinkMobile: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  return (
    <RRDNavLink
      to={to}
      className={({ isActive }) =>
        `text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
          isActive
            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            : 'text-apple-text-secondary-light dark:text-apple-text-secondary-dark'
        }`
      }
    >
      {label}
    </RRDNavLink>
  );
};

export default DashboardLayout;
