import api from './api';

export const tasksService = {
  // Get all tasks with optional filters
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  // Get single task by ID
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats/summary');
    return response.data;
  }
};