const API_BASE_URL = 'http://localhost:8000';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  console.log('API Call:', url, config); // Debug log

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call failed:', error);
    throw error;
  }
};

// Task API functions
export const taskAPI = {
  // Get all tasks
  async getTasks(params = {}) {
    const searchParams = new URLSearchParams(params);
    const endpoint = `/api/v1/tasks${searchParams.toString() ? `?${searchParams}` : ''}`;
    return apiCall(endpoint);
  },

  // Create new task
  async createTask(taskData) {
    return apiCall('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update task
  async updateTask(taskId, taskData) {
    console.log('Updating task:', taskId, taskData); // Debug log
    return apiCall(`/api/v1/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Delete task
  async deleteTask(taskId) {
    console.log('Deleting task:', taskId); // Debug log
    return apiCall(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Update task status (for drag & drop)
  async updateTaskStatus(taskId, status) {
    return apiCall(`/api/v1/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// User API functions
export const userAPI = {
  async getUsers() {
    try {
      return await apiCall('/api/v1/users');
    } catch (error) {
      console.warn('Users endpoint not available:', error.message);
      return [];
    }
  },
};

// Comment API functions
export const commentAPI = {
  async createComment(commentData) {
    // Try the alternative endpoint first (matches your backend)
    try {
      return await apiCall('/api/v1/tasks/comments', {
        method: 'POST',
        body: JSON.stringify({
          task_id: commentData.task_id,
          content: commentData.content
        }),
      });
    } catch (error) {
      // If that fails, try the task-specific endpoint
      try {
        return await apiCall(`/api/v1/tasks/${commentData.task_id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ 
            comment: commentData.content 
          }),
        });
      } catch (altError) {
        console.error('Comments API error:', error.message);
        throw error;
      }
    }
  },

  async getTaskComments(taskId) {
    try {
      return await apiCall(`/api/v1/tasks/${taskId}/comments`);
    } catch (error) {
      console.warn('Comments not available:', error.message);
      return []; // Return empty array if comments aren't available
    }
  },
};

export default { taskAPI, userAPI, commentAPI };