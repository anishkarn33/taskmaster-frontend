import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  UserIcon, 
  FlagIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const TaskCard = ({ task, onEdit, onDelete, onDragStart, onDragEnd, onClick }) => {
  const [showActions, setShowActions] = useState(false);

  // ================= HELPER FUNCTIONS =================
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      medium: 'bg-amber-50 text-amber-600 border-amber-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: 'bg-red-50 text-red-600 border-red-200'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date() && task.status !== 'completed';
  };

  const getAssigneeInitials = (user) => {
    if (!user) return '?';
    const name = user.full_name || user.username || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCardClick = (e) => {
    // Prevent click when clicking on action buttons
    if (e.target.closest('.task-actions')) return;
    if (onClick) onClick(task);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(task.id);
  };

  const handleDragStart = (e) => {
    if (onDragStart) onDragStart(e, task);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd(e);
  };

  return (
    <div 
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Priority Badge and Actions */}
      <div className="flex items-start justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          <FlagIcon className="h-3 w-3 mr-1" />
          {task.priority}
        </span>
        
        {/* Action Buttons */}
        <div className={`task-actions flex items-center space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
            title="Edit task"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            title="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className={`text-sm font-medium mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
      }`}>
        {task.title}
      </h4>

      {/* Description (if exists) */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        {/* Left Side - Assignee and Due Date */}
        <div className="flex items-center space-x-2">
          {/* Assignee Avatar */}
          {task.assigned_to ? (
            <div 
              className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
              title={task.assigned_to.full_name || task.assigned_to.username}
            >
              {getAssigneeInitials(task.assigned_to)}
            </div>
          ) : (
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="h-3 w-3 text-gray-400" />
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className={`flex items-center text-xs ${
              isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-500'
            }`}>
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        {/* Right Side - Task ID and Comments */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
            <span>{task.comment_count || 0}</span>
          </div>
          <span className="font-mono">#{task.id}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;