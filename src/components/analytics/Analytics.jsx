import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { 
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overview, trends, hourly, weekly, insights] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends({ period: selectedPeriod }),
        analyticsService.getHourlyProductivity(),
        analyticsService.getWeeklyProductivity(),
        analyticsService.getInsights()
      ]);

      setAnalyticsData({
        overview,
        trends,
        hourly,
        weekly,
        insights
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const data = await analyticsService.exportData(format, selectedPeriod);
      
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return <Loading text="Loading analytics..." />;
  }

  const { overview, trends, hourly, weekly, insights } = analyticsData;

  // Filter hourly data to show only hours with activity
  const activeHours = hourly.filter(h => h.tasks_completed > 0);

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {typeof label === 'string' && label.includes('-') 
              ? format(new Date(label), 'MMM dd, yyyy')
              : label
            }
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Rate') && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Deep dive into your productivity patterns and insights
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="form-input text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          
          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('json')}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.today_completed}/{overview.today_created}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {overview.completion_rate_today.toFixed(1)}% completion
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.week_completed}/{overview.week_created}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {overview.completion_rate_week.toFixed(1)}% completion
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.current_streak} days
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Keep it going! 🔥
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overview.completion_rate_month.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {overview.month_completed} completed
              </p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300 dark:text-gray-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${overview.completion_rate_month}, 100`}
                  strokeLinecap="round"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completion Trends ({selectedPeriod})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.data_points}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="tasks_completed" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Completed"
              />
              <Line 
                type="monotone" 
                dataKey="tasks_created" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Created"
              />
              <Line 
                type="monotone" 
                dataKey="completion_rate" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Completion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Productivity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Productivity Pattern
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day_of_week" 
                tickFormatter={(value) => value.substring(0, 3)}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="tasks_completed" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Tasks Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Productivity */}
      {activeHours.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hourly Productivity (Active Hours Only)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activeHours}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}:00`}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value) => [value, 'Tasks Completed']}
              />
              <Bar 
                dataKey="tasks_completed" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Productivity Insights
          </h3>
          <div className="space-y-3">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trends.total_completed}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {trends.total_created}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {trends.average_completion_rate}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Completion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {weekly.reduce((max, day) => day.tasks_completed > max.tasks_completed ? day : max, weekly[0])?.day_of_week?.substring(0, 3) || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;