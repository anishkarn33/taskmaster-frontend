  import axios from 'axios';
  import React, { useState, useEffect } from 'react';

  const API_BASE_URL = 'http://localhost:8000/api/v1';

  // Create axios instance with auth and timeout
  const createAPIClient = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout for LLaMA responses
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  };

  // Add request interceptor for loading states
  const setupInterceptors = (client) => {
    client.interceptors.request.use((config) => {
      // Show loading indicator for LLaMA requests
      if (config.url.includes('/ai/')) {
        document.dispatchEvent(new CustomEvent('llama-request-start'));
      }
      return config;
    });

    client.interceptors.response.use(
      (response) => {
        // Hide loading indicator
        document.dispatchEvent(new CustomEvent('llama-request-end'));
        return response;
      },
      (error) => {
        // Hide loading indicator and handle errors
        document.dispatchEvent(new CustomEvent('llama-request-end'));
        
        // Custom error handling for LLaMA-specific errors
        if (error.response?.status === 503) {
          throw new Error('LLaMA service is not available. Please ensure Ollama is running.');
        }
        
        throw error;
      }
    );
  };

  export const llamaAPI = {
    // Health check - verify LLaMA is running
    checkHealth: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      try {
        const response = await client.get('/ai/health');
        return response.data;
      } catch (error) {
        console.error('LLaMA health check failed:', error);
        throw new Error('LLaMA service is not available');
      }
    },

    // Main chat endpoint
    chat: async (message) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post('/ai/chat', { message });
      return response.data;
    },

    // Parse natural language to task
    parseTask: async (naturalLanguage) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post('/ai/parse-task', { natural_language: naturalLanguage });
      return response.data;
    },

    // Create task from natural language
    createTaskFromNL: async (naturalLanguage) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post('/ai/create-from-nl', { natural_language: naturalLanguage });
      return response.data;
    },

    // Get task suggestions
    getSuggestions: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get('/ai/suggestions');
      return response.data;
    },

    // Get task analysis
    getAnalysis: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get('/ai/analyze');
      return response.data;
    },

    // Get assignment suggestions for a task
    getAssignmentSuggestions: async (taskId) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get(`/ai/assignment-suggestions/${taskId}`);
      return response.data;
    },

    // Auto-assign task
    autoAssignTask: async (taskId) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post(`/ai/auto-assign/${taskId}`);
      return response.data;
    },

    // Update task with natural language
    smartUpdateTask: async (taskId, naturalLanguage) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post(`/ai/smart-update/${taskId}`, {
        natural_language: naturalLanguage
      });
      return response.data;
    },

    // Get comprehensive insights
    getInsights: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get('/ai/insights');
      return response.data;
    },

    // Get available models
    getModels: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get('/ai/models');
      return response.data;
    },

    // Test connection
    testConnection: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post('/ai/test-connection');
      return response.data;
    },

    // Batch process multiple tasks
    batchProcess: async (messages) => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.post('/ai/batch-process', messages);
      return response.data;
    },

    // Get performance statistics
    getPerformanceStats: async () => {
      const client = createAPIClient();
      setupInterceptors(client);
      
      const response = await client.get('/ai/performance-stats');
      return response.data;
    }
  };

  // LLaMA Status Component
  export const LlamaStatusIndicator = ({ className = "" }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkStatus = async () => {
        try {
          const health = await llamaAPI.checkHealth();
          setStatus(health);
        } catch (error) {
          setStatus({ status: 'error', message: error.message });
        } finally {
          setLoading(false);
        }
      };

      checkStatus();
      
      // Check status every 30 seconds
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }, []);

    if (loading) {
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Checking LLaMA...</span>
        </div>
      );
    }

    const getStatusColor = (status) => {
      switch (status?.status) {
        case 'available':
          return 'bg-green-500';
        case 'unavailable':
          return 'bg-red-500';
        default:
          return 'bg-gray-500';
      }
    };

    const getStatusText = (status) => {
      switch (status?.status) {
        case 'available':
          return `🦙 LLaMA Ready (${status.current_model})`;
        case 'unavailable':
          return '🦙 LLaMA Offline';
        default:
          return '🦙 LLaMA Unknown';
      }
    };

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
        <span className="text-xs text-gray-600">{getStatusText(status)}</span>
      </div>
    );
  };

  // LLaMA Loading Component
  export const LlamaLoadingIndicator = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const handleStart = () => setIsLoading(true);
      const handleEnd = () => setIsLoading(false);

      document.addEventListener('llama-request-start', handleStart);
      document.addEventListener('llama-request-end', handleEnd);

      return () => {
        document.removeEventListener('llama-request-start', handleStart);
        document.removeEventListener('llama-request-end', handleEnd);
      };
    }, []);

    if (!isLoading) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">🦙 LLaMA is thinking...</span>
        </div>
      </div>
    );
  };

  // Hook for LLaMA features
  export const useLlama = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [currentModel, setCurrentModel] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAvailability = async () => {
        try {
          const health = await llamaAPI.checkHealth();
          setIsAvailable(health.status === 'available');
          setCurrentModel(health.current_model || '');
        } catch (error) {
          setIsAvailable(false);
        } finally {
          setLoading(false);
        }
      };

      checkAvailability();
    }, []);

    const createTaskFromText = async (text) => {
      if (!isAvailable) {
        throw new Error('LLaMA is not available');
      }
      return await llamaAPI.createTaskFromNL(text);
    };

    const chatWithLlama = async (message) => {
      if (!isAvailable) {
        throw new Error('LLaMA is not available');
      }
      return await llamaAPI.chat(message);
    };

    const getTaskSuggestions = async () => {
      if (!isAvailable) {
        throw new Error('LLaMA is not available');
      }
      return await llamaAPI.getSuggestions();
    };

    return {
      isAvailable,
      currentModel,
      loading,
      createTaskFromText,
      chatWithLlama,
      getTaskSuggestions,
      api: llamaAPI
    };
  };

  // Error boundary for LLaMA components
  export const LlamaErrorBoundary = ({ children, fallback }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    const handleError = (error) => {
      console.error('LLaMA Error:', error);
      setHasError(true);
      setError(error);
    };

    if (hasError) {
      return fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">🦙 LLaMA Error</h3>
          <p className="text-red-600 text-sm mt-1">{error?.message || 'An error occurred'}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  };

  // Utility functions
  export const llamaUtils = {
    // Format response time for display
    formatResponseTime: (seconds) => {
      if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
      return `${seconds.toFixed(1)}s`;
    },

    // Check if LLaMA is likely to be slow
    isPotentiallySlow: (modelName) => {
      const slowModels = ['llama2:13b', 'llama2:70b', 'codellama:13b'];
      return slowModels.some(model => modelName.includes(model));
    },

    // Get model recommendations
    getModelRecommendation: (useCase) => {
      const recommendations = {
        'fast': 'llama2:7b',
        'quality': 'llama2:13b',
        'code': 'codellama',
        'chat': 'llama2:7b-chat'
      };
      return recommendations[useCase] || 'llama2';
    },

    // Validate natural language input
    validateInput: (input) => {
      if (!input || input.trim().length === 0) {
        throw new Error('Please enter a message');
      }
      
      if (input.length > 1000) {
        throw new Error('Message too long (max 1000 characters)');
      }
      
      // Basic safety check
      const dangerous = ['<script>', 'javascript:', 'eval('];
      if (dangerous.some(pattern => input.toLowerCase().includes(pattern))) {
        throw new Error('Invalid input detected');
      }
      
      return true;
    }
  };

  // Export everything
  export default {
    llamaAPI,
    LlamaStatusIndicator,
    LlamaLoadingIndicator,
    useLlama,
    LlamaErrorBoundary,
    llamaUtils
  };