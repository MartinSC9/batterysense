// Roles del sistema BatterySense
const ROLES = {
  CLIENTE: 'cliente',
  TECNICO: 'tecnico',
  ADMIN: 'admin',
};

// Roles permitidos en registro (admin no se puede auto-registrar)
const ALLOWED_ROLES_REGISTER = [ROLES.CLIENTE, ROLES.TECNICO];

// Eventos de auditoría
const AUDIT_EVENTS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_CHANGE: 'password_change',
  ROLE_ADDED: 'role_added',
  ROLE_SWITCHED: 'role_switched',
};

// Configuración JWT
const JWT_CONFIG = {
  REFRESH_TOKEN_DAYS: 7,
  getRefreshTokenExpiry: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

module.exports = {
  ROLES,
  ALLOWED_ROLES_REGISTER,
  AUDIT_EVENTS,
  JWT_CONFIG,
};
