import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bell, FileText, Monitor, X, ExternalLink } from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alarmas', label: 'Alertas', icon: Bell, showBadge: true },
  { to: '/reportes', label: 'Reportes', icon: FileText },
  { to: '/kiosco', label: 'Modo Kiosco', icon: Monitor },
];

function NavItem({ to, label, icon: Icon, darkMode, end, onClick, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 ${
          isActive
            ? darkMode ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm'
            : darkMode ? 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.08]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none px-1">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ darkMode, mobileOpen, onClose, alarmCount = 0 }) {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto flex-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            badge={item.showBadge ? alarmCount : 0}
            darkMode={darkMode}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Powered by TRISO */}
      <div className={`p-3 border-t ${darkMode ? 'border-white/[0.08]' : 'border-gray-200'}`}>
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
          <p className={`text-[10px] font-medium uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Powered by
          </p>
          <p className={`text-sm font-bold tracking-tight ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            TRISO
          </p>
          <p className={`text-[11px] mt-1 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Ingeniería aplicada al servicio de la industria
          </p>
          <div className="flex flex-col gap-1.5 mt-3">
            <a
              href="https://www.triso.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              Conocer más
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-52 shrink-0 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto"
        style={{
          backgroundColor: darkMode ? '#030712' : '#ffffff',
          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div
          className={`w-60 h-full border-r overflow-y-auto flex flex-col transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: darkMode ? '#030712' : '#ffffff', borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
            <span className="text-sm font-semibold" style={{ color: darkMode ? '#f0f0f0' : '#111827' }}>BatterySense</span>
            <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-white/[0.08] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
