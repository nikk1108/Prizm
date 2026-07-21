import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PrizmLogo from '../common/PrizmLogo';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <PrizmLogo size={48} className="text-accent animate-pulse" />
          <span className="text-sm text-text-secondary animate-pulse font-sans">Initializing Session...</span>
        </div>
      </div>
    );
  }

  // Redirect to Feed if user already logged in
  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-150 font-sans">
      
      {/* LEFT SIDE: Brand presentation */}
      <div className="hidden md:flex md:w-1/2 bg-slate-50 dark:bg-slate-900/10 border-r border-border p-16 lg:p-24 flex-col justify-between relative overflow-hidden select-none">
        
        {/* Ambient lighting backdrop */}
        <div className="absolute top-[25%] left-[20%] w-64 h-64 rounded-full bg-accent/5 filter blur-[80px] pointer-events-none" />

        <div className="flex items-center space-x-2">
          <PrizmLogo size={24} className="text-accent" />
          <span className="font-bold text-text-primary text-sm tracking-tight uppercase">Prizm Identity</span>
        </div>

        <div className="my-auto space-y-8 max-w-md">
          {/* Large 3D Prizm Logo with subtle ambient lighting */}
          <div className="relative inline-block pb-4">
            <PrizmLogo size={128} className="text-text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight font-serif">
              Knowledge starts with curiosity.
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              Join thousands of developers, researchers, engineers, designers, scientists, and innovators sharing ideas that shape tomorrow.
            </p>
          </div>
        </div>

        <div className="text-[10px] text-text-secondary font-medium tracking-wider uppercase">
          © {new Date().getFullYear()} Prizm Platform
        </div>
      </div>

      {/* RIGHT SIDE: Auth cards */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
          <div className="md:hidden flex items-center space-x-2 mb-6">
            <PrizmLogo size={32} className="text-accent" />
            <span className="font-bold text-text-primary text-lg tracking-tight">Prizm</span>
          </div>

          <div className="hidden md:block mb-6">
            <PrizmLogo size={40} className="text-accent" />
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card border border-border py-8 px-6 shadow-sm rounded-lg sm:px-10">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
};
export default AuthLayout;
