import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ClockIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onQuickStatusUpdate }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      urgent: 'badge-urgent'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'badge-todo',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed'
    };
    return colors[status] || colors.todo;
  };

  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'completed';

  const getStatusActions = () => {
    switch (task.status) {
      case 'todo':
        return (
          <button
            onClick={() => onQuickStatusUpdate('in_progress')}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Start task"
          >
            <PlayIcon className="h-4 w-4" />
          </button>
        );
      case 'in_progress':
        return (
          <>
            <button
              onClick={() => onQuickStatusUpdate('completed')}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="Complete task"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onQuickStatusUpdate('todo')}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Pause task"
            >
              <PauseIcon className="h-4 w-4" />
            </button>
          </>
        );
      case 'completed':
        return (
          <button
            onClick={() => onQuickStatusUpdate('todo')}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            title="Reopen task"
          >
            <PlayIcon className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-200 card-hover ${
      isOverdue ? 'border-red-200 dark:border-red-800' : 'border-white/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title and description */}
          <div className="mb-3">
            <h3 className={`text-lg font-semibold ${
              task.status === 'completed' 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                {task.description}
              </p>
            )}
          </div>

          {/* Badges and metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            
            {task.due_date && (
              <span className={`flex items-center text-xs ${
                isOverdue 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                <ClockIcon className="h-4 w-4 mr-1" />
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {task.completed_at && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Completed {format(new Date(task.completed_at), 'MMM dd')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-4">
          {/* Quick status actions */}
          <div className="flex items-center space-x-1 mr-2">
            {getStatusActions()}
          </div>
          
          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          {/* Delete button */}
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress bar for in-progress tasks */}
      {task.status === 'in_progress' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>In Progress</span>
            <span>Click ✓ when done</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-1/2 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;