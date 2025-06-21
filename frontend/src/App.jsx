import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/Home';
import ReadingSpace from './pages/ReadingSpace';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AboutUs from './pages/AboutUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Routes>
        {user ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<ReadingSpace />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;