import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import api from '@core/config/api';
import { Download, CheckCircle, ChevronDown } from 'lucide-react';

const STATUS_LABELS = {
  normal: 'OK',
  warning: 'Alerta',
  inactive: 'Inactivo',
};

const STATUS_DOTS = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  inactive: 'bg-gray-400',
};

const PERIOD_OPTIONS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: '7d' },
  { key: 'month', label: '30d' },
];

function ReadingsTable({ bank, rows, fmt, darkMode, border, cardBg, theadBg, thCls, tdCls }) {
  const [open, setOpen] = useState(false);
  const MAX_PREVIEW = 10;
  const displayed = open ? rows : rows.slice(0, MAX_PREVIEW);
  const hasMore = rows.length > MAX_PREVIEW;

  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 8, backgroundColor: cardBg }} className="overflow-hidden">
      <div
        className={`flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
        style={{ borderBottom: `1px solid ${border}`, borderLeft: `3px solid ${darkMode ? '#06b6d4' : '#0891b2'}` }}
      >
        <span>Lecturas — {bank.name}</span>
        <span className={`text-[11px] font-normal tabular-nums ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {rows.length} lecturas
        </span>
      </div>

      {rows.length === 0 ? (
        <div className={`px-3 py-8 text-center text-[13px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Sin lecturas para hoy
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{ borderBottom: `1px solid ${border}`, backgroundColor: theadBg }}>
                  <th className={thCls}>Hora</th>
                  <th className={`${thCls} text-right ${darkMode ? 'text-blue-400/80' : 'text-blue-600/70'}`}>V</th>
                  <th className={`${thCls} text-right ${darkMode ? 'text-emerald-400/80' : 'text-emerald-600/70'}`}>A</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((row, i) => (
                  <tr key={row.key} style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}>
                    <td className={`${tdCls} font-mono tabular-nums ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{row.label}</td>
                    <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {row.voltage != null ? fmt(row.voltage) : '—'}
                    </td>
                    <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {row.current != null ? fmt(row.current) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <button
              onClick={() => setOpen(v => !v)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors ${
                darkMode ? 'text-blue-400 hover:bg-white/[0.04]' : 'text-blue-600 hover:bg-gray-50'
              }`}
              style={{ borderTop: `1px solid ${border}` }}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
              {open ? 'Ver menos' : `Ver todas (${rows.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function ReportesPage({ darkMode }) {
  const { user } = useAuth();
  const [banks, setBanks] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [history, setHistory] = useState({});
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const fetchData = useCallback(async () => {
    try {
      const { data: variables } = await api.get('/devices/mine/variables');
      const varMap = {};
      variables.forEach(v => { varMap[v.label] = v.lastValue; });

      const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000;

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
            banco: ctx.banco || '?',
            celda: ctx.celda || null,
            value: val,
            timestamp: ts ? new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—',
          });
        }
      }

      const bankNums = [...new Set(
        variables.map(v => v.label.match(/^banco(\d+)_/)).filter(Boolean).map(m => Number(m[1]))
      )].sort((a, b) => a - b);

      const bankAlarms = {};
      newAlarms.forEach(a => {
        const num = Number(a.banco);
        if (!isNaN(num)) {
          if (!bankAlarms[num]) bankAlarms[num] = [];
          bankAlarms[num].push(a);
        }
      });

      const newBanks = bankNums.map(num => {
        const voltage = extractValue(varMap[`banco${num}_v`]);
        const current = extractValue(varMap[`banco${num}_i`]);
        const chargeLevel = Math.round(extractValue(varMap[`banco${num}_celdas`]));
        const ts = extractTimestamp(varMap[`banco${num}_v`]);
        const inactive = !ts || (Date.now() - ts) > INACTIVE_THRESHOLD;
        const myAlarms = bankAlarms[num] || [];
        let status = 'normal';
        if (inactive) status = 'inactive';
        else if (myAlarms.length > 0) status = 'warning';

        return {
          id: num,
          name: `Banco ${num}`,
          voltage: Number(voltage.toFixed(1)),
          current: Number(current.toFixed(1)),
          chargeLevel,
          status,
          inactive,
          lastUpdate: ts ? new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—',
          alarmCount: myAlarms.length,
        };
      });

      setBanks(newBanks);
      setAlarms(newAlarms);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const periodKey = period === 'today' ? 'today' : period === 'week' ? 'week' : 'month';

  const fetchHistory = useCallback(async () => {
    if (banks.length === 0) return;
    setHistoryLoading(true);
    const activeBanks = banks.filter(b => !b.inactive);

    const newHistory = {};
    for (const bank of activeBanks) {
      try {
        const [vRes, iRes] = await Promise.all([
          api.get(`/devices/mine/variables/banco${bank.id}_v/stats`, { params: { period: periodKey, tz: new Date().getTimezoneOffset() } }),
          api.get(`/devices/mine/variables/banco${bank.id}_i/stats`, { params: { period: periodKey, tz: new Date().getTimezoneOffset() } }),
        ]);

        newHistory[bank.id] = {
          voltage: { count: vRes.data.count, min: vRes.data.min, max: vRes.data.max, avg: vRes.data.avg, points: vRes.data.points || [] },
          current: { count: iRes.data.count, min: iRes.data.min, max: iRes.data.max, avg: iRes.data.avg, points: iRes.data.points || [] },
        };
      } catch {
        newHistory[bank.id] = null;
      }
    }
    setHistory(newHistory);
    setHistoryLoading(false);
  }, [banks, periodKey]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const fmt = (v) => typeof v === 'number' ? v.toFixed(1) : '—';

  const downloadCSV = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const periodLabel = PERIOD_OPTIONS.find(p => p.key === period)?.label || period;
    const sep = ',';

    let csv = '\uFEFF';
    csv += `REPORTE BATTERYSENSE\n`;
    csv += `Cliente${sep}${user?.name || '-'}\n`;
    csv += `Email${sep}${user?.email || '-'}\n`;
    csv += `Fecha de exportación${sep}${now.toLocaleString('es-AR')}\n`;
    csv += `Período${sep}${periodLabel}\n\n`;

    csv += `RESUMEN DE BANCOS\n`;
    csv += `Banco${sep}Estado${sep}Voltaje (V)${sep}Corriente (A)${sep}Celdas (%)${sep}Alertas${sep}Última lectura\n`;
    banks.forEach(b => {
      csv += `${b.name}${sep}${STATUS_LABELS[b.status]}${sep}${b.voltage}${sep}${b.current}${sep}${b.chargeLevel}${sep}${b.alarmCount}${sep}${b.lastUpdate}\n`;
    });
    csv += `\n`;

    const activeBanks = banks.filter(b => !b.inactive && history[b.id]);
    if (activeBanks.length > 0) {
      csv += `ESTADÍSTICAS DEL PERÍODO (${periodLabel})\n`;
      csv += `Banco${sep}Variable${sep}Lecturas${sep}Mínimo${sep}Máximo${sep}Promedio\n`;
      activeBanks.forEach(b => {
        const h = history[b.id];
        csv += `${b.name}${sep}Voltaje (V)${sep}${h.voltage.count}${sep}${fmt(h.voltage.min)}${sep}${fmt(h.voltage.max)}${sep}${fmt(h.voltage.avg)}\n`;
        csv += `${b.name}${sep}Corriente (A)${sep}${h.current.count}${sep}${fmt(h.current.min)}${sep}${fmt(h.current.max)}${sep}${fmt(h.current.avg)}\n`;
      });
      csv += `\n`;
    }

    csv += `ALERTAS ACTIVAS (${alarms.length})\n`;
    if (alarms.length > 0) {
      csv += `Título${sep}Banco${sep}Celda${sep}Valor${sep}Última actividad\n`;
      alarms.forEach(a => {
        csv += `${a.title}${sep}Banco ${a.banco}${sep}${a.celda || '—'}${sep}${fmt(a.value)}${sep}${a.timestamp}\n`;
      });
    } else {
      csv += `Sin alertas activas\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batterysense_reporte_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const border = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const cardBg = darkMode ? '#0d1117' : '#ffffff';
  const thCls = `px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-left`;
  const tdCls = `px-3 py-2.5 text-[13px]`;
  const theadBg = darkMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)';
  const zebraBg = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.02)';

  const activeBanksWithHistory = banks.filter(b => !b.inactive && history[b.id]);

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className={`text-base font-semibold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Reportes
          </h1>
          {/* Period toggle — inline */}
          <div className="flex items-center" style={{ borderRadius: 6, border: `1px solid ${border}`, backgroundColor: cardBg }}>
            {PERIOD_OPTIONS.map((p, i) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  period === p.key
                    ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                    : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700')
                }`}
                style={{
                  borderRadius: i === 0 ? '5px 0 0 5px' : i === PERIOD_OPTIONS.length - 1 ? '0 5px 5px 0' : 0,
                  ...(i > 0 ? { borderLeft: `1px solid ${border}` } : {}),
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={downloadCSV}
          disabled={loading}
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
            darkMode
              ? 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.10]'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          style={{ borderRadius: 6, border: `1px solid ${border}` }}
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Report meta — compact bar */}
          <div
            className={`flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 px-3 py-2.5 text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            style={{ border: `1px solid ${border}`, borderRadius: 8, backgroundColor: darkMode ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.03)' }}
          >
            <span><span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user?.name || '—'}</span> · {user?.email || '—'}</span>
            <span>Generado {new Date().toLocaleDateString('es-AR')}</span>
            <span>Período: {PERIOD_OPTIONS.find(p => p.key === period)?.label}</span>
          </div>

          {/* Banks — estado actual */}
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, backgroundColor: cardBg }} className="overflow-hidden">
            <div
              className={`flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
              style={{ borderBottom: `1px solid ${border}`, borderLeft: `3px solid #3b82f6` }}
            >
              <span>Estado actual de bancos</span>
              <span className={`text-[11px] font-normal tabular-nums ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{banks.length} bancos</span>
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{ borderBottom: `1px solid ${border}`, backgroundColor: theadBg }}>
                    <th className={thCls}>Banco</th>
                    <th className={thCls}>Estado</th>
                    <th className={`${thCls} text-right ${darkMode ? 'text-blue-400/80' : 'text-blue-600/70'}`}>V</th>
                    <th className={`${thCls} text-right ${darkMode ? 'text-emerald-400/80' : 'text-emerald-600/70'}`}>A</th>
                    <th className={`${thCls} text-right`}>Celdas</th>
                    <th className={`${thCls} text-right`}>Alertas</th>
                    <th className={`${thCls} text-right`}>Última lectura</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((b, i) => {
                    const rowBg = b.status === 'warning'
                      ? (darkMode ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)')
                      : undefined;
                    return (
                      <tr
                        key={b.id}
                        className={b.inactive ? 'opacity-40' : ''}
                        style={{ ...(i > 0 ? { borderTop: `1px solid ${border}` } : {}), backgroundColor: rowBg || (i % 2 === 1 ? zebraBg : undefined) }}
                      >
                        <td className={`${tdCls} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{b.name}</td>
                        <td className={tdCls}>
                          <span className="flex items-center gap-1.5">
                            <span className={`w-[5px] h-[5px] rounded-full ${STATUS_DOTS[b.status]}`} />
                            <span className={`text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{STATUS_LABELS[b.status]}</span>
                          </span>
                        </td>
                        <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{b.voltage}</td>
                        <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{b.current}</td>
                        <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{b.chargeLevel}%</td>
                        <td className={`${tdCls} text-right`}>
                          {b.alarmCount > 0 ? (
                            <span className={`font-mono tabular-nums font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{b.alarmCount}</span>
                          ) : (
                            <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>—</span>
                          )}
                        </td>
                        <td className={`${tdCls} text-right font-mono tabular-nums text-[12px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{b.lastUpdate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden">
              {banks.map((b, i) => (
                <div
                  key={b.id}
                  className={`px-3 py-3 ${b.inactive ? 'opacity-40' : ''}`}
                  style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[13px] font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{b.name}</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-[5px] h-[5px] rounded-full ${STATUS_DOTS[b.status]}`} />
                      <span className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{STATUS_LABELS[b.status]}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-[13px]">
                    <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>{b.voltage} <span className="opacity-50">V</span></span>
                    <span className={darkMode ? 'text-emerald-400' : 'text-emerald-600'}>{b.current} <span className="opacity-50">A</span></span>
                    <span>{b.chargeLevel}<span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>%</span></span>
                    {b.alarmCount > 0 && (
                      <span className={`font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{b.alarmCount} alerta{b.alarmCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <p className={`text-[11px] font-mono tabular-nums mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{b.lastUpdate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History stats — per-bank breakdown */}
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, backgroundColor: cardBg }} className="overflow-hidden">
            <div
              className={`flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
              style={{ borderBottom: `1px solid ${border}`, borderLeft: `3px solid ${darkMode ? '#a78bfa' : '#7c3aed'}` }}
            >
              <span>Estadísticas del período</span>
              {historyLoading && <span className={`text-[11px] font-normal ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>cargando…</span>}
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : activeBanksWithHistory.length === 0 ? (
              <div className={`px-3 py-8 text-center text-[13px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Sin datos históricos para el período seleccionado
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{ borderBottom: `1px solid ${border}`, backgroundColor: theadBg }}>
                        <th className={thCls}>Banco</th>
                        <th className={thCls}>Variable</th>
                        <th className={`${thCls} text-right`}>N</th>
                        <th className={`${thCls} text-right`}>Mín</th>
                        <th className={`${thCls} text-right`}>Máx</th>
                        <th className={`${thCls} text-right ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Prom</th>
                        <th className={`${thCls} text-right`}>Rango</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBanksWithHistory.map((b, bi) => {
                        const h = history[b.id];
                        const vRange = h.voltage.max != null && h.voltage.min != null ? (h.voltage.max - h.voltage.min) : null;
                        const iRange = h.current.max != null && h.current.min != null ? (h.current.max - h.current.min) : null;
                        return [
                          <tr
                            key={`${b.id}-v`}
                            style={bi > 0 ? { borderTop: `1px solid ${border}` } : undefined}
                          >
                            <td className={`${tdCls} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} rowSpan={2}>{b.name}</td>
                            <td className={`${tdCls} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Voltaje
                              </span>
                            </td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{h.voltage.count}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(h.voltage.min)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(h.voltage.max)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{fmt(h.voltage.avg)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{vRange != null ? `±${(vRange / 2).toFixed(1)}` : '—'}</td>
                          </tr>,
                          <tr key={`${b.id}-i`} style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}` }}>
                            <td className={`${tdCls} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Corriente
                              </span>
                            </td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{h.current.count}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(h.current.min)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(h.current.max)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmt(h.current.avg)}</td>
                            <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{iRange != null ? `±${(iRange / 2).toFixed(1)}` : '—'}</td>
                          </tr>,
                        ];
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden">
                  {activeBanksWithHistory.map((b, bi) => {
                    const h = history[b.id];
                    const vRange = h.voltage.max != null && h.voltage.min != null ? (h.voltage.max - h.voltage.min) : null;
                    const iRange = h.current.max != null && h.current.min != null ? (h.current.max - h.current.min) : null;
                    return (
                      <div
                        key={b.id}
                        className="px-3 py-3"
                        style={bi > 0 ? { borderTop: `1px solid ${border}` } : undefined}
                      >
                        <p className={`text-[13px] font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{b.name}</p>
                        {[
                          { label: 'Voltaje', dot: 'bg-blue-500', data: h.voltage, range: vRange, accent: darkMode ? 'text-blue-400' : 'text-blue-600' },
                          { label: 'Corriente', dot: 'bg-emerald-500', data: h.current, range: iRange, accent: darkMode ? 'text-emerald-400' : 'text-emerald-600' },
                        ].map(row => (
                          <div key={row.label} className="mb-1.5 last:mb-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                              <span className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{row.label}</span>
                              <span className={`text-[11px] font-mono tabular-nums ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>({row.data.count} lecturas)</span>
                            </div>
                            <div className={`flex items-center gap-3 font-mono tabular-nums text-[12px] pl-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span>min {fmt(row.data.min)}</span>
                              <span>máx {fmt(row.data.max)}</span>
                              <span className={`font-medium ${row.accent}`}>prom {fmt(row.data.avg)}</span>
                              {row.range != null && <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>±{(row.range / 2).toFixed(1)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Alarms — compact */}
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, backgroundColor: cardBg }} className="overflow-hidden">
            <div
              className={`flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
              style={{ borderBottom: `1px solid ${border}`, borderLeft: `3px solid ${darkMode ? '#f59e0b' : '#d97706'}` }}
            >
              <span>Alertas activas</span>
              {alarms.length > 0 && (
                <span className={`text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded ${
                  darkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                }`}>
                  {alarms.length}
                </span>
              )}
            </div>
            {alarms.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{ borderBottom: `1px solid ${border}`, backgroundColor: theadBg }}>
                        <th className={thCls}>Alerta</th>
                        <th className={thCls}>Banco</th>
                        <th className={thCls}>Celda</th>
                        <th className={`${thCls} text-right`}>Valor</th>
                        <th className={`${thCls} text-right`}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alarms.map((a, i) => (
                        <tr key={i} style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}>
                          <td className={`${tdCls} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{a.title}</td>
                          <td className={`${tdCls} font-mono tabular-nums ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>B{a.banco}</td>
                          <td className={`${tdCls} font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{a.celda ? `C${a.celda}` : '—'}</td>
                          <td className={`${tdCls} text-right font-mono tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(a.value)}</td>
                          <td className={`${tdCls} text-right font-mono tabular-nums text-[12px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{a.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden">
                  {alarms.map((a, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5"
                      style={i > 0 ? { borderTop: `1px solid ${border}` } : undefined}
                    >
                      <p className={`text-[13px] font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{a.title}</p>
                      <div className={`flex items-center gap-2 mt-0.5 text-[11px] font-mono tabular-nums ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>B{a.banco}</span>
                        {a.celda && <span>C{a.celda}</span>}
                        <span>val {fmt(a.value)}</span>
                        <span>{a.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={`px-3 py-8 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <CheckCircle className={`w-5 h-5 mx-auto mb-1.5 ${darkMode ? 'text-emerald-500/40' : 'text-emerald-400/50'}`} />
                <p className="text-[13px]">Sin alertas activas</p>
              </div>
            )}
          </div>

          {/* Historial de lecturas — solo para "Hoy" */}
          {periodKey === 'today' && activeBanksWithHistory.map(bank => {
            const h = history[bank.id];
            const vMap = {};
            h.voltage.points.forEach(p => { vMap[p.timestamp] = p.value; });
            const iMap = {};
            h.current.points.forEach(p => { iMap[p.timestamp] = p.value; });
            const allTs = [...new Set([...h.voltage.points.map(p => p.timestamp), ...h.current.points.map(p => p.timestamp)])].sort((a, b) => b - a);
            const rows = allTs.map(ts => ({
              key: ts,
              label: new Date(ts).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
              voltage: vMap[ts] ?? null,
              current: iMap[ts] ?? null,
            }));

            return (
              <ReadingsTable
                key={bank.id}
                bank={bank}
                rows={rows}
                fmt={fmt}
                darkMode={darkMode}
                border={border}
                cardBg={cardBg}
                theadBg={theadBg}
                thCls={thCls}
                tdCls={tdCls}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
