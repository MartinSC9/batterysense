import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import ProtectedRoute from '@core/routes/ProtectedRoute';
import UnifiedAuthPage from '@features/auth/pages/UnifiedAuthPage';
import Dashboard from './pages/Dashboard';
import DashboardV4 from './pages/DashboardV4';
import ConfiguracionPage from './pages/ConfiguracionPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route path="/" element={<UnifiedAuthPage />} />

      {/* Dashboard V1 - Original */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Dashboard V4 - Con toggle dark/light */}
      <Route
        path="/dashboard-v4"
        element={
          <ProtectedRoute>
            <DashboardV4 />
          </ProtectedRoute>
        }
      />

      {/* Configuración - Técnico y Admin */}
      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <ConfiguracionPage />
          </ProtectedRoute>
        }
      />

      {/* Usuarios - Solo Admin */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      {/* Clientes - Solo Admin */}
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientesPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirigir al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
