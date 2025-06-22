import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './components/home/Home';
import ReadingSpace from './pages/ReadingSpace';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AboutUs from './pages/AboutUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyEmail from './pages/auth/VerifyEmail';
import LoadingScreen from './components/ui/LoadingScreen';
import StudySession from './components/study/StudySession';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  const isOnVerifyPage = location.pathname.startsWith('/verify-email');

  if (user && !user.emailVerified && !isOnVerifyPage) {
    return <EmailVerification />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Routes>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {user ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<ReadingSpace />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/session" element={<StudySession />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
