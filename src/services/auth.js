import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update current user
  updateUser: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Delete current user
  deleteUser: async () => {
    const response = await api.delete('/users/me');
    return response.data;
  }
};