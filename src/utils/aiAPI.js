// frontend/src/utils/aiAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const createAPIClient = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
};

export const aiAPI = {
  checkHealth: async () => {
    const client = createAPIClient();
    const response = await client.get('/ai/health');
    return response.data;
  },

  chat: async (message) => {
    const client = createAPIClient();
    const response = await client.post('/ai/chat', { message });
    return response.data;
  },

  createTaskFromNL: async (naturalLanguage) => {
    const client = createAPIClient();
    const response = await client.post('/ai/create-from-nl', { 
      natural_language: naturalLanguage 
    });
    return response.data;
  }
};