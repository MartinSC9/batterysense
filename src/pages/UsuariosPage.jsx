import { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  User,
  Filter,
  Mail,
  X,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Modal para crear/editar usuario
const UserModal = ({ isOpen, onClose, darkMode, clientes }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'cliente',
    clienteId: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el usuario
    console.log('Crear usuario:', formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        rounded-2xl border shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <User className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Nuevo Usuario
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Completa los datos del usuario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Juan"
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Apellido
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Pérez"
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="usuario@empresa.com"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre de usuario
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="juanperez"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Rol
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'admin', label: 'Admin', icon: Shield, color: 'purple' },
                { key: 'tecnico', label: 'Técnico', icon: User, color: 'blue' },
                { key: 'cliente', label: 'Cliente', icon: Building2, color: 'gray' },
              ].map(role => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleChange('role', role.key)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formData.role === role.key
                      ? (darkMode
                          ? `bg-${role.color}-500/20 border-${role.color}-500/50 text-${role.color}-400`
                          : `bg-${role.color}-100 border-${role.color}-300 text-${role.color}-700`)
                      : (darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300')
                  }`}
                >
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cliente (solo si rol es cliente) */}
          {formData.role === 'cliente' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Asignar a cliente
              </label>
              <select
                value={formData.clienteId}
                onChange={(e) => handleChange('clienteId', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Botones */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const UsuariosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Lista de clientes para el select
  const clientes = [
    { id: 1, nombre: 'Empresa ABC S.A.' },
    { id: 2, nombre: 'Telecomunicaciones XYZ' },
    { id: 3, nombre: 'Data Center Plus' },
    { id: 4, nombre: 'Energía Renovable SA' },
  ];

  // Datos simulados de usuarios
  const [usuarios] = useState([
    { id: 1, email: 'admin@batterysense.com', username: 'admin', firstName: 'Administrador', lastName: 'Sistema', role: 'admin', isActive: true, createdAt: '15/01/2026', lastLogin: '30/01/2026 14:30' },
    { id: 2, email: 'tecnico@empresa.com', username: 'tecnico1', firstName: 'Carlos', lastName: 'Rodríguez', role: 'tecnico', isActive: true, createdAt: '18/01/2026', lastLogin: '30/01/2026 12:15' },
    { id: 3, email: 'tecnico2@empresa.com', username: 'tecnico2', firstName: 'Laura', lastName: 'Méndez', role: 'tecnico', isActive: true, createdAt: '20/01/2026', lastLogin: '29/01/2026 18:45' },
    { id: 4, email: 'cliente@empresa.com', username: 'cliente1', firstName: 'Juan', lastName: 'Pérez', role: 'cliente', isActive: true, createdAt: '20/01/2026', lastLogin: '30/01/2026 10:00', cliente: 'Empresa ABC S.A.' },
    { id: 5, email: 'otro.cliente@empresa.com', username: 'cliente2', firstName: 'María', lastName: 'González', role: 'cliente', isActive: false, createdAt: '22/01/2026', lastLogin: '25/01/2026 09:30', cliente: 'Telecomunicaciones XYZ' },
    { id: 6, email: 'soporte@datacenter.com', username: 'cliente3', firstName: 'Pedro', lastName: 'Sánchez', role: 'cliente', isActive: true, createdAt: '25/01/2026', lastLogin: '30/01/2026 11:20', cliente: 'Data Center Plus' },
  ]);

  const roleConfig = darkMode ? {
    admin: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Administrador' },
    tecnico: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Técnico' },
    cliente: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'Cliente' },
  } : {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Administrador' },
    tecnico: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Técnico' },
    cliente: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cliente' },
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'inactive' && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  // Solo admin puede acceder
  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
        <div className="text-center">
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tienes permisos para acceder a esta sección</p>
          <button
            onClick={() => navigate('/dashboard-v4')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalActivos = usuarios.filter(u => u.isActive).length;
  const totalInactivos = usuarios.filter(u => !u.isActive).length;
  const totalAdmins = usuarios.filter(u => u.role === 'admin').length;
  const totalTecnicos = usuarios.filter(u => u.role === 'tecnico').length;
  const totalClientes = usuarios.filter(u => u.role === 'cliente').length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || 'admin'} darkMode={darkMode} />
      <UserModal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} darkMode={darkMode} clientes={clientes} />

      <Header
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        icon={Users}
        iconBgColor="bg-purple-600"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenuClick={() => setSidebarOpen(true)}
        maxWidth="max-w-[1600px]"
      />

      {/* Content */}
      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total usuarios</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{usuarios.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Activos</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalActivos}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administradores</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{totalAdmins}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Técnicos</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{totalTecnicos}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clientes</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{totalClientes}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Rol:</span>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'admin', label: 'Admin' },
                { key: 'tecnico', label: 'Técnico' },
                { key: 'cliente', label: 'Cliente' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterRole(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterRole === f.key
                      ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                      : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Estado:</span>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'active', label: 'Activos' },
                { key: 'inactive', label: 'Inactivos' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === f.key
                      ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                      : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsuarios.map((usuario) => {
            const config = roleConfig[usuario.role];

            return (
              <div
                key={usuario.id}
                className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        usuario.role === 'admin' ? 'bg-purple-500' :
                        usuario.role === 'tecnico' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        <span className="text-white font-semibold">
                          {usuario.firstName.charAt(0)}{usuario.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usuario.firstName} {usuario.lastName}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>@{usuario.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {usuario.isActive ? (
                        <span className={`w-2 h-2 rounded-full bg-emerald-500`} title="Activo" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full bg-gray-400`} title="Inactivo" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{usuario.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        <Shield className="w-3 h-3" />
                        {config.label}
                      </span>
                      {usuario.cliente && (
                        <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          {usuario.cliente}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <p>Último acceso: {usuario.lastLogin}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'}`}
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-gray-100 text-gray-500 hover:text-amber-600'}`}
                        title={usuario.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {usuario.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-rose-400' : 'hover:bg-gray-100 text-gray-500 hover:text-rose-600'}`}
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsuarios.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron usuarios</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsuariosPage;
