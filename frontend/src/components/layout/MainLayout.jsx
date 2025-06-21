import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;