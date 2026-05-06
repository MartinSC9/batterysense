import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '@core/config/api';
import {
  BatteryCharging,
  Zap,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
} from 'lucide-react';

const BankVisual = ({ darkMode }) => (
  <div className="w-20 h-16 shrink-0">
    <svg viewBox="0 0 80 48" className="w-full h-full">
      {/* 4 celdas de batería en serie */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          {/* Celda */}
          <rect
            x={4 + i * 19}
            y="8"
            width="16"
            height="36"
            rx="2"
            fill={darkMode ? '#1e3a5f' : '#dbeafe'}
            stroke={darkMode ? '#3b82f6' : '#93c5fd'}
            strokeWidth="1.5"
          />
          {/* Terminal positivo */}
          <rect
            x={9 + i * 19}
            y="4"
            width="6"
            height="5"
            rx="1"
            fill={darkMode ? '#3b82f6' : '#60a5fa'}
          />
          {/* Conector entre celdas */}
          {i < 3 && (
            <line
              x1={20 + i * 19}
              y1="20"
              x2={23 + i * 19}
              y2="20"
              stroke={darkMode ? '#4b5563' : '#d1d5db'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  </div>
);

const STATUS_CONFIG = {
  normal: { text: 'Operativo', color: 'bg-emerald-500' },
  warning: { text: 'Con alertas', color: 'bg-amber-500' },
  inactive: { text: 'Sin datos recientes', color: 'bg-gray-400' },
};

const DOT_COLORS = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  inactive: 'bg-gray-400',
};

const BankSelector = ({ banks, selectedIndex, onChange, darkMode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = banks[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Móvil: dropdown custom */}
      <div className="md:hidden relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${DOT_COLORS[selected?.status] || 'bg-gray-400'} ${selected?.status === 'warning' ? 'animate-pulse' : ''}`} />
            {selected?.name || 'Seleccionar banco'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </button>
        {open && (
          <div
            className={`absolute z-20 left-0 right-0 mt-1 rounded-xl border shadow-lg overflow-hidden ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {banks.map((bank, index) => (
              <button
                key={bank.id}
                onClick={() => { onChange(index); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                  index === selectedIndex
                    ? (darkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700')
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-50')
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${DOT_COLORS[bank.status]} ${bank.status === 'warning' ? 'animate-pulse' : ''}`} />
                <span className="flex-1 text-left">{bank.name}</span>
                {bank.status !== 'normal' && (
                  <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {STATUS_CONFIG[bank.status]?.text}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: tabs */}
      <div className={`hidden md:block rounded-2xl border p-1.5 ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-1.5">
          {banks.map((bank, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={bank.id}
                onClick={() => onChange(index)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? (darkMode ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200')
                    : (darkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100')
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${DOT_COLORS[bank.status]} ${bank.status === 'warning' ? 'animate-pulse' : ''}`} />
                <span>{bank.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

const PERIODS = [
  { key: 'today', label: 'Hoy', ms: 86400000 },
  { key: 'week', label: '7 días', ms: 604800000 },
  { key: 'month', label: '30 días', ms: 2592000000 },
];

const fmt = (v) => typeof v === 'number' ? v.toFixed(1) : '-';

const SimpleChart = ({ bankId, varLabel, title, unit, color, darkMode }) => {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const axisColor = darkMode ? '#6b7280' : '#9ca3af';
  const gridColor = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    if (!varLabel) return;
    setLoading(true);
    const now = Date.now();
    const ms = PERIODS.find(p => p.key === period)?.ms || 86400000;
    api.get(`/devices/mine/variables/${varLabel}/values`, { params: { start: now - ms, end: now, limit: 500 } })
      .then(({ data: res }) => {
        const vals = (res.values || []).sort((a, b) => a.timestamp - b.timestamp);
        if (!vals.length) { setData(null); return; }

        if (period === 'today') {
          // Lecturas individuales — cada punto es una lectura real
          setData({
            mode: 'raw',
            points: vals.map(v => ({
              label: new Date(v.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
              value: Number(v.value.toFixed(1)),
            })),
            min: Math.min(...vals.map(v => v.value)),
            max: Math.max(...vals.map(v => v.value)),
            avg: vals.reduce((s, v) => s + v.value, 0) / vals.length,
            count: vals.length,
          });
        } else {
          // Agregar por día — promedio, mín, máx por cada día
          const dayBuckets = {};
          const days = period === 'week' ? 7 : 30;
          for (let d = days - 1; d >= 0; d--) {
            const date = new Date(now - d * 86400000);
            const key = date.toISOString().slice(0, 10); // YYYY-MM-DD para ordenar
            dayBuckets[key] = { values: [], date };
          }
          vals.forEach(v => {
            const key = new Date(v.timestamp).toISOString().slice(0, 10);
            if (dayBuckets[key]) dayBuckets[key].values.push(v.value);
          });

          const points = Object.entries(dayBuckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .filter(([, b]) => b.values.length > 0)
            .map(([, bucket]) => {
              const avg = bucket.values.reduce((s, v) => s + v, 0) / bucket.values.length;
              const min = Math.min(...bucket.values);
              const max = Math.max(...bucket.values);
              return {
                label: bucket.date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
                avg: Number(avg.toFixed(1)),
                min: Number(min.toFixed(1)),
                max: Number(max.toFixed(1)),
                readings: bucket.values.length,
              };
            });

          const allVals = vals.map(v => v.value);
          setData({
            mode: 'daily',
            points,
            min: Math.min(...allVals),
            max: Math.max(...allVals),
            avg: allVals.reduce((s, v) => s + v, 0) / allVals.length,
            count: allVals.length,
          });
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [varLabel, period]);

  // Tooltip para lecturas individuales (Hoy)
  const RawTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className={`px-3 py-2 rounded-lg shadow-lg text-xs ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
        <p className="font-medium mb-1">{label}</p>
        <p style={{ color }}>{payload[0].value} {unit}</p>
      </div>
    );
  };

  // Tooltip para promedios diarios (7d/30d)
  const DailyTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className={`px-3 py-2 rounded-lg shadow-lg text-xs ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
        <p className="font-medium mb-1">{label}</p>
        <div className="space-y-0.5">
          <p style={{ color }}>Prom: {d.avg} {unit}</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Mín: {d.min} {unit}</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Máx: {d.max} {unit}</p>
          <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>{d.readings} lecturas</p>
        </div>
      </div>
    );
  };

  const periodLabel = period === 'today' ? 'Lecturas individuales' : 'Promedio diario';

  return (
    <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{title} ({unit})</h3>
          {data && (
            <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {periodLabel} — {data.count} lecturas
            </p>
          )}
        </div>
        <div className={`flex rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                period === p.key
                  ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className={`flex gap-3 text-[11px] mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <span>Min: {fmt(data.min)}</span>
          <span>Máx: {fmt(data.max)}</span>
          <span>Prom: {fmt(data.avg)}</span>
        </div>
      )}

      {loading ? (
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : !data ? (
        <div className={`h-[180px] flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
          <p className="text-sm">Sin datos</p>
        </div>
      ) : data.mode === 'raw' ? (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.points}>
            <defs>
              <linearGradient id={`grad-${bankId}-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} domain={['auto', 'auto']} width={40} />
            <Tooltip content={<RawTooltip />} />
            <Area type="monotone" dataKey="value" name={unit} stroke={color} fill={`url(#grad-${bankId}-${title})`} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.points}>
            <defs>
              <linearGradient id={`grad-${bankId}-${title}-daily`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} interval={0} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} domain={['auto', 'auto']} width={40} />
            <Tooltip content={<DailyTooltip />} />
            <Area type="monotone" dataKey="avg" name={`Prom ${unit}`} stroke={color} fill={`url(#grad-${bankId}-${title}-daily)`} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};


const DashboardV4 = ({ darkMode, setAlarms: setParentAlarms, setLastDataTimestamp: setParentTimestamp, getRelativeTime }) => {
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);
  const [banks, setBanks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Extraer valor de lastValue (puede ser objeto o número)
  const extractValue = (raw) => {
    if (raw == null) return 0;
    if (typeof raw === 'object' && raw.value !== undefined) return Number(raw.value) || 0;
    return Number(raw) || 0;
  };

  const extractTimestamp = (raw) => {
    if (raw == null) return null;
    if (typeof raw === 'object') return raw.timestamp || null;
    return null;
  };

  const extractContext = (raw) => {
    if (raw == null) return {};
    if (typeof raw === 'object' && raw.context) return raw.context;
    return {};
  };

  // Fetch variables de Ubidots via backend
  const fetchData = useCallback(async () => {
    try {
      setDataError(null);
      const { data: variables } = await api.get('/devices/mine/variables');

      const varMap = {};
      variables.forEach(v => {
        varMap[v.label] = v.lastValue;
      });

      // Construir alarmas primero (para vincular con bancos)
      const newAlarms = [];
      const bankAlarms = {};
      for (let i = 1; i <= 7; i++) {
        const raw = varMap[`alarma${i}`];
        if (!raw) continue;
        const val = extractValue(raw);
        if (val !== 0) {
          const ctx = extractContext(raw);
          const ts = extractTimestamp(raw);
          const nombre = ctx.nombre || `Alarma ${i}`;
          const alarm = {
            severity: 'warning',
            title: nombre,
            description: `Banco ${ctx.banco || '?'}${ctx.celda ? ` - Celda ${ctx.celda}` : ''}${val !== 1 ? ` (valor: ${val.toFixed(1)})` : ''}`,
            time: ts ? getRelativeTime(ts) : '',
            timestamp: ts ? new Date(ts).toLocaleString('es-AR') : '',
            banco: ctx.banco || null,
          };
          newAlarms.push(alarm);
          if (ctx.banco) {
            if (!bankAlarms[ctx.banco]) bankAlarms[ctx.banco] = [];
            bankAlarms[ctx.banco].push(alarm);
          }
        }
      }

      // Detectar bancos dinámicamente desde las variables (banco1_v, banco2_v, etc.)
      let mostRecentTimestamp = null;
      const bankNums = [...new Set(
        variables
          .map(v => v.label.match(/^banco(\d+)_/))
          .filter(Boolean)
          .map(m => Number(m[1]))
      )].sort((a, b) => a - b);

      const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 horas

      const newBanks = bankNums.map(num => {
        const voltage = extractValue(varMap[`banco${num}_v`]);
        const current = extractValue(varMap[`banco${num}_i`]);
        const chargeLevel = Math.round(extractValue(varMap[`banco${num}_celdas`]));
        const ts = extractTimestamp(varMap[`banco${num}_v`]);
        const inactive = !ts || (Date.now() - ts) > INACTIVE_THRESHOLD;

        if (ts && !inactive && (!mostRecentTimestamp || ts > mostRecentTimestamp)) {
          mostRecentTimestamp = ts;
        }

        const myAlarms = bankAlarms[num] || [];
        let status = 'normal';
        if (inactive) status = 'inactive';
        else if (myAlarms.length > 0) status = 'warning';

        return {
          id: num,
          name: `Banco ${num}`,
          location: ts ? `Última lectura: hace ${getRelativeTime(ts)}` : '',
          voltage: Number(voltage.toFixed(1)),
          current: Number(current.toFixed(1)),
          chargeLevel,
          alarmCount: myAlarms.length,
          inactive,
          status,
        };
      });

      setBanks(newBanks);
      setParentAlarms?.(newAlarms);
      setParentTimestamp?.(mostRecentTimestamp);
    } catch (err) {
      console.error('Error fetching variables:', err);
      setDataError(err.response?.data?.error || err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min — concentrador envia cada ~10 min
    return () => clearInterval(interval);
  }, [fetchData]);

  const selectedBank = banks[selectedBankIndex] || null;

  // Fetch promedios del banco seleccionado para trend
  const [avgStats, setAvgStats] = useState(null);
  useEffect(() => {
    setAvgStats(null);
    if (!selectedBank || selectedBank.inactive) return;
    const now = Date.now();
    const start = now - 86400000;
    Promise.all([
      api.get(`/devices/mine/variables/banco${selectedBank.id}_v/values`, { params: { start, end: now, limit: 500 } }),
      api.get(`/devices/mine/variables/banco${selectedBank.id}_i/values`, { params: { start, end: now, limit: 500 } }),
    ]).then(([vRes, iRes]) => {
      const vVals = vRes.data.values || [];
      const iVals = iRes.data.values || [];
      setAvgStats({
        vAvg: vVals.length ? vVals.reduce((s, v) => s + v.value, 0) / vVals.length : null,
        iAvg: iVals.length ? iVals.reduce((s, v) => s + v.value, 0) / iVals.length : null,
      });
    }).catch(() => setAvgStats(null));
  }, [selectedBank?.id, selectedBank?.inactive]);

  return (
    <div className="p-4 lg:p-6">
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando datos del concentrador...</p>
          </div>
        ) : dataError ? (
          <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
            <p className="text-lg font-medium mb-2">Error al cargar datos</p>
            <p className="text-sm mb-4">{dataError}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Reintentar</button>
          </div>
        ) : banks.length === 0 ? (
          <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <BatteryCharging className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Sin datos</p>
            <p className="text-sm">No se encontraron variables del concentrador</p>
          </div>
        ) : (
        <>
        {/* Selector de banco — dropdown custom en móvil, tabs en desktop */}
        <div className="mb-6">
          <BankSelector
            banks={banks}
            selectedIndex={selectedBankIndex}
            onChange={setSelectedBankIndex}
            darkMode={darkMode}
          />
        </div>

        {/* Banco seleccionado — métricas + charts */}
        {selectedBank && (() => {
          const status = selectedBank.status;
          const sc = STATUS_CONFIG[status];

          return (
            <>
              {/* Header banco */}
              <div className={`flex items-center gap-3 mb-4 ${selectedBank.inactive ? 'opacity-60' : ''}`}>
                <BankVisual darkMode={darkMode} />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBank.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white ${sc.color}`}>{sc.text}</span>
                  </div>
                  {selectedBank.location && (
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{selectedBank.location}</p>
                  )}
                </div>
              </div>

              {/* Stat cards */}
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 ${selectedBank.inactive ? 'opacity-60' : ''}`}>
                {[
                  { label: 'Voltaje actual', value: selectedBank.voltage, unit: 'V', icon: Zap, trend: avgStats?.vAvg != null ? selectedBank.voltage - avgStats.vAvg : undefined },
                  { label: 'Corriente actual', value: selectedBank.current, unit: 'A', icon: Activity, trend: avgStats?.iAvg != null ? selectedBank.current - avgStats.iAvg : undefined },
                  { label: 'Celdas operativas', value: `${selectedBank.chargeLevel}%`, unit: '', icon: BatteryCharging },
                  { label: 'Alertas activas', value: selectedBank.alarmCount, unit: '', icon: AlertTriangle },
                ].map(m => (
                  <div key={m.label} className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{m.label}</span>
                      <m.icon className={`w-4 h-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{m.value}</span>
                      {m.unit && <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{m.unit}</span>}
                    </div>
                    {m.trend !== undefined && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        m.trend > 0 ? 'text-emerald-500' : m.trend < 0 ? 'text-rose-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')
                      }`}>
                        {m.trend > 0 ? <TrendingUp className="w-3 h-3" /> : m.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        <span>{m.trend > 0 ? '+' : ''}{m.trend.toFixed(1)} vs promedio</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <SimpleChart bankId={selectedBank.id} varLabel={`banco${selectedBank.id}_v`} title="Voltaje" unit="V" color="#3b82f6" darkMode={darkMode} />
                <SimpleChart bankId={selectedBank.id} varLabel={`banco${selectedBank.id}_i`} title="Corriente" unit="A" color="#10b981" darkMode={darkMode} />
              </div>

            </>
          );
        })()}
        </>
        )}
    </div>
  );
};

export default DashboardV4;
