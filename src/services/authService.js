import api from './api';

const AUTH_BASE = '/auth';
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

function saveTokens(access, refresh) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

function saveUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await api.post(`${AUTH_BASE}/login/`, {
        username: (username || '').trim(),
        password,
      });

      saveTokens(response.data.access, response.data.refresh);
      const currentUser = await authService.getCurrentUser();
      return { ...response.data, user: currentUser };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Registrarse
  register: async (userData) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/register/`, userData);

      saveTokens(response.data.access, response.data.refresh);
      if (response.data.user) {
        saveUser(response.data.user);
        return response.data;
      }

      const currentUser = await authService.getCurrentUser();
      return { ...response.data, user: currentUser };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const response = await api.get(`${AUTH_BASE}/users/me/`);
      saveUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login con Google (credential = ID token entregado por Google Identity Services)
  loginWithGoogle: async (credential) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/google_login/`, { credential });
      saveTokens(response.data.access, response.data.refresh);
      if (response.data.user) saveUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Solicitar recuperación de contraseña (envía email con link)
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/password_reset_request/`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Confirmar recuperación de contraseña con uid/token del link
  confirmPasswordReset: async (uid, token, newPassword) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/password_reset_confirm/`, {
        uid,
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Primer cambio de contraseña obligatorio (no pide la anterior)
  setPassword: async (newPassword, newPasswordConfirm) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/set_password/`, {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar contraseña
  changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.post(`${AUTH_BASE}/users/change_password/`, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    clearSession();
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem(ACCESS_KEY);
  },

  // Obtener token actual
  getToken: () => {
    return localStorage.getItem(ACCESS_KEY);
  },

  getStoredUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

export default authService;
