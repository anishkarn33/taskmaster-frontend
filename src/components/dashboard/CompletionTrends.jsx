import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

const CompletionTrends = ({ trends }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch (error) {
      return dateString;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(label), 'MMM dd, yyyy')}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'Completion Rate' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Completion Trends
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Created</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Rate %</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends.data_points}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-xs"
            stroke="currentColor"
          />
          <YAxis 
            className="text-xs"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="tasks_completed" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Completed"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="tasks_created" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Created"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="completion_rate" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Completion Rate"
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Completed</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {trends.total_completed}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Created</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {trends.total_created}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rate</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {trends.average_completion_rate}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionTrends;