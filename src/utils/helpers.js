import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import { PRIORITY_COLORS, STATUS_COLORS } from './constants';

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Check if a task is overdue
 * @param {Object} task - Task object
 * @returns {boolean} True if task is overdue
 */
export const isTaskOverdue = (task) => {
  if (!task.due_date || task.status === 'completed') return false;
  try {
    const dueDate = typeof task.due_date === 'string' ? parseISO(task.due_date) : task.due_date;
    return isBefore(dueDate, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Get color classes for task priority
 * @param {string} priority - Task priority
 * @returns {Object} Color classes object
 */
export const getPriorityColors = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
};

/**
 * Get color classes for task status
 * @param {string} status - Task status
 * @returns {Object} Color classes object
 */
export const getStatusColors = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.todo;
};

/**
 * Calculate completion percentage
 * @param {number} completed - Number of completed tasks
 * @param {number} total - Total number of tasks
 * @returns {number} Completion percentage
 */
export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Format duration from minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate avatar initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sort tasks by various criteria
 * @param {Array} tasks - Array of tasks
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} Sorted tasks
 */
export const sortTasks = (tasks, sortBy = 'created_at', sortOrder = 'desc') => {
  return [...tasks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date fields
    if (sortBy.includes('date') || sortBy.includes('_at')) {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    }

    // Handle priority sorting
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      aValue = priorityOrder[aValue] || 0;
      bValue = priorityOrder[bValue] || 0;
    }

    // Handle status sorting
    if (sortBy === 'status') {
      const statusOrder = { todo: 1, in_progress: 2, completed: 3 };
      aValue = statusOrder[aValue] || 0;
      bValue = statusOrder[bValue] || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Filter tasks by various criteria
 * @param {Array} tasks - Array of tasks
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered tasks
 */
export const filterTasks = (tasks, filters) => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = task.description?.toLowerCase().includes(searchTerm);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const taskDate = new Date(task.created_at);
      if (filters.dateFrom && isBefore(taskDate, new Date(filters.dateFrom))) {
        return false;
      }
      if (filters.dateTo && isAfter(taskDate, new Date(filters.dateTo))) {
        return false;
      }
    }

    // Overdue filter
    if (filters.overdue === true && !isTaskOverdue(task)) {
      return false;
    }

    return true;
  });
};

/**
 * Group tasks by a specific field
 * @param {Array} tasks - Array of tasks
 * @param {string} groupBy - Field to group by
 * @returns {Object} Grouped tasks
 */
export const groupTasks = (tasks, groupBy) => {
  return tasks.reduce((groups, task) => {
    let key = task[groupBy];
    
    // Handle date grouping
    if (groupBy.includes('date') || groupBy.includes('_at')) {
      key = key ? formatDate(key, 'yyyy-MM-dd') : 'No date';
    }
    
    // Handle status grouping
    if (groupBy === 'status') {
      key = key.replace('_', ' ').toUpperCase();
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
    return groups;
  }, {});
};

/**
 * Calculate task statistics
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Task statistics
 */
export const calculateTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const overdue = tasks.filter(t => isTaskOverdue(t)).length;

  return {
    total,
    completed,
    inProgress,
    todo,
    overdue,
    completionRate: calculateCompletionRate(completed, total),
    priorityBreakdown: {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    }
  };
};

/**
 * Validate task form data
 * @param {Object} taskData - Task form data
 * @returns {Object} Validation result
 */
export const validateTaskForm = (taskData) => {
  const errors = {};

  if (!taskData.title?.trim()) {
    errors.title = 'Title is required';
  } else if (taskData.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  if (taskData.description && taskData.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  if (taskData.estimated_minutes && (taskData.estimated_minutes < 1 || taskData.estimated_minutes > 9999)) {
    errors.estimated_minutes = 'Estimated time must be between 1 and 9999 minutes';
  }

  if (taskData.due_date) {
    try {
      const dueDate = new Date(taskData.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.due_date = 'Invalid due date';
      }
    } catch (error) {
      errors.due_date = 'Invalid due date format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Export data as CSV
 * @param {Array} data - Data to export
 * @param {string} filename - File name
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};