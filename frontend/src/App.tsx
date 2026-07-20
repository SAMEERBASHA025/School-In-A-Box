import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LibraryPage from './pages/LibraryPage';
import AIChatPage from './pages/AIChatPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Layout Import
import DashboardLayout from './layouts/DashboardLayout';

// Guard component to enforce specific roles
const RoleRoute: React.FC<{ children: React.ReactElement; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-apple-bg-light dark:bg-apple-bg-dark">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their respective default dashboard
    const defaultPath =
      user.role === 'Admin'
        ? '/admin'
        : user.role === 'Teacher'
        ? '/teacher'
        : '/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export const AppContent: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Layout Routes */}
          <Route element={<DashboardLayout />}>
            {/* Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={['Student', 'Teacher', 'Admin']}>
                  <StudentDashboard />
                </RoleRoute>
              }
            />
            {/* Teacher Dashboard */}
            <Route
              path="/teacher"
              element={
                <RoleRoute allowedRoles={['Teacher', 'Admin']}>
                  <TeacherDashboard />
                </RoleRoute>
              }
            />
            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            
            {/* Common Shared Features */}
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat" element={<AIChatPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/result" element={<QuizResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Internal 404 handler */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Root Level 404 handler */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
