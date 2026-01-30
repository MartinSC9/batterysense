import { useNavigate, useLocation } from 'react-router-dom';
import {
  BatteryCharging,
  X,
  LayoutDashboard,
  Settings,
  Users,
  Building2,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, userRole, darkMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboards para cliente y técnico
  const dashboardItems = [
    { path: '/dashboard', label: 'Dashboard Clásico', description: 'Vista original', icon: LayoutDashboard },
    { path: '/dashboard-v4', label: 'Dashboard Pro', description: 'Modo claro/oscuro', icon: LayoutDashboard },
  ];

  // Configuración para técnico
  const tecnicoItems = [
    { path: '/configuracion', label: 'Configuración', description: 'Umbrales y alarmas', icon: Settings },
  ];

  // Menú principal para admin (gestión)
  const adminMainItems = [
    { path: '/clientes', label: 'Clientes', description: 'Gestión de instalaciones', icon: Building2 },
    { path: '/usuarios', label: 'Usuarios', description: 'Gestión de usuarios', icon: Users },
    { path: '/configuracion', label: 'Configuración', description: 'Umbrales y alarmas', icon: Settings },
  ];

  // Dashboard de monitoreo para admin (opcional)
  const adminMonitorItems = [
    { path: '/dashboard-v4', label: 'Monitor General', description: 'Vista de bancos', icon: LayoutDashboard },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const roleLabels = {
    cliente: 'Cliente',
    tecnico: 'Técnico',
    admin: 'Administrador',
  };

  // Estilos según modo
  const styles = darkMode ? {
    overlay: 'bg-black/70',
    sidebar: 'bg-gray-900',
    border: 'border-gray-800',
    title: 'text-white',
    closeBtn: 'hover:bg-gray-800',
    closeIcon: 'text-gray-400',
    sectionTitle: 'text-gray-500',
    itemActive: 'bg-blue-600 text-white',
    itemInactive: 'hover:bg-gray-800 text-gray-300',
    itemDescActive: 'text-blue-200',
    itemDescInactive: 'text-gray-500',
    roleAdmin: 'bg-purple-500/20 text-purple-400',
    roleTecnico: 'bg-blue-500/20 text-blue-400',
    roleCliente: 'bg-gray-700 text-gray-400',
  } : {
    overlay: 'bg-black/50',
    sidebar: 'bg-white',
    border: 'border-gray-100',
    title: 'text-gray-900',
    closeBtn: 'hover:bg-gray-100',
    closeIcon: 'text-gray-500',
    sectionTitle: 'text-gray-400',
    itemActive: 'bg-blue-50 text-blue-600',
    itemInactive: 'hover:bg-gray-50 text-gray-700',
    itemDescActive: 'text-blue-500',
    itemDescInactive: 'text-gray-400',
    roleAdmin: 'bg-purple-100 text-purple-700',
    roleTecnico: 'bg-blue-100 text-blue-700',
    roleCliente: 'bg-gray-100 text-gray-700',
  };

  const getRoleBadgeStyle = () => {
    if (userRole === 'admin') return styles.roleAdmin;
    if (userRole === 'tecnico') return styles.roleTecnico;
    return styles.roleCliente;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 ${styles.overlay} z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 ${styles.sidebar} shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${styles.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <BatteryCharging className="w-5 h-5 text-white" />
              </div>
              <span className={`text-lg font-semibold ${styles.title}`}>BatterySense</span>
            </div>
            <button onClick={onClose} className={`p-2 ${styles.closeBtn} rounded-lg`}>
              <X className={`w-5 h-5 ${styles.closeIcon}`} />
            </button>
          </div>
          {/* Badge de rol */}
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle()}`}>
              {roleLabels[userRole] || 'Cliente'}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* MENÚ PARA ADMIN */}
          {userRole === 'admin' && (
            <>
              {/* Gestión Principal */}
              <p className={`text-xs font-medium ${styles.sectionTitle} uppercase tracking-wider mb-3`}>Gestión</p>
              <div className="space-y-2 mb-6">
                {adminMainItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        isActive ? styles.itemActive : styles.itemInactive
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${isActive ? styles.itemDescActive : styles.itemDescInactive}`}>{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Monitoreo */}
              <p className={`text-xs font-medium ${styles.sectionTitle} uppercase tracking-wider mb-3`}>Monitoreo</p>
              <div className="space-y-2">
                {adminMonitorItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        isActive ? styles.itemActive : styles.itemInactive
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${isActive ? styles.itemDescActive : styles.itemDescInactive}`}>{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* MENÚ PARA CLIENTE Y TÉCNICO */}
          {userRole !== 'admin' && (
            <>
              {/* Dashboards */}
              <p className={`text-xs font-medium ${styles.sectionTitle} uppercase tracking-wider mb-3`}>Dashboards</p>
              <div className="space-y-2 mb-6">
                {dashboardItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        isActive ? styles.itemActive : styles.itemInactive
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${isActive ? styles.itemDescActive : styles.itemDescInactive}`}>{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Opciones de Técnico */}
              {userRole === 'tecnico' && (
                <>
                  <p className={`text-xs font-medium ${styles.sectionTitle} uppercase tracking-wider mb-3`}>Configuración</p>
                  <div className="space-y-2">
                    {tecnicoItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                            isActive ? styles.itemActive : styles.itemInactive
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className={`text-xs ${isActive ? styles.itemDescActive : styles.itemDescInactive}`}>{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${styles.border}`}>
          <p className={`text-xs ${styles.sectionTitle} text-center`}>BatterySense by TRISO</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
