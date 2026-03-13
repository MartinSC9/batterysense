import { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  BatteryCharging,
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Eye,
  Edit,
  Filter,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ClientesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Datos simulados de clientes
  const [clientes] = useState([
    {
      id: 1,
      nombre: 'Enertec Soluciones S.A.',
      ubicacion: 'Parque Industrial Ferreyra, Córdoba',
      bancos: 3,
      sensores: 45,
      alarms: 2,
      status: 'warning',
      ultimaLectura: '13/03/2026 14:30',
      contacto: 'Diego Ferreyra',
      email: 'contacto@enertec.com.ar',
    },
    {
      id: 2,
      nombre: 'TelcoSur Comunicaciones',
      ubicacion: 'Barrio General Paz, Córdoba',
      bancos: 5,
      sensores: 78,
      alarms: 0,
      status: 'normal',
      ultimaLectura: '13/03/2026 14:28',
      contacto: 'Gabriela Mansilla',
      email: 'admin@telcosur.com.ar',
    },
    {
      id: 3,
      nombre: 'DataHouse Argentina',
      ubicacion: 'Parque Empresarial Aeropuerto, Córdoba',
      bancos: 8,
      sensores: 120,
      alarms: 5,
      status: 'critical',
      ultimaLectura: '13/03/2026 14:25',
      contacto: 'Nicolás Bianchi',
      email: 'infra@datahouse.com.ar',
    },
    {
      id: 4,
      nombre: 'SolarCba Energía Renovable',
      ubicacion: 'Ruta 5 km 12, Villa Carlos Paz',
      bancos: 2,
      sensores: 24,
      alarms: 0,
      status: 'normal',
      ultimaLectura: '13/03/2026 14:20',
      contacto: 'Ana Lucía Torres',
      email: 'operaciones@solarcba.com.ar',
    },
  ]);

  const statusConfig = darkMode ? {
    normal: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Operativo' },
    warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertTriangle, label: 'Advertencia' },
    critical: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: AlertTriangle, label: 'Crítico' },
  } : {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle, label: 'Operativo' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle, label: 'Advertencia' },
    critical: { bg: 'bg-rose-50', text: 'text-rose-600', icon: AlertTriangle, label: 'Crítico' },
  };

  const filteredClientes = clientes.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchFilter;
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

  const totalBancos = clientes.reduce((acc, c) => acc + c.bancos, 0);
  const totalSensores = clientes.reduce((acc, c) => acc + c.sensores, 0);
  const totalAlarmas = clientes.reduce((acc, c) => acc + c.alarms, 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || 'admin'} darkMode={darkMode} />

      <Header
        title="Clientes"
        subtitle="Gestión de instalaciones"
        icon={Building2}
        iconBgColor="bg-blue-600"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenuClick={() => setSidebarOpen(true)}
        maxWidth="max-w-[1600px]"
      />

      {/* Content */}
      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <Building2 className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total clientes</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{clientes.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
              <BatteryCharging className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total bancos</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalBancos}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
              <Activity className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total sensores</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalSensores}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-rose-500/20' : 'bg-rose-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alarmas activas</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>{totalAlarmas}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-4 border mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'normal', label: 'Operativo' },
                  { key: 'warning', label: 'Advertencia' },
                  { key: 'critical', label: 'Crítico' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === f.key
                        ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                        : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Clientes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredClientes.map((cliente) => {
            const config = statusConfig[cliente.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={cliente.id}
                className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800' : 'bg-white border-gray-200 hover:shadow-lg'} rounded-2xl border transition-all`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Building2 className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cliente.nombre}</h3>
                        <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <MapPin className="w-3 h-3" />
                          {cliente.ubicacion}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`text-center p-3 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <BatteryCharging className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cliente.bancos}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Bancos</p>
                    </div>
                    <div className={`text-center p-3 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <Activity className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cliente.sensores}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sensores</p>
                    </div>
                    <div className={`text-center p-3 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${cliente.alarms > 0 ? (darkMode ? 'text-rose-400' : 'text-rose-500') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`} />
                      <p className={`text-lg font-bold ${cliente.alarms > 0 ? (darkMode ? 'text-rose-400' : 'text-rose-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                        {cliente.alarms}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Alarmas</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Última lectura: {cliente.ultimaLectura}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/dashboard-v4')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          darkMode
                            ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver bancos
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClientes.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron clientes</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientesPage;
