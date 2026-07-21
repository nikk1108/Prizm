import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, Hash, BookOpen, Library, Award, Calendar, 
  Briefcase, FolderHeart, Bell, Settings, ShieldCheck, 
  LogOut, ChevronLeft, ChevronRight, GraduationCap, Code2, Users
} from 'lucide-react';
import type { RootState } from '../../store';
import { toggleSidebar } from '../../store/uiSlice';
import { useAuth } from '../../context/AuthContext';
import PrizmLogo from '../common/PrizmLogo';

export const Sidebar: React.FC = () => {
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const dispatch = useDispatch();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Feed', path: '/feed', icon: Home },
    { name: 'Explore Fields', path: '/fields', icon: Hash },
    { name: 'Research Explorer', path: '/research', icon: BookOpen },
    { name: 'Resource Library', path: '/resources', icon: Library },
    { name: 'Project Showcase', path: '/projects', icon: Award },
    { name: 'Events Calendar', path: '/events', icon: Calendar },
    { name: 'Internship & Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Bookmarks', path: '/bookmarks', icon: FolderHeart },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // If user is admin/moderator, show admin link
  if (user && (user.role === 'admin' || user.role === 'moderator')) {
    menuItems.push({ name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck });
  }

  // Helper to map badge icons
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'professor': return <span title="Professor"><GraduationCap className="h-3.5 w-3.5 text-blue-500" /></span>;
      case 'researcher': return <span title="Researcher"><BookOpen className="h-3.5 w-3.5 text-green-500" /></span>;
      case 'developer': return <span title="Developer"><Code2 className="h-3.5 w-3.5 text-orange-500" /></span>;
      case 'club': return <span title="Club"><Users className="h-3.5 w-3.5 text-purple-500" /></span>;
      default: return null;
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-card border-r border-border transition-all duration-200 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Logo & Collapse Trigger */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <NavLink to="/feed" className="flex items-center space-x-2 overflow-hidden">
          <PrizmLogo size={24} className="shrink-0 text-accent" />
          {sidebarOpen && (
            <span className="font-bold text-text-primary text-base tracking-tight whitespace-nowrap">
              Prizm
            </span>
          )}
        </NavLink>
        {sidebarOpen && (
          <button 
            onClick={() => dispatch(toggleSidebar())} 
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Expand for Collapsed Sidebar */}
      {!sidebarOpen && (
        <div className="px-3 py-2 border-t border-border flex justify-center">
          <button 
            onClick={() => dispatch(toggleSidebar())} 
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-text-secondary hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Authenticated User Panel */}
      {user && (
        <div className="border-t border-border p-3 flex flex-col space-y-2">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-border shrink-0 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary font-semibold flex items-center justify-center shrink-0 uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-text-primary text-xs truncate leading-tight">
                    {user.name}
                  </span>
                  {getBadgeIcon(user.verificationBadge)}
                </div>
                <span className="text-[10px] text-text-secondary leading-none">
                  {user.reputation} Reputation pts
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-danger font-medium rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
