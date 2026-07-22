import api from './api';

const USERS_BASE = '/auth/users';

export const userService = {
  // Listar usuarios (admin/staff)
  listUsers: async (params = {}) => {
    try {
      const response = await api.get(USERS_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Dar de alta un usuario (admin/staff). El backend genera la contraseña
  // temporal y marca must_change_password; no se manda password desde aquí.
  createUser: async (userData) => {
    try {
      const response = await api.post(`${USERS_BASE}/admin-create-user/`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
