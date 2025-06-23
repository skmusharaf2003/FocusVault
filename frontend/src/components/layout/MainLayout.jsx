import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import FloatingFeedbackButton from '../FloatingFeedbackButton';
import useNewFeedbackStatus from '../../hooks/useNewFeedbackStatus';

const MainLayout = () => {
  const hasNew = useNewFeedbackStatus();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <Outlet />
        <FloatingFeedbackButton hasNewFeedback={hasNew} />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;