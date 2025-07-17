import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
  BoltIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import AIChat from '../AI/AIChat';
import { taskAPI, userAPI } from '../../utils/api';
import { useToast } from '../Toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);

  // AI Chat states
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [aiCommands, setAiCommands] = useState([]);

  // Toast notifications
  const { showToast, ToastContainer } = useToast();

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    checkAIStatus();
    fetchAICommands();
  }, [statusFilter, priorityFilter, sortBy, sortOrder]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter })
      };

      const data = await taskAPI.getTasks(params);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

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

  const fetchAICommands = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/commands');
      const commands = await response.json();
      setAiCommands(commands);
    } catch (error) {
      console.error('Failed to fetch AI commands:', error);
    }
  };

  // ================= TASK ACTIONS =================
  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('Deleting task with ID:', taskId);
        await taskAPI.deleteTask(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
        
        showToast('Task deleted successfully!', 'success');
      } catch (err) {
        console.error('Error deleting task:', err);
        showToast('Failed to delete task: ' + err.message, 'error');
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTaskSave = async (taskData) => {
    try {
      setError('');
      
      const statusMap = {
        'TODO': 'todo',
        'IN_PROGRESS': 'in_progress',
        'IN_REVIEW': 'in_review',
        'DONE': 'completed'
      };

      const priorityMap = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'urgent'
      };
      
      const formattedData = {
        title: taskData.title,
        description: taskData.description || '',
        status: statusMap[taskData.status] || taskData.status || 'todo',
        priority: priorityMap[taskData.priority] || taskData.priority || 'medium',
        ...(taskData.assigned_to_id && { assigned_to_id: parseInt(taskData.assigned_to_id) }),
        ...(taskData.reviewer_id && { reviewer_id: parseInt(taskData.reviewer_id) }),
        ...(taskData.due_date && { 
          due_date: taskData.due_date.includes('T') ? 
            taskData.due_date : 
            taskData.due_date + 'T23:59:59Z' 
        }),
      };

      console.log('Saving task data:', formattedData);
      
      if (selectedTask) {
        await taskAPI.updateTask(selectedTask.id, formattedData);
        showToast(`Task "${taskData.title}" updated successfully!`, 'success');
      } else {
        await taskAPI.createTask(formattedData);
        showToast(`Task "${taskData.title}" created successfully!`, 'success');
      }
      
      await fetchTasks();
      handleModalClose();
    } catch (err) {
      console.error('Error saving task:', err);
      const action = selectedTask ? 'update' : 'create';
      setError('Failed to save task: ' + err.message);
      showToast(`Failed to ${action} task: ${err.message}`, 'error');
    }
  };

  // ================= AI HANDLERS =================
  const handleAITaskCreated = async (newTask) => {
    console.log('AI created task:', newTask);
    showToast(`🤖 AI created task: "${newTask.title}"`, 'success');
    await fetchTasks(); // Refresh tasks
  };

  const handleAITaskUpdated = async (updatedTask) => {
    console.log('AI updated task:', updatedTask);
    if (updatedTask) {
      showToast(`🤖 AI updated task: "${updatedTask.title}"`, 'success');
    } else {
      showToast('🤖 AI updated tasks successfully!', 'success');
    }
    await fetchTasks(); // Refresh tasks
  };

  const handleAITaskDeleted = async (deletedTask) => {
    console.log('AI deleted task:', deletedTask);
    if (deletedTask) {
      showToast(`🤖 AI deleted task: "${deletedTask.title}"`, 'success');
    } else {
      showToast('🤖 AI deleted tasks successfully!', 'success');
    }
    await fetchTasks(); // Refresh tasks
  };

  const handleAITaskMoved = async (movedTask) => {
    console.log('AI moved task:', movedTask);
    showToast(`🤖 AI moved task: "${movedTask.title}" to ${movedTask.status}`, 'success');
    await fetchTasks(); // Refresh tasks
  };

  const handleAIQuickAction = (action) => {
    setShowAIChat(true);
    // The AI chat will handle the action
  };

  // ================= FILTER LOGIC =================
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ================= STATS CALCULATION =================
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => ['todo', 'TODO'].includes(t.status)).length,
    in_progress: tasks.filter(t => ['in_progress', 'IN_PROGRESS'].includes(t.status)).length,
    in_review: tasks.filter(t => ['in_review', 'IN_REVIEW'].includes(t.status)).length,
    completed: tasks.filter(t => ['completed', 'DONE'].includes(t.status)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Tasks</span>
              {aiStatus === 'online' && <BoltIcon className="h-6 w-6 text-purple-500" />}
              {aiStatus === 'online' && <span className="text-purple-600 text-sm">AI Powered</span>}
            </h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center space-x-2">
              <span>Full AI automation for task management</span>
              {aiStatus === 'online' && (
                <span className="text-green-600 font-medium">• 🤖 AI Ready</span>
              )}
              {aiStatus === 'offline' && (
                <span className="text-red-600 font-medium">• 🤖 AI Offline</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* AI Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              aiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              🦙 LLaMA {aiStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* AI Quick Actions */}
          {aiStatus === 'online' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAIQuickAction('create')}
                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                title="AI Create Task"
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                AI Create
              </button>
              <button
                onClick={() => handleAIQuickAction('search')}
                className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                title="AI Search Tasks"
              >
                <MagnifyingGlassIcon className="h-3 w-3 mr-1" />
                AI Search
              </button>
            </div>
          )}

          {/* AI Chat Button */}
          <button
            onClick={() => setShowAIChat(true)}
            disabled={aiStatus === 'offline'}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors ${
              aiStatus === 'online' 
                ? 'text-purple-600 bg-purple-100 hover:bg-purple-200' 
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <CommandLineIcon className="h-4 w-4 mr-2" />
            AI Assistant
          </button>

          {/* New Task Button */}
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* AI Commands Banner */}
      {aiStatus === 'online' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BoltIcon className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">AI Automation Examples</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center space-x-2 text-purple-700">
              <SparklesIcon className="h-4 w-4" />
              <span>"Create a high priority task to fix the login bug"</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <span className="text-purple-500">✏️</span>
              <span>"Change task #5 priority to high"</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <span className="text-purple-500">🔄</span>
              <span>"Move the API task to in review"</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          <div className="text-sm text-gray-500">To Do</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.in_review}</div>
          <div className="text-sm text-gray-500">In Review</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Filters</span>
            {aiStatus === 'online' && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Try: "Show me all high priority tasks"
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="priority-desc">High Priority First</option>
            <option value="due_date-asc">Due Date</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {aiStatus === 'online' 
                ? 'Try using AI to create your first task!'
                : 'Create your first task to get started'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Task
              </button>
              {aiStatus === 'online' && (
                <button
                  onClick={() => setShowAIChat(true)}
                  className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100"
                >
                  <BoltIcon className="h-4 w-4 mr-2" />
                  Ask AI to Create
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-4 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-3'
          }`}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onClick={handleTaskClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          users={users}
          isEditing={!!selectedTask}
          onClose={handleModalClose}
          onSave={handleTaskSave}
        />
      )}

      {/* Enhanced AI Chat Component */}
      <AIChat 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onTaskCreated={handleAITaskCreated}
        onTaskUpdated={handleAITaskUpdated}
        onTaskDeleted={handleAITaskDeleted}
        onTaskMoved={handleAITaskMoved}
      />

      {/* Enhanced Floating AI Button */}
      {!showAIChat && aiStatus === 'online' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowAIChat(true)}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all transform hover:scale-110 flex items-center justify-center group"
            title="Open AI Assistant - Full Task Automation"
          >
            <BoltIcon className="h-8 w-8 group-hover:animate-pulse" />
          </button>
          <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            AI Assistant
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Tasks;