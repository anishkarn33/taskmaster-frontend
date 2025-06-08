// API Base URL
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// Task Status Options
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// Task Priority Options
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Analytics Period Options
export const ANALYTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// Color Schemes
export const PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800'
  },
  [TASK_PRIORITY.MEDIUM]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  [TASK_PRIORITY.HIGH]: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800'
  },
  [TASK_PRIORITY.URGENT]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800'
  }
};

export const STATUS_COLORS = {
  [TASK_STATUS.TODO]: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-600'
  },
  [TASK_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800'
  },
  [TASK_STATUS.COMPLETED]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800'
  }
};

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316'  // Orange
];

// Default Form Values
export const DEFAULT_TASK = {
  title: '',
  description: '',
  priority: TASK_PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
  due_date: '',
  estimated_minutes: ''
};

// Validation Rules
export const VALIDATION_RULES = {
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  MIN_ESTIMATED_MINUTES: 1,
  MAX_ESTIMATED_MINUTES: 9999
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed'
};