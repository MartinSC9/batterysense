import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@features/auth/services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getUser();
        const hasToken = authService.isAuthenticated();

        if (storedUser && hasToken) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  // Actualizar usuario
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    const stored = authService.getUser();
    if (stored) {
      localStorage.setItem('user', JSON.stringify({ ...stored, ...userData }));
    }
  };

  // Establecer usuario después de login/registro
  const setAuthUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    setAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
