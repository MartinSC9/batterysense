import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@core/config/api';
import { X } from 'lucide-react';

const STATUS_ACCENT = {
  normal: { bar: 'bg-emerald-500', glow: '' },
  warning: { bar: 'bg-amber-500', glow: 'shadow-[inset_0_0_24px_rgba(245,158,11,0.06)]' },
  inactive: { bar: 'bg-gray-500', glow: '' },
};

export default function KioskoPage({ darkMode }) {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [time, setTime] = useState(new Date());

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

  const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data: variables } = await api.get('/devices/mine/variables');
      const varMap = {};
      variables.forEach(v => { varMap[v.label] = v.lastValue; });

      const bankAlarmMap = {};
      let totalAlarms = 0;
      for (let i = 1; i <= 7; i++) {
        const raw = varMap[`alarma${i}`];
        if (!raw) continue;
        const val = extractValue(raw);
        if (val !== 0) {
          totalAlarms++;
          const ctx = extractContext(raw);
          const nombre = ctx.nombre || `Alarma ${i}`;
          if (ctx.banco) {
            if (!bankAlarmMap[ctx.banco]) bankAlarmMap[ctx.banco] = [];
            bankAlarmMap[ctx.banco].push(nombre);
          }
        }
      }

      const bankNums = [...new Set(
        variables.map(v => v.label.match(/^banco(\d+)_/)).filter(Boolean).map(m => Number(m[1]))
      )].sort((a, b) => a - b);

      setBanks(bankNums.map(num => {
        const voltage = Number(extractValue(varMap[`banco${num}_v`]).toFixed(1));
        const current = Number(extractValue(varMap[`banco${num}_i`]).toFixed(1));
        const chargeLevel = Math.round(extractValue(varMap[`banco${num}_celdas`]));
        const ts = extractTimestamp(varMap[`banco${num}_v`]);
        const inactive = !ts || (Date.now() - ts) > INACTIVE_THRESHOLD;
        const myAlarms = bankAlarmMap[num] || [];

        let status = 'normal';
        if (inactive) status = 'inactive';
        else if (myAlarms.length > 0) status = 'warning';

        return { id: num, voltage, current, chargeLevel, status, inactive, alarms: myAlarms };
      }));
      setAlarmCount(totalAlarms);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(true), 300000);
    return () => clearInterval(t);
  }, [fetchData]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') navigate('/dashboard'); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);

  const border = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const normalCount = banks.filter(b => b.status === 'normal').length;
  const warningCount = banks.filter(b => b.status === 'warning').length;
  const inactiveCount = banks.filter(b => b.status === 'inactive').length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto" style={{ backgroundColor: darkMode ? '#030712' : '#f0f1f3' }}>
      {/* Top bar — compact, functional */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        {/* Left — brand + system status */}
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            BatterySense
          </span>
          <div className={`hidden sm:flex items-center gap-3 text-[11px] font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {normalCount} ok
            </span>
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {warningCount} alerta
              </span>
            )}
            {inactiveCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {inactiveCount} sin datos
              </span>
            )}
          </div>
        </div>

        {/* Right — refresh status + clock + exit */}
        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-1.5 text-[11px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {refreshing ? (
              <><div className="animate-spin rounded-full h-3 w-3 border-t border-b border-blue-500" /> Actualizando...</>
            ) : lastUpdate ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                Actualización automática cada 5 min
              </>
            ) : null}
          </div>
          <div className={`text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-lg sm:text-xl font-bold tracking-wider">
              {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
            <span className={`hidden sm:inline ml-3 text-[11px] capitalize ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {time.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode ? 'text-gray-600 hover:bg-white/[0.06] hover:text-gray-400' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title="ESC para salir"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banks grid */}
      <div className="flex-1 p-3 sm:p-4 lg:p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3" />
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cargando datos...</p>
          </div>
        ) : (
        <div className="grid gap-3 sm:gap-4 h-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {banks.map(bank => {
            const sc = STATUS_ACCENT[bank.status];
            const hasAlarms = bank.alarms.length > 0 && !bank.inactive;

            return (
              <div
                key={bank.id}
                className={`relative flex flex-col overflow-hidden ${bank.inactive ? 'opacity-35' : ''} ${sc.glow}`}
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#ffffff',
                }}
              >
                {/* Status accent — left bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${sc.bar}`} />

                {/* Header row */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 pl-5">
                  <span className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Banco {bank.id}
                  </span>
                  {hasAlarms && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </div>

                {/* Voltage — hero number */}
                <div className="px-4 pl-5 pb-1">
                  <span className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums leading-none ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {bank.voltage}
                  </span>
                  <span className={`text-base sm:text-lg font-mono ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>V</span>
                </div>

                {/* Secondary metrics — inline */}
                <div className={`flex items-center gap-4 px-4 pl-5 pt-1 pb-3 text-[13px] font-mono tabular-nums ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{bank.current} <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>A</span></span>
                  <span>{bank.chargeLevel}<span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>%</span> celdas</span>
                </div>

                {/* Alarms strip */}
                {hasAlarms && (
                  <div
                    className="px-4 pl-5 py-2 mt-auto"
                    style={{ borderTop: `1px solid ${border}`, backgroundColor: darkMode ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.03)' }}
                  >
                    {bank.alarms.map((a, i) => (
                      <p key={i} className={`text-[11px] leading-relaxed truncate ${darkMode ? 'text-amber-400/80' : 'text-amber-700/70'}`}>
                        {a}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Bottom status strip — only if alarms */}
      {alarmCount > 0 && (
        <div
          className="shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2"
          style={{ borderTop: `1px solid ${border}`, backgroundColor: darkMode ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.03)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className={`text-[12px] font-medium tabular-nums ${darkMode ? 'text-amber-400/70' : 'text-amber-700/70'}`}>
            {alarmCount} {alarmCount === 1 ? 'alerta activa' : 'alertas activas'}
          </span>
        </div>
      )}
    </div>
  );
}
