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

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
