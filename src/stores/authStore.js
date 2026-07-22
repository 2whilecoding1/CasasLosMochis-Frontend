import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false, error });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(username, password);
      set({ user: result.user ?? authService.getStoredUser(), isAuthenticated: true, isLoading: false });
      return result;
    } catch (error) {
      set({ error, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.loginWithGoogle(credential);
      set({ user: result.user ?? authService.getStoredUser(), isAuthenticated: true, isLoading: false });
      return result;
    } catch (error) {
      set({ error, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  // Vuelve a pedir /me (p.ej. despues de set_password, para que
  // must_change_password se refresque en el store sin recargar la pagina).
  refreshUser: async () => {
    const user = await authService.getCurrentUser();
    set({ user });
    return user;
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
