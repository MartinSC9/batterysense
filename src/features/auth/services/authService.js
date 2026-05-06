import api from '@core/config/api';

const TOKEN_KEY = 'bs_token';
const USER_KEY = 'bs_user';

function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

const authService = {
  checkEmail: async (email) => {
    const { data } = await api.post('/auth/check-email', { email });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { user: data.user, token: data.token };
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true };
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? safeJsonParse(userStr) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

};

export default authService;
