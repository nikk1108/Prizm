import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Dashboard Pages
import Feed from './pages/Feed/Feed';
import Fields from './pages/Fields/Fields';
import FieldDetail from './pages/FieldDetail';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import RoadmapDetail from './pages/RoadmapDetail';
import ResearchExplorer from './pages/ResearchExplorer';
import ResourceLibrary from './pages/ResourceLibrary';
import ProjectShowcase from './pages/ProjectShowcase';
import EventsCalendar from './pages/EventsCalendar';
import InternshipJobs from './pages/InternshipJobs';

// Setup React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                
                {/* Public Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Dashboard Workspace routes */}
                <Route element={<DashboardLayout />}>
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/fields" element={<Fields />} />
                  <Route path="/fields/:slug" element={<FieldDetail />} />
                  <Route path="/posts/:slug" element={<PostDetail />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />
                  <Route path="/research" element={<ResearchExplorer />} />
                  <Route path="/resources" element={<ResourceLibrary />} />
                  <Route path="/projects" element={<ProjectShowcase />} />
                  <Route path="/events" element={<EventsCalendar />} />
                  <Route path="/jobs" element={<InternshipJobs />} />
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/feed" replace />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/feed" replace />} />

              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};
export default App;
