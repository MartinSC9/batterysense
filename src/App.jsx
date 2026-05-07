import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import ProtectedRoute from '@core/routes/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UnifiedAuthPage from '@features/auth/pages/UnifiedAuthPage';
import Dashboard from './pages/Dashboard';
import AlarmasPage from './pages/AlarmasPage';
import ReportesPage from './pages/ReportesPage';
import KioskoPage from './pages/KioskoPage';

function readDarkMode() {
  try {
    const saved = localStorage.getItem('bs_darkMode');
    if (saved !== null) return JSON.parse(saved);
  } catch {}
  return true; // default dark
}

function AppLayout({ children, darkMode, setDarkMode, alarms, lastDataTimestamp, getRelativeTime }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: darkMode ? '#030712' : '#f9fafb',
        color: darkMode ? '#e5e7eb' : '#111827',
      }}
    >
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenuToggle={() => setSidebarOpen(true)}
        alarms={alarms}
        lastDataTimestamp={lastDataTimestamp}
        getRelativeTime={getRelativeTime}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          darkMode={darkMode}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          alarmCount={alarms.length}
        />
        <main
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto relative"
          style={{
            backgroundImage: darkMode
              ? 'radial-gradient(circle, rgba(59,130,246,0.10) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(59,130,246,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="max-w-6xl mx-auto relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(readDarkMode);
  const [alarms, setAlarms] = useState([]);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);

  useEffect(() => {
    if (isAuthenticated) setDarkMode(readDarkMode());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('bs_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const getRelativeTime = useCallback((timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'menos de 1 min';
    if (mins === 1) return '1 min';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return '1 hora';
    if (hours < 24) return `${hours} horas`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 día';
    return `${days} días`;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const layoutProps = { darkMode, setDarkMode: toggleDarkMode, alarms, lastDataTimestamp, getRelativeTime };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <UnifiedAuthPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout {...layoutProps}>
          <Dashboard darkMode={darkMode} setAlarms={setAlarms} setLastDataTimestamp={setLastDataTimestamp} getRelativeTime={getRelativeTime} />
        </AppLayout></ProtectedRoute>
      } />

      <Route path="/alertas" element={
        <ProtectedRoute><AppLayout {...layoutProps}>
          <AlarmasPage darkMode={darkMode} />
        </AppLayout></ProtectedRoute>
      } />

      <Route path="/reportes" element={
        <ProtectedRoute><AppLayout {...layoutProps}>
          <ReportesPage darkMode={darkMode} />
        </AppLayout></ProtectedRoute>
      } />

      <Route path="/kiosco" element={
        <ProtectedRoute>
          <KioskoPage darkMode={darkMode} />
        </ProtectedRoute>
      } />

      <Route path="/alarmas" element={<Navigate to="/alertas" replace />} />
      <Route path="/dashboard-v4" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
