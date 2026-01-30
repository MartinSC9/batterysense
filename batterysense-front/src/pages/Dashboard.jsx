import { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import {
  BatteryCharging,
  Menu,
  Bell,
  User,
  LogOut,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// Componente de Batería Visual
const BatteryIcon = ({ level, color = 'orange' }) => {
  const getColor = () => {
    if (color === 'orange') return '#f97316';
    if (color === 'blue') return '#3b82f6';
    return '#f97316';
  };

  const fillColor = getColor();
  const fillHeight = Math.min(100, Math.max(0, level));

  return (
    <div className="w-12 h-20">
      <svg viewBox="0 0 40 70" className="w-full h-full">
        <rect x="12" y="0" width="16" height="6" rx="2" fill="#d1d5db" />
        <rect x="4" y="6" width="32" height="58" rx="4" fill="none" stroke="#d1d5db" strokeWidth="3" />
        <rect
          x="7"
          y={10 + (52 * (100 - fillHeight) / 100)}
          width="26"
          height={52 * fillHeight / 100}
          rx="2"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

// Widget de Voltaje
const VoltageWidget = ({ title, value, batteryLevel, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 h-full">
    <h3 className="text-gray-700 font-semibold text-base mb-4">{title}</h3>
    <div className="flex items-center gap-4">
      <BatteryIcon level={batteryLevel} color={color} />
      <div>
        <div className="text-4xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  </div>
);

// Gráfico de línea simple
const LineChart = ({ title, data, color = 'orange' }) => {
  const maxValue = Math.max(...data.map(d => d.value)) * 1.05;
  const minValue = Math.min(...data.map(d => d.value)) * 0.95;
  const range = maxValue - minValue || 1;

  const lineColor = color === 'orange' ? '#f97316' : '#3b82f6';

  // Calcular puntos con coordenadas absolutas
  const chartWidth = 320;
  const chartHeight = 120;
  const padding = { left: 40, right: 10, top: 10, bottom: 25 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (data.length - 1)) * graphWidth;
  const getY = (value) => padding.top + graphHeight - ((value - minValue) / range) * graphHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-700 font-semibold text-base">{title}</h3>
        <span className="text-sm text-gray-400">Default Y axis</span>
      </div>
      <div className="w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
          {/* Líneas de guía horizontales */}
          {[0, 1, 2, 3].map((i) => {
            const y = padding.top + (i / 3) * graphHeight;
            return (
              <line key={i} x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            );
          })}

          {/* Línea del gráfico */}
          <polyline fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Puntos */}
          {data.map((d, i) => (
            <circle key={i} cx={getX(i)} cy={getY(d.value)} r="5" fill={lineColor} />
          ))}

          {/* Eje Y valores */}
          <text x={padding.left - 5} y={padding.top + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{maxValue.toFixed(1)}</text>
          <text x={padding.left - 5} y={padding.top + graphHeight} textAnchor="end" fontSize="11" fill="#9ca3af">{minValue.toFixed(1)}</text>

          {/* Eje X etiquetas */}
          <text x={padding.left} y={chartHeight - 5} textAnchor="start" fontSize="10" fill="#9ca3af">2026-01-21</text>
          <text x={chartWidth / 2} y={chartHeight - 5} textAnchor="middle" fontSize="10" fill="#9ca3af">19:30</text>
          <text x={chartWidth - padding.right} y={chartHeight - 5} textAnchor="end" fontSize="10" fill="#9ca3af">2026-01-21</text>
        </svg>
      </div>
    </div>
  );
};

// Widget de Celdas
const CellWidget = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col justify-center">
    <h3 className="text-gray-700 font-semibold text-base">{title}</h3>
    <p className="text-sm text-gray-400">Last Value</p>
    <div className="text-5xl font-bold text-blue-500 my-2">{value}</div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const lastUpdated = '2026-01-21 20:58';

  // Datos de voltaje
  const voltageData = [
    { title: 'Voltaje 1', value: '56.00', batteryLevel: 85, color: 'orange' },
    { title: 'Voltaje 2', value: '28.65', batteryLevel: 45, color: 'blue' },
    { title: 'Voltaje 3', value: '36.51', batteryLevel: 60, color: 'orange' },
  ];

  // Datos de celdas
  const cellsMain = [29, 37, 28];
  const cellsRight = [29, 29, 29];

  // Datos para gráficos
  const chartData = [
    [{ value: 55.5 }, { value: 56.2 }, { value: 55.8 }, { value: 56.0 }, { value: 55.9 }, { value: 56.0 }],
    [{ value: 28.0 }, { value: 28.5 }, { value: 29.0 }, { value: 55.0 }, { value: 28.8 }, { value: 28.65 }],
    [{ value: 36.0 }, { value: 36.3 }, { value: 36.5 }, { value: 36.4 }, { value: 36.6 }, { value: 36.51 }],
  ];

  const formatDateTime = (date) => {
    return date.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || 'cliente'} />

      {/* Header */}
      <header className="bg-gray-800 text-white px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-700 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-blue-400" />
            <h1 className="text-base lg:text-lg font-semibold">Banco de Baterías</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDateTime(currentDateTime)}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-700 px-3 py-1.5 rounded-lg text-sm cursor-pointer">
            <span>Now</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm hidden lg:block">{user?.username || 'admin'}</span>
            <button onClick={logout} className="p-2 hover:bg-gray-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        {/* Info de última actualización */}
        <div className="flex justify-end mb-4">
          <span className="text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </span>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {[0, 1, 2].map((row) => (
            <div key={row} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              {/* Voltaje Widget */}
              <div>
                <VoltageWidget
                  title={voltageData[row].title}
                  value={voltageData[row].value}
                  batteryLevel={voltageData[row].batteryLevel}
                  color={voltageData[row].color}
                />
              </div>

              {/* Gráfico */}
              <div>
                <LineChart
                  title={voltageData[row].title}
                  data={chartData[row]}
                  color={voltageData[row].color}
                />
              </div>

              {/* Celdas principal */}
              <div>
                <CellWidget
                  title={`Celdas ${row + 1}`}
                  value={cellsMain[row]}
                />
              </div>

              {/* Celdas derecha */}
              <div>
                <CellWidget
                  title="Celdas 1"
                  value={cellsRight[row]}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
