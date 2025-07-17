import React, { useState, useEffect, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  XMarkIcon, 
  SparklesIcon,
  CheckIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const AIChat = ({ onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskMoved, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "🤖 **Full AI Task Automation Ready!**\n\n✨ **What I can do:**\n• Create: 'Create a high priority task to fix the login bug'\n• Edit: 'Change task #5 priority to high'\n• Move: 'Move the login bug task to in review'\n• Assign: 'Assign task #3 to John'\n• Delete: 'Delete the old meeting task'\n• Search: 'Show me all high priority tasks'\n• Bulk: 'Delete all completed tasks'\n\n🚀 **Try any command in natural language!**",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/health');
      const health = await response.json();
      setAiStatus(health.status === 'available' ? 'online' : 'offline');
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiStatus('offline');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please log in to use AI features');
      }

      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: data.message,
        timestamp: new Date(),
        data: data.data,
        action: data.action,
        confirmationNeeded: data.confirmation_needed,
        originalMessage: currentMessage
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (message) => {
    if (!message.confirmationNeeded || !message.data || !message.action) return;

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/v1/ai/confirm-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: message.action,
          data: message.data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Trigger appropriate callback based on action
        if (message.action === 'create_task') {
          onTaskCreated?.(result.task);
        } else if (message.action === 'edit_task') {
          onTaskUpdated?.(result.task);
        } else if (message.action === 'move_task') {
          onTaskMoved?.(result.task);
        } else if (message.action === 'delete_task') {
          onTaskDeleted?.(result.task);
        } else if (message.action === 'assign_task') {
          onTaskUpdated?.(result.task);
        } else if (message.action === 'bulk_operation') {
          // Refresh all tasks
          onTaskUpdated?.();
        }
        
        const successMessage = {
          id: Date.now(),
          type: 'ai',
          message: result.message,
          timestamp: new Date(),
          isSuccess: true
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error confirming action:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        message: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create_task':
        return <SparklesIcon className="h-3 w-3 text-green-500" />;
      case 'edit_task':
        return <PencilIcon className="h-3 w-3 text-blue-500" />;
      case 'move_task':
        return <ArrowRightIcon className="h-3 w-3 text-purple-500" />;
      case 'delete_task':
        return <TrashIcon className="h-3 w-3 text-red-500" />;
      case 'assign_task':
        return <UserIcon className="h-3 w-3 text-orange-500" />;
      case 'query_tasks':
        return <MagnifyingGlassIcon className="h-3 w-3 text-indigo-500" />;
      case 'bulk_operation':
        return <BoltIcon className="h-3 w-3 text-yellow-500" />;
      default:
        return <SparklesIcon className="h-3 w-3 text-blue-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create_task':
        return 'border-green-200 bg-green-50';
      case 'edit_task':
        return 'border-blue-200 bg-blue-50';
      case 'move_task':
        return 'border-purple-200 bg-purple-50';
      case 'delete_task':
        return 'border-red-200 bg-red-50';
      case 'assign_task':
        return 'border-orange-200 bg-orange-50';
      case 'query_tasks':
        return 'border-indigo-200 bg-indigo-50';
      case 'bulk_operation':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderMessage = (message) => {
    return (
      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          message.type === 'user' 
            ? 'bg-blue-500 text-white' 
            : message.isError 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : message.isSuccess
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="flex items-start space-x-2">
            {message.type === 'ai' && (
              <div className="flex-shrink-0 mt-1">
                {message.action ? getActionIcon(message.action) : <SparklesIcon className="h-4 w-4 text-blue-500" />}
              </div>
            )}
            <div className="flex-1">
              <div className="whitespace-pre-wrap text-sm">{message.message}</div>
              
              {/* Enhanced confirmation buttons with action details */}
              {message.confirmationNeeded && message.data && (
                <div className={`mt-3 p-3 rounded-lg border ${getActionColor(message.action)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getActionIcon(message.action)}
                    <span className="text-xs font-medium text-gray-700 uppercase">
                      {message.action?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Action-specific details */}
                  {message.action === 'create_task' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📝 <strong>Title:</strong> {message.data.title}</div>
                      <div>🚨 <strong>Priority:</strong> {message.data.priority}</div>
                      <div>📋 <strong>Status:</strong> {message.data.status}</div>
                      {message.data.due_date && (
                        <div>📅 <strong>Due:</strong> {new Date(message.data.due_date).toLocaleDateString()}</div>
                      )}
                    </div>
                  )}
                  
                  {message.action === 'edit_task' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📝 <strong>Task:</strong> {message.data.task_title}</div>
                      <div>✏️ <strong>Changes:</strong> {Object.entries(message.data.changes).map(([key, value]) => `${key} → ${value}`).join(', ')}</div>
                    </div>
                  )}
                  
                  {message.action === 'move_task' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📝 <strong>Task:</strong> {message.data.task_title}</div>
                      <div>🔄 <strong>Move:</strong> {message.data.current_status} → {message.data.new_status}</div>
                    </div>
                  )}
                  
                  {message.action === 'delete_task' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📝 <strong>Task:</strong> {message.data.task_title}</div>
                      <div>⚠️ <strong>Warning:</strong> This action cannot be undone</div>
                    </div>
                  )}
                  
                  {message.action === 'assign_task' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📝 <strong>Task:</strong> {message.data.task_title}</div>
                      <div>👤 <strong>Assignee:</strong> {message.data.assignee_name}</div>
                    </div>
                  )}
                  
                  {message.action === 'bulk_operation' && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>🔢 <strong>Operation:</strong> {message.data.operation}</div>
                      <div>📊 <strong>Tasks affected:</strong> {message.data.task_count}</div>
                      <div>⚠️ <strong>Warning:</strong> This affects multiple tasks</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleConfirmAction(message)}
                      disabled={isLoading}
                      className={`flex items-center px-3 py-1 text-white text-xs rounded hover:opacity-90 disabled:opacity-50 ${
                        message.action === 'delete_task' || message.action === 'bulk_operation'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      {message.action === 'delete_task' ? 'Delete' : 
                       message.action === 'bulk_operation' ? 'Execute' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => {
                        setMessages(prev => prev.filter(m => m.id !== message.id));
                      }}
                      className="flex items-center px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                    >
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Query results display */}
              {message.action === 'query_result' && message.data?.tasks && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-xs font-medium text-indigo-700 mb-2">
                    📊 Found {message.data.tasks.length} tasks:
                  </div>
                  <div className="space-y-1">
                    {message.data.tasks.map(task => (
                      <div key={task.id} className="text-xs text-gray-600 bg-white p-2 rounded">
                        <span className="font-medium">#{task.id}</span> {task.title}
                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'in_review' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">🤖 AI Task Automation</h3>
              <p className={`text-xs ${
                aiStatus === 'online' ? 'text-green-600' : 'text-red-600'
              }`}>
                🦙 LLaMA {aiStatus === 'online' ? 'Online' : 'Offline'} • Full Control
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              {isMinimized ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-80 bg-gray-50">
              {messages.map(renderMessage)}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="text-sm">🦙 AI is processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input with Quick Actions */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type any command... (e.g., 'Change task #5 priority to high')"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || aiStatus === 'offline'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || aiStatus === 'offline'}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <button
                  onClick={() => handleQuickAction('Create a high priority task')}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center space-x-1"
                >
                  <SparklesIcon className="h-3 w-3" />
                  <span>Create</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Show me all high priority tasks')}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center space-x-1"
                >
                  <MagnifyingGlassIcon className="h-3 w-3" />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Change task priority to high')}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center space-x-1"
                >
                  <PencilIcon className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Move task to in review')}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center space-x-1"
                >
                  <ArrowRightIcon className="h-3 w-3" />
                  <span>Move</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;