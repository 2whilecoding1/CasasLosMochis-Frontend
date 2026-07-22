import api from './api';

const INTERACTIONS_BASE = '/interactions';

export const interactionService = {
  // Obtener lista de interacciones
  getInteractions: async (params = {}) => {
    try {
      const response = await api.get(INTERACTIONS_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalle de una interacción
  getInteractionDetail: async (id) => {
    try {
      const response = await api.get(`${INTERACTIONS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear interacción
  createInteraction: async (interactionData) => {
    try {
      const response = await api.post(INTERACTIONS_BASE + '/', interactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar interacción
  updateInteraction: async (id, interactionData) => {
    try {
      const response = await api.put(
        `${INTERACTIONS_BASE}/${id}/`,
        interactionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar interacción
  deleteInteraction: async (id) => {
    try {
      const response = await api.delete(`${INTERACTIONS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default interactionService;
import api from './api';

const INTERACTIONS_BASE = '/interactions';

export const interactionService = {
  // Obtener lista de interacciones
  getInteractions: async (params = {}) => {
    try {
      const response = await api.get(INTERACTIONS_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalle de una interacción
  getInteractionDetail: async (id) => {
    try {
      const response = await api.get(`${INTERACTIONS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear interacción
  createInteraction: async (interactionData) => {
    try {
      const response = await api.post(INTERACTIONS_BASE + '/', interactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar interacción
  updateInteraction: async (id, interactionData) => {
    try {
      const response = await api.put(
        `${INTERACTIONS_BASE}/${id}/`,
        interactionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar interacción
  deleteInteraction: async (id) => {
    try {
      const response = await api.delete(`${INTERACTIONS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default interactionService;
