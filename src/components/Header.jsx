import { useAuth } from '@core/contexts/AuthContext';
import {
  Menu,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';

const Header = ({
  title,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-600',
  darkMode,
  setDarkMode,
  onMenuClick,
  rightContent,
  maxWidth = 'max-w-7xl',
}) => {
  const { user, logout } = useAuth();

  return (
    <header className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur border-b px-4 lg:px-6 py-4 sticky top-0 z-30`}>
      <div className={`flex items-center justify-between ${maxWidth} mx-auto`}>
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className={`text-base sm:text-lg font-semibold truncate block ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</span>
              {subtitle && (
                <p className={`text-xs hidden sm:block ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Custom right content (e.g., alerts button) */}
          {rightContent}

          {/* Dark mode toggle - hidden on mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`hidden sm:flex p-2.5 rounded-xl transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User section */}
          <div className={`flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium hidden lg:block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {user?.username || 'Usuario'}
            </span>
            <button
              onClick={logout}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title="Cerrar sesión"
            >
              <LogOut className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
