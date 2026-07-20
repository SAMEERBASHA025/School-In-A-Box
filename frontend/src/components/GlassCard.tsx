import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverable = false }) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
