import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EllipsisVerticalIcon,
  CalendarIcon,
  UserIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XCircleIcon,
  SparklesIcon,
  BoltIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { taskAPI, userAPI, commentAPI } from '../../utils/api';
import { useToast } from '../Toast';
import TaskModal from './TaskModal';
import AIChat from '../AI/AIChat';

const KanbanBoard = () => {
  const [boardData, setBoardData] = useState({ columns: [], total_tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // AI Chat states
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [aiCommands, setAiCommands] = useState([]);

  // Toast notifications
  const { showToast, ToastContainer } = useToast();

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchBoardData();
    fetchUsers();
    fetchCurrentUser();
    checkAIStatus();
    fetchAICommands();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      
      // Get all tasks and organize into board format
      const tasks = await taskAPI.getTasks();
      
      // Organize tasks by status
      const columns = [
        {
          status: 'todo',
          title: 'To Do',
          tasks: tasks.filter(task => task.status === 'todo')
        },
        {
          status: 'in_progress', 
          title: 'In Progress',
          tasks: tasks.filter(task => task.status === 'in_progress')
        },
        {
          status: 'in_review',
          title: 'In Review', 
          tasks: tasks.filter(task => task.status === 'in_review')
        },
        {
          status: 'completed',
          title: 'Completed',
          tasks: tasks.filter(task => task.status === 'completed')
        }
      ];

      setBoardData({
        columns,
        total_tasks: tasks.length
      });

    } catch (error) {
      console.error('Error fetching board data:', error);
      alert('Failed to load board data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  // ================= AI FUNCTIONS =================
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

  // ================= AI HANDLERS =================
  const handleAITaskCreated = async (newTask) => {
    console.log('AI created task:', newTask);
    showToast(`AI Assistant created task: "${newTask.title}"`, 'success');
    await fetchBoardData(); // Refresh the board
  };

  const handleAITaskUpdated = async (updatedTask) => {
    console.log('AI updated task:', updatedTask);
    if (updatedTask) {
      showToast(`AI Assistant updated task: "${updatedTask.title}"`, 'success');
    } else {
      showToast('AI Assistant updated tasks successfully', 'success');
    }
    await fetchBoardData(); // Refresh the board
  };

  const handleAITaskDeleted = async (deletedTask) => {
    console.log('AI deleted task:', deletedTask);
    if (deletedTask) {
      showToast(`AI Assistant deleted task: "${deletedTask.title}"`, 'success');
    } else {
      showToast('AI Assistant deleted tasks successfully', 'success');
    }
    await fetchBoardData(); // Refresh the board
  };

  const handleAITaskMoved = async (movedTask) => {
    console.log('AI moved task:', movedTask);
    showToast(`AI Assistant moved task: "${movedTask.title}" to ${movedTask.status}`, 'success');
    await fetchBoardData(); // Refresh the board
  };

  const handleAIQuickAction = (action) => {
    setShowAIChat(true);
    // The AI chat will handle the action
  };

  // ================= DRAG AND DROP HANDLERS =================
  const handleDragStart = (e, task) => {
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(task));
      e.target.style.opacity = '0.5';
      console.log('Started dragging task:', task.id, task.title);
    } catch (error) {
      console.error('Error starting drag:', error);
    }
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnStatus) => {
    e.preventDefault();
    
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (taskData.status === targetColumnStatus) {
        console.log('Task already in target column');
        return;
      }

      console.log('Moving task:', {
        taskId: taskData.id,
        title: taskData.title,
        from: taskData.status,
        to: targetColumnStatus
      });

      // Update task status using the API
      const updateData = {
        title: taskData.title,
        description: taskData.description || '',
        status: targetColumnStatus,
        priority: taskData.priority || 'medium',
        ...(taskData.assigned_to_id && { assigned_to_id: taskData.assigned_to_id }),
        ...(taskData.due_date && { due_date: taskData.due_date }),
      };

      await taskAPI.updateTask(taskData.id, updateData);
      await fetchBoardData(); // Refresh the board
      
      // Show success toast
      showToast(`Task "${taskData.title}" moved to ${targetColumnStatus.replace('_', ' ')}!`, 'success');

    } catch (error) {
      console.error('Error in handleDrop:', error);
      alert('Error moving task: ' + error.message);
    }
  };

  // ================= TASK ACTIONS =================
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setShowTaskModal(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.deleteTask(taskId);
      await fetchBoardData(); // Refresh the board
      showToast('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task: ' + error.message, 'error');
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsEditing(false);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      // Map frontend status values to backend expected values
      const statusMap = {
        'TODO': 'todo',
        'IN_PROGRESS': 'in_progress',
        'IN_REVIEW': 'in_review',
        'DONE': 'completed'
      };

      // Map frontend priority values to backend expected values
      const priorityMap = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'urgent'
      };

      // Format the data properly
      const formattedData = {
        title: taskData.title,
        description: taskData.description || '',
        status: statusMap[taskData.status] || taskData.status || 'todo',
        priority: priorityMap[taskData.priority] || taskData.priority || 'medium',
        ...(taskData.assigned_to_id && { assigned_to_id: parseInt(taskData.assigned_to_id) }),
        ...(taskData.reviewer_id && { reviewer_id: parseInt(taskData.reviewer_id) }),
        // Fix date format - convert date to datetime
        ...(taskData.due_date && { 
          due_date: taskData.due_date.includes('T') ? 
            taskData.due_date : 
            taskData.due_date + 'T23:59:59Z' 
        }),
      };

      console.log('Saving task data:', formattedData);

      if (isEditing && selectedTask) {
        await taskAPI.updateTask(selectedTask.id, formattedData);
        showToast(`Task "${taskData.title}" updated successfully!`, 'success');
      } else {
        await taskAPI.createTask(formattedData);
        showToast(`Task "${taskData.title}" created successfully!`, 'success');
      }
      
      await fetchBoardData();
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      const action = isEditing ? 'update' : 'create';
      showToast(`Failed to ${action} task: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading board...</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Enhanced Header with AI Features */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span>Task Board</span>
                {aiStatus === 'online' && <BoltIcon className="h-6 w-6 text-purple-500" />}
                {aiStatus === 'online' && <span className="text-purple-600 text-sm font-medium">AI Enhanced</span>}
              </h1>
              <p className="mt-1 text-sm text-gray-500 flex items-center space-x-2">
                <span>Organize and track your tasks with intelligent automation</span>
                {aiStatus === 'online' && (
                  <span className="text-green-600 font-medium">• AI Assistant Active</span>
                )}
                {aiStatus === 'offline' && (
                  <span className="text-red-600 font-medium">• AI Assistant Unavailable</span>
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
                LLaMA {aiStatus === 'online' ? 'Online' : 'Offline'}
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
                  onClick={() => handleAIQuickAction('move')}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                  title="AI Move Tasks"
                >
                  <BoltIcon className="h-3 w-3 mr-1" />
                  AI Move
                </button>
                <button
                  onClick={() => handleAIQuickAction('organize')}
                  className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                  title="AI Organize Board"
                >
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  AI Organize
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* AI Commands Banner
        {aiStatus === 'online' && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <BoltIcon className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">AI Automation Capabilities</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center space-x-2 text-purple-700">
                <SparklesIcon className="h-4 w-4" />
                <span>"Create a bug fix task in the To Do column"</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span>"Move all completed tasks older than 7 days"</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-purple-500 rounded"></div>
                </div>
                <span>"Show me all high priority tasks in review"</span>
              </div>
            </div>
          </div>
        )} */}

        {/* Search */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks or ask AI assistant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {aiStatus === 'online' && searchTerm && (
            <button
              onClick={() => {
                setShowAIChat(true);
                // Could pass search term to AI chat
              }}
              className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              Ask AI
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {boardData.columns?.map((column) => (
          <KanbanColumn 
            key={column.status} 
            column={column} 
            searchTerm={searchTerm}
            onEditTask={handleEditTask}
            onViewTask={handleViewTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            aiStatus={aiStatus}
          />
        ))}
      </div>

      {/* Task Modal - Using the same professional modal as Tasks page */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          users={users}
          isEditing={isEditing}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          currentUser={currentUser}
          onClose={() => setShowTaskDetail(false)}
          onTaskUpdate={fetchBoardData}
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
            title="Open AI Assistant - Intelligent Task Automation"
          >
            <BoltIcon className="h-8 w-8 group-hover:animate-pulse" />
          </button>
          <div className="absolute -top-12 -left-4 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

// ================= ENHANCED KANBAN COLUMN COMPONENT =================
const KanbanColumn = ({ column, searchTerm, onEditTask, onViewTask, onDeleteTask, onDragStart, onDragEnd, onDragOver, onDrop, aiStatus }) => {
  const [dragOverColumn, setDragOverColumn] = useState(false);

  const getColumnStyle = (status) => {
    const styles = {
      todo: {
        borderColor: 'border-gray-300',
        bgColor: 'bg-gray-50',
        headerBg: 'bg-gray-100',
        headerText: 'text-gray-700'
      },
      in_progress: {
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        headerBg: 'bg-blue-100',
        headerText: 'text-blue-700'
      },
      in_review: {
        borderColor: 'border-purple-300',
        bgColor: 'bg-purple-50',
        headerBg: 'bg-purple-100',
        headerText: 'text-purple-700'
      },
      completed: {
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        headerBg: 'bg-green-100',
        headerText: 'text-green-700'
      }
    };
    return styles[status] || styles.todo;
  };

  const style = getColumnStyle(column.status);
  
  const filteredTasks = column.tasks?.filter(task => {
    if (!searchTerm) return true;
    return task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverColumn(true);
    onDragOver(e);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(false);
    }
  };

  const handleDrop = (e) => {
    setDragOverColumn(false);
    onDrop(e, column.status);
  };

  return (
    <div className={`flex flex-col rounded-lg border-2 ${style.borderColor} bg-white overflow-hidden shadow-sm`}>
      {/* Enhanced Column Header with AI indicator */}
      <div className={`px-4 py-3 ${style.headerBg} ${style.headerText} border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold capitalize flex items-center space-x-2">
            <span>{column.title || column.status.replace('_', ' ')}</span>
            {aiStatus === 'online' && (
              <BoltIcon className="h-3 w-3 text-purple-500" title="AI Automated Column" />
            )}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium bg-white bg-opacity-80 px-2 py-1 rounded-full">
              {filteredTasks.length}
            </span>
            <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* AI Status Indicator for Column */}
        {aiStatus === 'online' && (
          <div className="mt-1 text-xs text-gray-600 flex items-center space-x-1">
            <SparklesIcon className="h-3 w-3" />
            <span>AI Ready</span>
          </div>
        )}
      </div>

      {/* Enhanced Drop Zone with AI Suggestions */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-3 min-h-[500px] transition-all duration-200 ${
          dragOverColumn ? 'bg-blue-100 bg-opacity-50 border-blue-300' : style.bgColor
        }`}
      >
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed rounded-lg transition-all ${
              dragOverColumn ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300'
            }`}>
              <div className="text-sm font-medium">No tasks</div>
              <div className="text-xs mt-1">
                {aiStatus === 'online' ? 'Use AI Assistant to create tasks' : 'Drag tasks here'}
              </div>
              {aiStatus === 'online' && (
                <div className="text-xs mt-1 text-purple-600">
                  AI can automatically organize this column
                </div>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard 
                key={task.id}
                task={task} 
                onEdit={onEditTask}
                onView={onViewTask}
                onDelete={onDeleteTask}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                aiStatus={aiStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ================= ENHANCED TASK CARD COMPONENT WITH AI =================
const TaskCard = ({ task, onEdit, onView, onDelete, onDragStart, onDragEnd, aiStatus }) => {
  const [showActions, setShowActions] = useState(false);

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

  const getAssigneeInitials = (user) => {
    if (!user) return '?';
    const name = user.full_name || user.username || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date() && task.status !== 'completed';
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleView = (e) => {
    e.stopPropagation();
    onView(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleDragStart = (e) => {
    onDragStart(e, task);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="group relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm transition-all duration-200 cursor-grab hover:shadow-md hover:border-gray-300 active:cursor-grabbing"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Priority Badge and Actions with AI Indicator */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <FlagIcon className="h-3 w-3 mr-1" />
            {task.priority}
          </span>
          {aiStatus === 'online' && (
            <BoltIcon className="h-3 w-3 text-purple-500" title="Intelligent Automation" />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className={`flex items-center space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleView}
            className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors z-10"
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors z-10"
            title="Edit task"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors z-10"
            title="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task Title with AI Enhancement Indicator */}
      <h4 className={`text-sm font-medium mb-2 flex items-center space-x-1 ${
        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
      }`}>
        <span>{task.title}</span>
        {aiStatus === 'online' && task.ai_generated && (
          <SparklesIcon className="h-3 w-3 text-purple-500" title="AI Generated Task" />
        )}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* AI Suggestions Badge */}
      {aiStatus === 'online' && isOverdue(task.due_date) && (
        <div className="mb-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-1">
          <BoltIcon className="h-3 w-3" />
          <span>AI Suggestion: Task overdue - consider priority review</span>
        </div>
      )}

      {/* Review Status for In Review tasks */}
      {task.status === 'in_review' && (
        <div className="mb-2">
          <div className="flex items-center text-xs text-purple-600">
            <EyeIcon className="h-3 w-3 mr-1" />
            <span>
              Reviewer: {task.reviewer?.full_name || task.reviewer?.username || 'Assigned'}
            </span>
          </div>
          {task.review_status && (
            <div className={`text-xs mt-1 ${
              task.review_status === 'approved' ? 'text-green-600' :
              task.review_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              Status: {task.review_status}
            </div>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
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

          {/* Due Date with AI Smart Coloring */}
          {task.due_date && (
            <div className={`flex items-center text-xs ${
              isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}>
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        {/* Right Side with AI Enhancement */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="flex items-center cursor-pointer hover:text-blue-600" onClick={handleView}>
            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
            <span>{task.comment_count || 0}</span>
          </div>
          <span className="font-mono">#{task.id}</span>
          {aiStatus === 'online' && (
            <BoltIcon className="h-3 w-3 text-purple-400" title="AI Enhanced Task" />
          )}
        </div>
      </div>
    </div>
  );
};

// ================= TASK DETAIL MODAL WITH COMMENTS =================
const TaskDetailModal = ({ task, users, currentUser, onClose, onTaskUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for task:', task.id);
      const data = await commentAPI.getTaskComments(task.id);
      console.log('Fetched comments:', data);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      console.log('Adding comment:', { content: newComment.trim(), task_id: task.id });
      
      const result = await commentAPI.createComment({
        content: newComment.trim(),
        task_id: task.id,
      });
      
      console.log('Comment added result:', result);
      setNewComment('');
      await fetchComments();
      await onTaskUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getAssigneeInitials = (user) => {
    if (!user) return '?';
    const name = user.full_name || user.username || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500">#{task.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Task Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'low' ? 'bg-emerald-100 text-emerald-800' :
                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.priority?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Assigned to:</span>
                <span className="ml-2">
                  {task.assigned_to ? 
                    (task.assigned_to.full_name || task.assigned_to.username) : 
                    'Unassigned'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Due Date:</span>
                <span className="ml-2">
                  {task.due_date ? formatDateTime(task.due_date) : 'No due date'}
                </span>
              </div>
              {task.status === 'in_review' && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Reviewer:</span>
                    <span className="ml-2">
                      {task.reviewer ? 
                        (task.reviewer.full_name || task.reviewer.username) : 
                        'Not assigned'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Review Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      task.review_status === 'approved' ? 'bg-green-100 text-green-800' :
                      task.review_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.review_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {task.description && (
              <div className="mt-4">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-gray-600">{task.description}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Comments ({comments.length})
            </h4>
            
            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No comments yet</p>
              ) : (
                comments.map((comment, index) => {
                  // Extract comment data with multiple fallbacks
                  const commentText = comment.comment || comment.content || comment.text || '';
                  const authorData = comment.author || comment.user || {};
                  const authorName = authorData.full_name || authorData.username || 'Unknown User';
                  const createdAt = comment.created_at || comment.createdAt || new Date().toISOString();
                  
                  return (
                    <div key={comment.id || index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {getAssigneeInitials({ username: authorName })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900">
                              {authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {commentText || 'No content available'}
                          </p>
                          
                          {/* Temporary debug info - remove after fixing */}
                          {!commentText && (
                            <div className="text-xs text-red-500 mt-1 p-2 bg-red-50 rounded">
                              Debug: {JSON.stringify(comment, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {currentUser ? getAssigneeInitials(currentUser) : 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || loading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                {loading ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;