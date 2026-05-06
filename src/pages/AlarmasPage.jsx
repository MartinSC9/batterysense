import { useState, useEffect, useCallback } from 'react';
import api from '@core/config/api';
import { CheckCircle, RefreshCw } from 'lucide-react';

const SEVERITY_DOT = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
};

export default function AlarmasPage({ darkMode }) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const extractValue = (raw) => {
    if (raw == null) return 0;
    if (typeof raw === 'object' && raw.value !== undefined) return Number(raw.value) || 0;
    return Number(raw) || 0;
  };
  const extractContext = (raw) => {
    if (raw == null) return {};
    if (typeof raw === 'object' && raw.context) return raw.context;
    return {};
  };
  const extractTimestamp = (raw) => {
    if (raw == null) return null;
    if (typeof raw === 'object') return raw.timestamp || null;
    return null;
  };
  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace <1 min';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  const getSeverity = (value) => {
    if (value >= 3) return 'high';
    if (value >= 2) return 'medium';
    return 'low';
  };

  const fetchAlarms = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data: variables } = await api.get('/devices/mine/variables');
      const varMap = {};
      variables.forEach(v => { varMap[v.label] = v.lastValue; });

      const newAlarms = [];
      for (let i = 1; i <= 7; i++) {
        const raw = varMap[`alarma${i}`];
        if (!raw) continue;
        const val = extractValue(raw);
        if (val !== 0) {
          const ctx = extractContext(raw);
          const ts = extractTimestamp(raw);
          const nombre = ctx.nombre || `Alarma ${i}`;
          newAlarms.push({
            title: nombre,
            banco: ctx.banco || null,
            celda: ctx.celda || null,
            value: val,
            severity: getSeverity(val),
            relTime: ts ? getRelativeTime(ts) : null,
            absTime: ts ? new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null,
            rawTimestamp: ts || 0,
          });
        }
      }
      // Más recientes primero
      newAlarms.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      setAlarms(newAlarms);
    } catch (err) {
      console.error('Error fetching alarms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 300000);
    return () => clearInterval(interval);
  }, [fetchAlarms]);

  // Bancos disponibles para filtro
  const bankSet = [...new Set(alarms.map(a => a.banco).filter(Boolean))].sort((a, b) => a - b);
  const filtered = filter === 'all' ? alarms : alarms.filter(a => a.banco === filter);

  const border = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="p-4 lg:p-5">
      {/* Header row — título + status inline + acciones */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className={`text-base font-semibold tracking-tight shrink-0 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Alertas
          </h1>
          {!loading && (
            <span className={`text-xs font-medium tabular-nums px-2 py-0.5 rounded shrink-0 ${
              alarms.length > 0
                ? (darkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700')
                : (darkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
            }`}>
              {alarms.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Filtro por banco — compacto */}
          {bankSet.length > 1 && (
            <div className="hidden sm:flex items-center" style={{ borderRadius: 6, border: `1px solid ${border}` }}>
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  filter === 'all'
                    ? (darkMode ? 'bg-white/[0.08] text-gray-200' : 'bg-gray-100 text-gray-900')
                    : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700')
                }`}
                style={{ borderRadius: '5px 0 0 5px' }}
              >
                Todo
              </button>
              {bankSet.map(b => (
                <button
                  key={b}
                  onClick={() => setFilter(b)}
                  className={`px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    filter === b
                      ? (darkMode ? 'bg-white/[0.08] text-gray-200' : 'bg-gray-100 text-gray-900')
                      : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700')
                  }`}
                  style={{ borderLeft: `1px solid ${border}` }}
                >
                  B{b}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => fetchAlarms(true)}
            disabled={refreshing}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode ? 'hover:bg-white/[0.06] text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
            title="Actualizar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile bank filter — horizontal scroll */}
      {bankSet.length > 1 && (
        <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-1 -mx-4 px-4">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
              filter === 'all'
                ? (darkMode ? 'bg-white/[0.08] text-gray-200' : 'bg-gray-100 text-gray-900')
                : (darkMode ? 'text-gray-500' : 'text-gray-400')
            }`}
            style={{ border: `1px solid ${border}` }}
          >
            Todo ({alarms.length})
          </button>
          {bankSet.map(b => {
            const count = alarms.filter(a => a.banco === b).length;
            return (
              <button
                key={b}
                onClick={() => setFilter(b)}
                className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                  filter === b
                    ? (darkMode ? 'bg-white/[0.08] text-gray-200' : 'bg-gray-100 text-gray-900')
                    : (darkMode ? 'text-gray-500' : 'text-gray-400')
                }`}
                style={{ border: `1px solid ${border}` }}
              >
                B{b} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : alarms.length === 0 ? (
        <div className="py-16 text-center" style={{ border: `1px solid ${border}`, borderRadius: 8 }}>
          <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-emerald-500/50' : 'text-emerald-400/60'}`} />
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sin alertas activas</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Todos los bancos operando normalmente</p>
        </div>
      ) : (
        <div style={{ border: `1px solid ${border}`, borderRadius: 8 }} className="overflow-hidden">
          {/* Desktop table header */}
          <div
            className={`hidden sm:grid grid-cols-[6px_1fr_80px_72px_72px_96px] gap-x-3 items-center px-3 py-2 text-[11px] font-medium uppercase tracking-wider ${
              darkMode ? 'text-gray-600 bg-white/[0.02]' : 'text-gray-400 bg-gray-50/50'
            }`}
            style={{ borderBottom: `1px solid ${border}` }}
          >
            <span />
            <span>Descripción</span>
            <span>Banco</span>
            <span>Celda</span>
            <span className="text-right tabular-nums">Valor</span>
            <span className="text-right">Tiempo</span>
          </div>

          {filtered.map((alarm, i) => (
            <div key={i}>
              {/* Desktop row */}
              <div
                className={`hidden sm:grid grid-cols-[6px_1fr_80px_72px_72px_96px] gap-x-3 items-center px-3 py-2.5 transition-colors ${
                  darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/40'
                }`}
                style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}
              >
                <div className={`w-[3px] h-5 rounded-full ${SEVERITY_DOT[alarm.severity]}`} />
                <p className={`text-[13px] font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{alarm.title}</p>
                <span className={`text-xs font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {alarm.banco ? `Banco ${alarm.banco}` : '—'}
                </span>
                <span className={`text-xs font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {alarm.celda ? `C${alarm.celda}` : '—'}
                </span>
                <span className={`text-right text-xs font-mono tabular-nums ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {alarm.value.toFixed(1)}
                </span>
                <div className="text-right">
                  {alarm.relTime ? (
                    <span className={`text-[12px] tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {alarm.relTime}
                    </span>
                  ) : (
                    <span className={`text-xs ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>—</span>
                  )}
                </div>
              </div>

              {/* Mobile card */}
              <div
                className="sm:hidden flex items-start gap-2.5 px-3 py-3"
                style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}
              >
                <div className={`w-[3px] h-full min-h-[36px] rounded-full shrink-0 mt-0.5 ${SEVERITY_DOT[alarm.severity]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{alarm.title}</p>
                  <div className={`flex items-center gap-2 mt-1 text-[11px] font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {alarm.banco && <span>B{alarm.banco}</span>}
                    {alarm.celda && <span>C{alarm.celda}</span>}
                    <span>val {alarm.value.toFixed(1)}</span>
                    {alarm.relTime && (
                      <span>{alarm.relTime}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer — conteo filtrado */}
          {filter !== 'all' && (
            <div
              className={`px-3 py-2 text-[11px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
              style={{ borderTop: `1px solid ${border}` }}
            >
              {filtered.length} de {alarms.length} · Banco {filter}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
