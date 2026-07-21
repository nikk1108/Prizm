import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { RootState } from '../../store';
import { toggleCompose } from '../../store/uiSlice';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import ComposeModal from '../features/ComposeModal'; // We will build this next

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const composeOpen = useSelector((state: RootState) => state.ui.composeOpen);
  const dispatch = useDispatch();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 rounded bg-accent animate-pulse flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-sm text-text-secondary animate-pulse">Loading Profile...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-150">
      {/* 1. Collapsible Sidebar */}
      <Sidebar />

      {/* 2. Content Layout wrapper */}
      <div 
        className={`min-h-screen flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        } pb-14 md:pb-0`}
      >
        {/* Top Navbar Header */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. Mobile Bottom navigation */}
      <BottomNav />

      {/* 4. Floating Action Compose Button (Desktop only) */}
      <button
        onClick={() => dispatch(toggleCompose())}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 z-40 hidden md:flex"
        title="Compose Post"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* 5. Compose Post Modal dialog */}
      {composeOpen && <ComposeModal />}
    </div>
  );
};
export default DashboardLayout;
