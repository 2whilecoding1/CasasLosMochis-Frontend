import api from './api';

const LEADS_BASE = '/leads';

export const leadService = {
  // Obtener lista de leads
  getLeads: async (params = {}) => {
    try {
      const response = await api.get(LEADS_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalle de un lead
  getLeadDetail: async (id) => {
    try {
      const response = await api.get(`${LEADS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear lead
  createLead: async (leadData) => {
    try {
      const response = await api.post(LEADS_BASE + '/', leadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear lead desde formulario de contacto (público)
  createLeadFromContact: async (contactData) => {
    try {
      const response = await api.post(
        `${LEADS_BASE}/create_from_contact/`,
        contactData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar lead (reemplazo completo)
  updateLead: async (id, leadData) => {
    try {
      const response = await api.put(`${LEADS_BASE}/${id}/`, leadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar campos parciales (ej. solo status o notes)
  patchLead: async (id, partialData) => {
    try {
      const response = await api.patch(`${LEADS_BASE}/${id}/`, partialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar lead
  deleteLead: async (id) => {
    try {
      const response = await api.delete(`${LEADS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Asignar lead a mi
  assignToMe: async (id) => {
    try {
      const response = await api.post(`${LEADS_BASE}/${id}/assign_to_me/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calificar lead
  qualifyLead: async (id) => {
    try {
      const response = await api.post(`${LEADS_BASE}/${id}/qualify/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default leadService;
