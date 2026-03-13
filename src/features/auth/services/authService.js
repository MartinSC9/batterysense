// =============================================
// AUTH SERVICE - MODO PROTOTIPO (Sin Backend)
// =============================================

// Usuarios de prueba para el prototipo
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@batterysense.com',
    password: 'Admin123!',
    username: 'admin',
    role: 'admin',
    first_name: 'Administrador',
    last_name: 'BatterySense',
  },
  {
    id: 2,
    email: 'tecnico@triso.com',
    password: 'Admin123!',
    username: 'tecnico',
    role: 'tecnico',
    first_name: 'Lucas',
    last_name: 'Brunetti',
  },
  {
    id: 3,
    email: 'cliente@enertec.com.ar',
    password: 'Admin123!',
    username: 'cliente',
    role: 'cliente',
    first_name: 'Diego',
    last_name: 'Ferreyra',
  },
];

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const authService = {
  // Verificar si el email existe
  checkEmail: async (email) => {
    await delay(500); // Simular latencia
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { exists: !!user, email };
  },

  // Login
  login: async (email, password) => {
    await delay(800); // Simular latencia

    const user = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Crear objeto de usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    // Guardar en localStorage
    const fakeToken = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 3600000 }));
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('refreshToken', 'fake-refresh-token');
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return {
      user: userWithoutPassword,
      token: fakeToken,
      refreshToken: 'fake-refresh-token',
    };
  },

  // Registro (para prototipo, simula éxito)
  register: async (userData) => {
    await delay(800);

    const exists = MOCK_USERS.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error('El email ya está registrado');
    }

    const newUser = {
      id: MOCK_USERS.length + 1,
      email: userData.email,
      password: userData.password,
      username: userData.username || userData.email.split('@')[0],
      role: 'cliente',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
    };

    const { password: _, ...userWithoutPassword } = newUser;

    const fakeToken = btoa(JSON.stringify({ userId: newUser.id, exp: Date.now() + 3600000 }));
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('refreshToken', 'fake-refresh-token');
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return {
      user: userWithoutPassword,
      token: fakeToken,
      refreshToken: 'fake-refresh-token',
    };
  },

  // Logout
  logout: async () => {
    await delay(300);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Obtener usuario actual del localStorage
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return !!token;
    }
  },

  // Obtener usuario actual (simulado)
  getCurrentUser: async () => {
    await delay(200);
    return authService.getUser();
  },
};

export default authService;
