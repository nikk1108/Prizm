import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Search, Sun, Moon, Bell, Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toggleSidebar } from '../../store/uiSlice';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border sticky top-0 z-20 flex items-center justify-between px-4">
      {/* Mobile Sidebar Hamburger & Page Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Workspace
          </span>
          <span className="text-xs text-border">/</span>
          <span className="text-xs text-text-primary font-medium">Prizm</span>
        </div>
      </div>

      {/* Global Search Bar (GitHub style) */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search posts, research, projects, resources, users..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 text-text-primary border border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:bg-card transition-all"
          />
        </div>
      </form>

      {/* Top Menu Actions */}
      <div className="flex items-center space-x-2">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Icon Link */}
        <NavLink
          to="/notifications"
          className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Notification count placeholder */}
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
        </NavLink>

        {/* Short User Details mapping */}
        {user && (
          <NavLink
            to={`/profile/${user.id || user._id}`}
            className="flex items-center space-x-2 border-l border-border pl-3 ml-2"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="h-6 w-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary text-[10px] font-bold flex items-center justify-center uppercase">
                {user.name.charAt(0)}
              </div>
            )}
          </NavLink>
        )}
      </div>
    </header>
  );
};
export default Navbar;
