import api from './api';

const CONTRACTS_BASE = '/contracts';

export const contractService = {
  // Obtener lista de contratos
  getContracts: async (params = {}) => {
    try {
      const response = await api.get(CONTRACTS_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalle de un contrato
  getContractDetail: async (id) => {
    try {
      const response = await api.get(`${CONTRACTS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear contrato
  createContract: async (contractData) => {
    try {
      const response = await api.post(CONTRACTS_BASE + '/', contractData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar contrato
  updateContract: async (id, contractData) => {
    try {
      const response = await api.put(
        `${CONTRACTS_BASE}/${id}/`,
        contractData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar contrato
  deleteContract: async (id) => {
    try {
      const response = await api.delete(`${CONTRACTS_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default contractService;
