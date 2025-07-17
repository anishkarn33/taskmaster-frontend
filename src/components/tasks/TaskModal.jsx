import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserIcon, 
  FlagIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const TaskModal = ({ task, users, isEditing, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    // Fix date format - convert datetime to date for input
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    assigned_to_id: task?.assigned_to?.id || '',
    reviewer_id: task?.reviewer?.id || '' // Add reviewer field
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        assigned_to_id: formData.assigned_to_id || null,
        reviewer_id: formData.reviewer_id || null // Include reviewer
      };
      
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200',
        icon: '🟢',
        label: 'Low Priority'
      },
      medium: { 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        icon: '🟡',
        label: 'Medium Priority'
      },
      high: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        icon: '🟠',
        label: 'High Priority'
      },
      urgent: { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: '🔴',
        label: 'Urgent Priority'
      }
    };
    return configs[priority] || configs.medium;
  };

  const priorityConfig = getPriorityConfig(formData.priority);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <DocumentTextIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Edit Task' : 'Create New Task'}
                </h3>
                <p className="text-blue-100 text-xs">
                  {isEditing ? 'Update task details' : 'Add a new task to your workflow'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Enhanced Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                Task Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.title 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter a clear, descriptive title..."
              />
              {errors.title && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {errors.title}
                </div>
              )}
            </div>
            
            {/* Description Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl transition-all duration-200 hover:border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
                placeholder="Provide detailed information about this task..."
              />
            </div>
            
            {/* Priority Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <FlagIcon className="h-4 w-4 mr-2 text-gray-500" />
                Priority Level
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 hover:border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer ${priorityConfig.bg} ${priorityConfig.border}`}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent Priority</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Due Date Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 hover:border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.due_date 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              />
              {errors.due_date && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {errors.due_date}
                </div>
              )}
              {formData.due_date && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  📅 Due {new Date(formData.due_date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              )}
            </div>
            
            {/* Assigned To Field */}
            {users && users.length > 0 && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Assign To
                </label>
                <div className="relative">
                  <select
                    name="assigned_to_id"
                    value={formData.assigned_to_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl transition-all duration-200 hover:border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">👤 Select team member...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.username}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {formData.assigned_to_id && (
                  <div className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                    ✅ Assigned to {users.find(u => u.id == formData.assigned_to_id)?.full_name || users.find(u => u.id == formData.assigned_to_id)?.username}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Enhanced Action Buttons - Fixed at bottom */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:ring-4 focus:ring-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;