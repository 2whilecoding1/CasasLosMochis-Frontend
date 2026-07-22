import api from './api';

const PROPERTIES_BASE = '/properties';

export const propertyService = {
  // Obtener lista de propiedades
  getProperties: async (params = {}) => {
    try {
      const response = await api.get(PROPERTIES_BASE + '/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalle de una propiedad
  getPropertyDetail: async (id) => {
    try {
      const response = await api.get(`${PROPERTIES_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear propiedad (requiere autenticación)
  createProperty: async (propertyData) => {
    try {
      const response = await api.post(PROPERTIES_BASE + '/', propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar propiedad
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`${PROPERTIES_BASE}/${id}/`, propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar propiedad
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`${PROPERTIES_BASE}/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Subir imágenes de propiedad
  uploadImages: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post(
        `${PROPERTIES_BASE}/${id}/upload_image/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Incrementar vistas
  incrementViews: async (id) => {
    try {
      const response = await api.post(`${PROPERTIES_BASE}/${id}/increment_views/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener propiedades destacadas
  getFeaturedProperties: async () => {
    try {
      const response = await api.get(`${PROPERTIES_BASE}/featured/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener tipos de propiedades
  getPropertyTypes: async () => {
    try {
      const response = await api.get('/properties/types/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener amenidades
  getAmenities: async () => {
    try {
      const response = await api.get('/properties/amenities/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default propertyService;
