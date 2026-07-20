import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <GlassCard className="p-8 border-indigo-500/10 space-y-4">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mx-auto animate-bounce">
            <HelpCircle size={28} />
          </div>
          
          <h2 className="text-4xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            404
          </h2>
          
          <h3 className="font-bold text-lg">
            Page Not Found
          </h3>
          
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark font-light leading-relaxed">
            The workspace URL you are looking for has been moved or doesn't exist. Check your navigation path.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="glass-btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              Go to Homepage <ChevronRight size={14} />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFoundPage;
