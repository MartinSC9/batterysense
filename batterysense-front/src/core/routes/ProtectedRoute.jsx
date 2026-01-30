import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos, verificar
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirigir al dashboard correspondiente al rol del usuario
    const rolePaths = {
      admin: '/admin/dashboard',
      tecnico: '/tecnico/dashboard',
      cliente: '/cliente/dashboard',
    };
    return <Navigate to={rolePaths[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
