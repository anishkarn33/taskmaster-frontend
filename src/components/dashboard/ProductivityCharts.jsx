import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { analyticsService } from '../../services/analytics';

const ProductivityCharts = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyProductivity();
  }, []);

  const fetchWeeklyProductivity = async () => {
    try {
      const data = await analyticsService.getWeeklyProductivity();
      setWeeklyData(data);
    } catch (error) {
      console.error('Error fetching weekly productivity:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Tasks: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].payload.completion_rate?.toFixed(1)}% of weekly total
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Productivity
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Productivity
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tasks completed by day
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="day_of_week" 
            tickFormatter={(value) => value.substring(0, 3)}
            className="text-xs"
            stroke="currentColor"
          />
          <YAxis 
            className="text-xs"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="tasks_completed" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            name="Tasks Completed"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Best day indicator */}
      {weeklyData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {weeklyData.reduce((prev, current) => 
                prev.tasks_completed > current.tasks_completed ? prev : current
              ).day_of_week}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityCharts;