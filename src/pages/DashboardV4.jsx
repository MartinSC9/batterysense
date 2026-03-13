import { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import {
  BatteryCharging,
  Bell,
  Thermometer,
  Zap,
  Droplets,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  X,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Función para exportar a CSV
const exportToCSV = (banks, alarms) => {
  const now = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  let csv = 'REPORTE BATTERYSENSE\n';
  csv += `Fecha de exportación:,${new Date().toLocaleString('es-AR')}\n\n`;

  csv += 'RESUMEN DE BANCOS\n';
  csv += 'Banco,Ubicación,Voltaje (V),Temperatura (°C),Corriente (A),Humedad (%),Carga (%),Estado\n';

  banks.forEach(bank => {
    const criticalCells = bank.cells.filter(c => c.status === 'critical').length;
    const warningCells = bank.cells.filter(c => c.status === 'warning').length;
    const status = criticalCells > 0 ? 'Crítico' : warningCells > 0 ? 'Advertencia' : 'Normal';
    csv += `${bank.name},${bank.location},${bank.voltage},${bank.temperature},${bank.current},${bank.humidity},${bank.chargeLevel},${status}\n`;
  });

  csv += '\nDETALLE DE CELDAS\n';
  banks.forEach(bank => {
    csv += `\n${bank.name}\n`;
    csv += 'Celda,Voltaje (V),Estado\n';
    bank.cells.forEach((cell, i) => {
      csv += `Celda ${i + 1},${cell.voltage},${cell.status === 'normal' ? 'Normal' : cell.status === 'warning' ? 'Advertencia' : 'Crítico'}\n`;
    });
  });

  csv += '\nALARMAS ACTIVAS\n';
  csv += 'Severidad,Título,Descripción,Tiempo\n';
  alarms.forEach(alarm => {
    csv += `${alarm.severity === 'critical' ? 'Crítica' : 'Advertencia'},${alarm.title},${alarm.description},${alarm.time}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `batterysense_reporte_${now}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Batería visual
const BatteryVisual = ({ level, status, darkMode }) => {
  const colors = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' };

  return (
    <div className="w-16 h-28">
      <svg viewBox="0 0 64 112" className="w-full h-full">
        <rect x="20" y="0" width="24" height="8" rx="2" fill={darkMode ? '#374151' : '#d1d5db'} />
        <rect x="4" y="8" width="56" height="100" rx="8" fill={darkMode ? '#1f2937' : '#f3f4f6'} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />
        <rect
          x="8"
          y={16 + (88 * (100 - level) / 100)}
          width="48"
          height={88 * level / 100}
          rx="4"
          fill={colors[status]}
          className="transition-all duration-500"
        />
        <text x="32" y="65" textAnchor="middle" fontSize="18" fontWeight="bold" fill={darkMode ? '#e5e7eb' : '#374151'}>{level}%</text>
      </svg>
    </div>
  );
};

// Métrica
const MetricCard = ({ title, value, unit, icon: Icon, status, trend, darkMode }) => {
  const statusColors = {
    normal: { icon: darkMode ? 'text-emerald-400' : 'text-emerald-600', bg: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    warning: { icon: darkMode ? 'text-amber-400' : 'text-amber-600', bg: darkMode ? 'bg-amber-500/10' : 'bg-amber-50' },
    critical: { icon: darkMode ? 'text-rose-400' : 'text-rose-600', bg: darkMode ? 'bg-rose-500/10' : 'bg-rose-50' },
  };
  const config = statusColors[status];

  return (
    <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} backdrop-blur rounded-2xl p-4 border`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend > 0 ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-rose-400' : 'text-rose-600')}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{unit}</span>
      </div>
    </div>
  );
};

// Celda
const CellItem = ({ number, voltage, status, darkMode }) => {
  const colors = darkMode ? {
    normal: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    critical: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
  } : {
    normal: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'from-amber-100 to-amber-50 border-amber-200 text-amber-700',
    critical: 'from-rose-100 to-rose-50 border-rose-200 text-rose-700',
  };

  return (
    <div className={`bg-gradient-to-b ${colors[status]} border rounded-xl p-2 text-center hover:scale-105 transition-transform`}>
      <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>C{number}</span>
      <p className="text-sm font-semibold">{voltage}V</p>
    </div>
  );
};

// Alarma
const AlarmItem = ({ alarm, darkMode, detailed = false }) => {
  const colors = darkMode ? {
    critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
  } : {
    critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  };
  const config = colors[alarm.severity];
  const Icon = alarm.severity === 'critical' ? XCircle : AlertTriangle;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <Icon className={`w-5 h-5 ${config.icon} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{alarm.title}</p>
          {detailed && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {alarm.severity === 'critical' ? 'Crítica' : 'Advertencia'}
            </span>
          )}
        </div>
        <p className={`text-xs ${detailed ? '' : 'truncate'} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{alarm.description}</p>
        {detailed && alarm.timestamp && (
          <p className={`text-[10px] mt-1 flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {alarm.timestamp}
          </p>
        )}
      </div>
      <span className={`text-xs whitespace-nowrap ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{alarm.time}</span>
    </div>
  );
};

// Modal de Alertas
const AlertsModal = ({ isOpen, onClose, alarms, darkMode }) => {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const filteredAlarms = filter === 'all'
    ? alarms
    : alarms.filter(a => a.severity === filter);

  const criticalCount = alarms.filter(a => a.severity === 'critical').length;
  const warningCount = alarms.filter(a => a.severity === 'warning').length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] z-50
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        rounded-2xl border shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Todas las Alertas
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {alarms.length} alertas activas
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className={`flex items-center gap-2 px-5 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              Todas ({alarms.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'critical'
                  ? (darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              Críticas ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'warning'
                  ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              Advertencias ({warningCount})
            </button>
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-180px)] space-y-3">
          {filteredAlarms.length > 0 ? (
            filteredAlarms.map((alarm, i) => (
              <AlarmItem key={i} alarm={alarm} darkMode={darkMode} detailed />
            ))
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay alertas de este tipo</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Datos mock para diferentes períodos
const generateMockData = (type, period) => {
  const voltageBase = 48;
  const tempBase = 30;

  const configs = {
    voltage: {
      today: [
        { time: '00:00', value: 48.1 }, { time: '04:00', value: 47.8 },
        { time: '08:00', value: 48.2 }, { time: '12:00', value: 48.5 },
        { time: '16:00', value: 47.9 }, { time: '20:00', value: 48.3 }, { time: 'Ahora', value: 48.5 },
      ],
      week: [
        { time: 'Lun', value: 48.2 }, { time: 'Mar', value: 47.5 },
        { time: 'Mié', value: 48.8 }, { time: 'Jue', value: 47.2 },
        { time: 'Vie', value: 48.1 }, { time: 'Sáb', value: 48.6 }, { time: 'Hoy', value: 48.5 },
      ],
      month: [
        { time: 'Sem 1', value: 48.3 }, { time: 'Sem 2', value: 47.8 },
        { time: 'Sem 3', value: 48.5 }, { time: 'Sem 4', value: 48.1 }, { time: 'Actual', value: 48.5 },
      ],
      quarter: [
        { time: 'Oct', value: 48.0 }, { time: 'Nov', value: 47.5 },
        { time: 'Dic', value: 48.2 }, { time: 'Ene', value: 48.5 },
      ],
    },
    temperature: {
      today: [
        { time: '00:00', value: 25 }, { time: '04:00', value: 24 },
        { time: '08:00', value: 28 }, { time: '12:00', value: 34 },
        { time: '16:00', value: 36 }, { time: '20:00', value: 31 }, { time: 'Ahora', value: 32 },
      ],
      week: [
        { time: 'Lun', value: 30 }, { time: 'Mar', value: 32 },
        { time: 'Mié', value: 35 }, { time: 'Jue', value: 33 },
        { time: 'Vie', value: 31 }, { time: 'Sáb', value: 29 }, { time: 'Hoy', value: 32 },
      ],
      month: [
        { time: 'Sem 1', value: 28 }, { time: 'Sem 2', value: 31 },
        { time: 'Sem 3', value: 34 }, { time: 'Sem 4', value: 30 }, { time: 'Actual', value: 32 },
      ],
      quarter: [
        { time: 'Oct', value: 26 }, { time: 'Nov', value: 29 },
        { time: 'Dic', value: 32 }, { time: 'Ene', value: 32 },
      ],
    },
  };

  return configs[type]?.[period] || configs[type]?.today;
};

// Gráfico con filtros de fecha
const ChartWithFilters = ({ title, type, darkMode, unit = '' }) => {
  const [period, setPeriod] = useState('today');
  const [statType, setStatType] = useState('avg'); // 'avg' | 'min' | 'max'
  const data = generateMockData(type, period);

  const maxVal = Math.max(...data.map(d => d.value)) * 1.05;
  const minVal = Math.min(...data.map(d => d.value)) * 0.95;
  const range = maxVal - minVal || 1;

  const pathD = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / range) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaD = pathD + ' L 100 100 L 0 100 Z';
  const gradientId = `gradient-${title}-${period}-${darkMode ? 'dark' : 'light'}`;

  const periods = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: '7 días' },
    { key: 'month', label: '30 días' },
    { key: 'quarter', label: '3 meses' },
  ];

  // Calcular estadísticas
  const avgValue = (data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1);
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));

  // Valor a mostrar según selección
  const displayValue = statType === 'avg' ? avgValue : statType === 'min' ? minValue : maxValue;
  const statLabels = { avg: 'Promedio', min: 'Mínimo', max: 'Máximo' };

  return (
    <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} backdrop-blur rounded-2xl p-5 border`}>
      {/* Header con filtros */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          {/* Selector de estadística */}
          <div className="flex items-center gap-1 mt-2">
            {[
              { key: 'avg', label: 'Prom', value: avgValue },
              { key: 'min', label: 'Mín', value: minValue },
              { key: 'max', label: 'Máx', value: maxValue },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setStatType(s.key)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  statType === s.key
                    ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                    : (darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')
                }`}
              >
                {s.label}: {s.value}{unit}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {displayValue}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>
          </span>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{statLabels[statType]}</p>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="flex gap-1 mb-4">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === p.key
                ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                : (darkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-100')
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="h-40 relative">
        {/* SVG para línea y área */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={darkMode ? "0.5" : "0.4"} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={darkMode ? "0.2" : "0.15"} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="0" y1={i * 25} x2="100" y2={i * 25} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="0.5" />
          ))}
          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Puntos con posicionamiento absoluto para que no se distorsionen */}
        {data.map((d, i) => {
          const xPercent = (i / (data.length - 1)) * 100;
          const yPercent = 100 - ((d.value - minVal) / range) * 100;
          const isLast = i === data.length - 1;
          return (
            <div
              key={i}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            >
              {isLast && (
                <div className="absolute inset-0 w-5 h-5 -m-1 rounded-full bg-blue-500/30 animate-pulse" />
              )}
              <div
                className={`rounded-full border-2 ${
                  isLast
                    ? 'w-3 h-3 bg-blue-500 border-white shadow-lg'
                    : `w-2.5 h-2.5 bg-blue-500 ${darkMode ? 'border-gray-800' : 'border-white'}`
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Eje X */}
      <div className={`flex justify-between mt-2 text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {data.map((d, i) => <span key={i}>{d.time}</span>)}
      </div>
    </div>
  );
};

// Banco
const BankCard = ({ bank, darkMode }) => {
  const normalCells = bank.cells.filter(c => c.status === 'normal').length;
  const warningCells = bank.cells.filter(c => c.status === 'warning').length;
  const criticalCells = bank.cells.filter(c => c.status === 'critical').length;
  const overallStatus = criticalCells > 0 ? 'critical' : warningCells > 0 ? 'warning' : 'normal';

  const statusConfig = {
    normal: { text: 'Operativo', color: 'bg-emerald-500' },
    warning: { text: 'Advertencia', color: 'bg-amber-500' },
    critical: { text: 'Crítico', color: 'bg-rose-500' },
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} backdrop-blur rounded-2xl border overflow-hidden`}>
      <div className={`p-5 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BatteryVisual level={bank.chargeLevel} status={overallStatus} darkMode={darkMode} />
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{bank.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{bank.location}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusConfig[overallStatus].color}`}>
            {statusConfig[overallStatus].text}
          </span>
        </div>
      </div>

      <div className={`p-5 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Voltaje" value={bank.voltage} unit="V" icon={Zap} status={bank.voltageStatus} trend={2.3} darkMode={darkMode} />
          <MetricCard title="Temperatura" value={bank.temperature} unit="°C" icon={Thermometer} status={bank.temperatureStatus} trend={-1.2} darkMode={darkMode} />
          <MetricCard title="Corriente" value={bank.current} unit="A" icon={Activity} status={bank.currentStatus} darkMode={darkMode} />
          <MetricCard title="Humedad" value={bank.humidity} unit="%" icon={Droplets} status={bank.humidityStatus} darkMode={darkMode} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Estado de Celdas</h4>
          <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />{normalCells} OK
            </span>
            {warningCells > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />{warningCells}
              </span>
            )}
            {criticalCells > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />{criticalCells}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {bank.cells.map((cell, i) => (
            <CellItem key={i} number={i + 1} voltage={cell.voltage} status={cell.status} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardV4 = () => {
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Simular última actualización (redondeada a los últimos 15 min)
  const getLastUpdate = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;
    const lastUpdate = new Date(now);
    lastUpdate.setMinutes(roundedMinutes);
    lastUpdate.setSeconds(0);
    return lastUpdate;
  };

  const [lastUpdate] = useState(getLastUpdate());

  // Calcular próxima actualización (15 min después de la última)
  const getNextUpdate = () => {
    const next = new Date(lastUpdate);
    next.setMinutes(next.getMinutes() + 15);
    return next;
  };

  const getMinutesUntilNext = () => {
    const now = new Date();
    const next = getNextUpdate();
    const diff = Math.max(0, Math.round((next - now) / 60000));
    return diff;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);

  const banks = [
    {
      id: 1,
      name: 'Banco UPS Principal', location: 'Sala eléctrica - Nave 1',
      voltage: 48.5, voltageStatus: 'normal', temperature: 32, temperatureStatus: 'normal',
      current: 12.3, currentStatus: 'normal', humidity: 45, humidityStatus: 'normal', chargeLevel: 85,
      cells: [
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
        { voltage: 2.03, status: 'normal' }, { voltage: 1.95, status: 'warning' },
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
        { voltage: 2.00, status: 'normal' }, { voltage: 2.02, status: 'normal' },
        { voltage: 1.85, status: 'critical' }, { voltage: 2.01, status: 'normal' },
        { voltage: 2.03, status: 'normal' }, { voltage: 2.02, status: 'normal' },
      ],
    },
    {
      id: 2,
      name: 'Banco UPS Respaldo', location: 'Sala eléctrica - Nave 2',
      voltage: 47.8, voltageStatus: 'warning', temperature: 38, temperatureStatus: 'warning',
      current: 10.5, currentStatus: 'normal', humidity: 52, humidityStatus: 'normal', chargeLevel: 72,
      cells: [
        { voltage: 2.00, status: 'normal' }, { voltage: 1.98, status: 'warning' },
        { voltage: 2.01, status: 'normal' }, { voltage: 2.00, status: 'normal' },
        { voltage: 1.99, status: 'normal' }, { voltage: 2.02, status: 'normal' },
        { voltage: 2.00, status: 'normal' }, { voltage: 1.97, status: 'warning' },
        { voltage: 2.01, status: 'normal' }, { voltage: 2.00, status: 'normal' },
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
      ],
    },
    {
      id: 3,
      name: 'Banco Emergencia', location: 'Sala de servidores',
      voltage: 48.2, voltageStatus: 'normal', temperature: 28, temperatureStatus: 'normal',
      current: 8.7, currentStatus: 'normal', humidity: 48, humidityStatus: 'normal', chargeLevel: 95,
      cells: [
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
        { voltage: 2.00, status: 'normal' }, { voltage: 2.02, status: 'normal' },
        { voltage: 2.01, status: 'normal' }, { voltage: 2.02, status: 'normal' },
        { voltage: 2.01, status: 'normal' }, { voltage: 2.00, status: 'normal' },
        { voltage: 2.02, status: 'normal' }, { voltage: 2.01, status: 'normal' },
      ],
    },
  ];

  // Función para obtener el estado general de un banco
  const getBankStatus = (bank) => {
    const criticalCells = bank.cells.filter(c => c.status === 'critical').length;
    const warningCells = bank.cells.filter(c => c.status === 'warning').length;
    if (criticalCells > 0) return 'critical';
    if (warningCells > 0 || bank.voltageStatus === 'warning' || bank.temperatureStatus === 'warning') return 'warning';
    return 'normal';
  };

  const selectedBank = banks[selectedBankIndex];

  const alarms = [
    { severity: 'critical', title: 'Voltaje crítico en Celda 9', description: 'Banco UPS Principal - 1.85V (mínimo permitido: 1.90V)', time: '5 min', timestamp: '13/03/2026 14:55' },
    { severity: 'warning', title: 'Voltaje bajo en Celda 4', description: 'Banco UPS Principal - 1.95V (umbral advertencia: 1.97V)', time: '1h', timestamp: '13/03/2026 14:00' },
    { severity: 'warning', title: 'Temperatura elevada', description: 'Banco UPS Respaldo - 38°C (umbral: 35°C)', time: '2h', timestamp: '13/03/2026 13:00' },
    { severity: 'critical', title: 'Corriente alta detectada', description: 'Banco UPS Principal - 18.5A (máximo: 15A)', time: '3h', timestamp: '13/03/2026 12:00' },
    { severity: 'warning', title: 'Humedad fuera de rango', description: 'Banco UPS Respaldo - 72% (máximo recomendado: 60%)', time: '5h', timestamp: '13/03/2026 10:00' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || 'cliente'} darkMode={darkMode} />
      <AlertsModal isOpen={alertsModalOpen} onClose={() => setAlertsModalOpen(false)} alarms={alarms} darkMode={darkMode} />

      <Header
        title="Monitor de Bancos"
        subtitle="Dashboard de monitoreo"
        icon={BatteryCharging}
        iconBgColor="bg-blue-600"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenuClick={() => setSidebarOpen(true)}
        maxWidth="max-w-[1600px]"
        rightContent={
          <>
            {/* Exportar CSV */}
            <button
              onClick={() => exportToCSV(banks, alarms)}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-medium ${
                darkMode
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>

            {/* Botón de alertas - rojo si hay críticas */}
            {(() => {
              const hasCritical = alarms.some(a => a.severity === 'critical');
              const hasAlarms = alarms.length > 0;
              return (
                <button
                  onClick={() => setAlertsModalOpen(true)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    hasCritical
                      ? (darkMode ? 'bg-rose-500/20 hover:bg-rose-500/30' : 'bg-rose-50 hover:bg-rose-100')
                      : hasAlarms
                        ? (darkMode ? 'bg-amber-500/20 hover:bg-amber-500/30' : 'bg-amber-50 hover:bg-amber-100')
                        : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                  }`}
                >
                  <Bell className={`w-5 h-5 ${
                    hasCritical
                      ? (darkMode ? 'text-rose-400' : 'text-rose-600')
                      : hasAlarms
                        ? (darkMode ? 'text-amber-400' : 'text-amber-600')
                        : (darkMode ? 'text-gray-400' : 'text-gray-600')
                  }`} />
                  {hasAlarms && (
                    <>
                      <span className={`text-sm font-medium ${
                        hasCritical
                          ? (darkMode ? 'text-rose-400' : 'text-rose-600')
                          : (darkMode ? 'text-amber-400' : 'text-amber-600')
                      }`}>
                        {alarms.length} {alarms.length === 1 ? 'Alerta' : 'Alertas'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${hasCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                    </>
                  )}
                </button>
              );
            })()}
          </>
        }
      />

      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Barra de pestañas de bancos */}
        <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} rounded-2xl border p-2 mb-6`}>
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className={`text-xs font-medium px-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Bancos:
            </span>
            {banks.map((bank, index) => {
              const status = getBankStatus(bank);
              const isSelected = index === selectedBankIndex;
              const statusColors = {
                normal: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
                warning: { dot: 'bg-amber-500', ring: 'ring-amber-500/30' },
                critical: { dot: 'bg-rose-500 animate-pulse', ring: 'ring-rose-500/30' },
              };

              return (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBankIndex(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? (darkMode
                          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                          : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200')
                      : (darkMode
                          ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                  }`}
                >
                  {/* Indicador de estado */}
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status].dot} ${!isSelected ? '' : `ring-4 ${statusColors[status].ring}`}`} />
                  <span>{bank.name}</span>
                  {/* Badge de alertas si hay problemas */}
                  {status !== 'normal' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      status === 'critical'
                        ? (darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700')
                        : (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                    }`}>
                      {status === 'critical' ? '!' : '⚠'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Banco seleccionado */}
        <div className="mb-6">
          <BankCard bank={selectedBank} darkMode={darkMode} />
        </div>

        {/* Gráficos Históricos */}
        <div className="mb-6">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Históricos y Tendencias
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWithFilters title="Voltaje" type="voltage" unit="V" darkMode={darkMode} />
            <ChartWithFilters title="Temperatura" type="temperature" unit="°C" darkMode={darkMode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardV4;
