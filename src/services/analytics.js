import api from './api';

export const analyticsService = {
  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get performance overview
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // Get completion trends
  getTrends: async (params = {}) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  // Get hourly productivity
  getHourlyProductivity: async () => {
    const response = await api.get('/analytics/productivity/hourly');
    return response.data;
  },

  // Get weekly productivity
  getWeeklyProductivity: async () => {
    const response = await api.get('/analytics/productivity/weekly');
    return response.data;
  },

  // Get productivity insights
  getInsights: async () => {
    const response = await api.get('/analytics/insights');
    return response.data;
  },

  // Get complete analytics
  getCompleteAnalytics: async () => {
    const response = await api.get('/analytics/complete');
    return response.data;
  },

  // Export analytics data
  exportData: async (format = 'json', period = 'weekly') => {
    const response = await api.get('/analytics/export', {
      params: { format, period },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }
};