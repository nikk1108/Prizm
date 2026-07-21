import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Hash, PlusSquare, FolderHeart, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleCompose } from '../../store/uiSlice';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border z-30 flex items-center justify-around md:hidden px-2 shadow-lg">
      <NavLink
        to="/feed"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-0.5 text-xs transition-colors ${
            isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <Home className="h-5 w-5" />
        <span>Feed</span>
      </NavLink>

      <NavLink
        to="/fields"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-0.5 text-xs transition-colors ${
            isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <Hash className="h-5 w-5" />
        <span>Explore</span>
      </NavLink>

      {/* Floating Compose trigger */}
      <button
        onClick={() => dispatch(toggleCompose())}
        className="flex flex-col items-center justify-center space-y-0.5 text-xs text-text-secondary hover:text-text-primary active:scale-95"
      >
        <PlusSquare className="h-5 w-5 text-accent" />
        <span>Compose</span>
      </button>

      <NavLink
        to="/bookmarks"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-0.5 text-xs transition-colors ${
            isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <FolderHeart className="h-5 w-5" />
        <span>Saves</span>
      </NavLink>

      {user && (
        <NavLink
          to={`/profile/${user.id || user._id}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 text-xs transition-colors ${
              isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            }`
          }
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
      )}
    </nav>
  );
};
export default BottomNav;
