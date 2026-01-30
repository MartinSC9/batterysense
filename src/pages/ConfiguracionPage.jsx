import { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Thermometer,
  Zap,
  Droplets,
  Activity,
  Save,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ConfiguracionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Estados para umbrales
  const [umbrales, setUmbrales] = useState({
    voltaje: { min: 1.90, max: 2.10, warning: 1.95 },
    temperatura: { min: 15, max: 35, warning: 32 },
    corriente: { min: 0, max: 20, warning: 18 },
    humedad: { min: 30, max: 60, warning: 55 },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setUmbrales({
      voltaje: { min: 1.90, max: 2.10, warning: 1.95 },
      temperatura: { min: 15, max: 35, warning: 32 },
      corriente: { min: 0, max: 20, warning: 18 },
      humedad: { min: 30, max: 60, warning: 55 },
    });
  };

  const UmbralCard = ({ title, icon: Icon, param, unit, color }) => (
    <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? `${color}/20` : color.replace('bg-', 'bg-').replace('-500', '-50')}`}>
          <Icon className={`w-5 h-5 ${darkMode ? color.replace('bg-', 'text-').replace('-500', '-400') : color.replace('bg-', 'text-').replace('-500', '-600')}`} />
        </div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mínimo crítico ({unit})
          </label>
          <input
            type="number"
            step="0.01"
            value={umbrales[param].min}
            onChange={(e) => setUmbrales({
              ...umbrales,
              [param]: { ...umbrales[param], min: parseFloat(e.target.value) }
            })}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              darkMode
                ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Umbral advertencia ({unit})
          </label>
          <input
            type="number"
            step="0.01"
            value={umbrales[param].warning}
            onChange={(e) => setUmbrales({
              ...umbrales,
              [param]: { ...umbrales[param], warning: parseFloat(e.target.value) }
            })}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              darkMode
                ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Máximo crítico ({unit})
          </label>
          <input
            type="number"
            step="0.01"
            value={umbrales[param].max}
            onChange={(e) => setUmbrales({
              ...umbrales,
              [param]: { ...umbrales[param], max: parseFloat(e.target.value) }
            })}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              darkMode
                ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
      </div>
    </div>
  );

  // Solo técnico y admin pueden acceder
  if (user?.role === 'cliente') {
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role || 'tecnico'}
        darkMode={darkMode}
      />

      <Header
        title="Configuración"
        subtitle="Umbrales y alarmas"
        icon={Settings}
        iconBgColor="bg-amber-600"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenuClick={() => setSidebarOpen(true)}
        maxWidth="max-w-[1600px]"
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        }
      />

      {/* Content */}
      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Success message */}
        {saved && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            darkMode
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <CheckCircle className="w-5 h-5" />
            Configuración guardada exitosamente
          </div>
        )}

        {/* Title section */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl p-6 border mb-6`}>
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Umbrales de alarma
          </h2>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            Define los valores mínimos, máximos y de advertencia para cada parámetro.
            Las alarmas se activarán cuando los valores superen estos umbrales.
          </p>
        </div>

        {/* Umbrales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UmbralCard title="Voltaje" icon={Zap} param="voltaje" unit="V" color="bg-yellow-500" />
          <UmbralCard title="Temperatura" icon={Thermometer} param="temperatura" unit="°C" color="bg-rose-500" />
          <UmbralCard title="Corriente" icon={Activity} param="corriente" unit="A" color="bg-blue-500" />
          <UmbralCard title="Humedad" icon={Droplets} param="humedad" unit="%" color="bg-cyan-500" />
        </div>

        {/* Info card */}
        <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
          <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            <strong>Nota:</strong> Los cambios en los umbrales afectarán a todas las alarmas del sistema.
            Los valores de advertencia generan alertas amarillas, mientras que superar los valores mínimos o máximos genera alertas críticas (rojas).
          </p>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracionPage;
