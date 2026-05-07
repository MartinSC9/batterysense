import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import {
  LogOut,
  Sun,
  Moon,
  Bell,
  BatteryCharging,
  ChevronDown,
  Clock,
  Menu,
  AlertTriangle,
} from 'lucide-react';

const Header = ({
  darkMode,
  setDarkMode,
  onMenuToggle,
  alarms = [],
  lastDataTimestamp,
  getRelativeTime,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  const initials = (user?.name || 'U')[0].toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    if (bellOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [bellOpen]);

  const hasAlarms = alarms.length > 0;

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md border-b"
      style={{
        backgroundColor: darkMode ? 'rgba(3,7,18,0.88)' : 'rgba(255,255,255,0.85)',
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
      }}
    >
      <div className="flex items-center h-14 px-4 sm:px-5">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className={`md:hidden p-2 -ml-1 mr-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/[0.08] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Left: Logo + Product name */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className={`p-1.5 rounded-md ${darkMode ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
            <BatteryCharging className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <span className={`hidden sm:block text-sm font-semibold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            BatterySense
          </span>
        </button>

        {/* Center spacer + last update */}
        <div className="flex-1 flex justify-end items-center mr-2">
          {lastDataTimestamp && getRelativeTime && (
            <span className={`hidden md:flex items-center gap-1.5 text-[12px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              Datos de hace {getRelativeTime(lastDataTimestamp)}
            </span>
          )}
        </div>

        {/* Notification bell — mobile only */}
        <div className="relative md:hidden" ref={bellRef}>
          <button
            onClick={() => {
              if (hasAlarms) {
                setBellOpen(v => !v);
              } else {
                navigate('/alertas');
              }
            }}
            className={`relative p-2 rounded-lg transition-colors ${
              hasAlarms
                ? (darkMode ? 'text-amber-400 hover:bg-amber-500/15' : 'text-amber-500 hover:bg-amber-50')
                : (darkMode ? 'hover:bg-white/[0.06] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700')
            }`}
          >
            <Bell className="w-5 h-5" />
            {hasAlarms && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold leading-none bg-amber-500">
                {alarms.length}
              </span>
            )}
          </button>

          {bellOpen && hasAlarms && (
            <div
              className="absolute right-0 mt-1.5 w-80 rounded-lg border shadow-lg overflow-hidden"
              style={{
                backgroundColor: darkMode ? '#111827' : '#ffffff',
                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
                boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <div className="max-h-72 overflow-y-auto">
                {alarms.slice(0, 5).map((alarm, i) => (
                  <div key={i} className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-3 ${darkMode ? 'border-white/[0.06]' : 'border-gray-50'}`}>
                    <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${darkMode ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
                      <AlertTriangle className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] leading-snug font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{alarm.title}</p>
                      <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{alarm.description}</p>
                    </div>
                    {alarm.time && <span className={`text-[10px] shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>{alarm.time}</span>}
                  </div>
                ))}
              </div>
              <div className={`border-t ${darkMode ? 'border-white/[0.10]' : 'border-gray-100'}`}>
                <button
                  onClick={() => { navigate('/alertas'); setBellOpen(false); }}
                  className={`w-full px-4 py-2.5 text-[13px] font-medium text-center transition-colors ${darkMode ? 'text-blue-400 hover:bg-white/[0.06]' : 'text-blue-600 hover:bg-gray-50'}`}
                >
                  Ver todas las alertas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Avatar dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
              style={{ backgroundColor: darkMode ? 'rgba(59,130,246,0.25)' : '#eff6ff', color: darkMode ? '#93c5fd' : '#2563eb' }}
            >
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-56 rounded-lg border shadow-lg overflow-hidden"
              style={{ backgroundColor: darkMode ? '#111827' : '#ffffff', borderColor: darkMode ? 'rgba(255,255,255,0.12)' : '#e5e7eb', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-white/[0.10]' : 'border-gray-100'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user?.name || 'Usuario'}</p>
                <p className={`text-[11px] mt-0.5 text-gray-400`}>{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setDarkMode(!darkMode); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${darkMode ? 'text-gray-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                  {darkMode ? 'Modo claro' : 'Modo oscuro'}
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
