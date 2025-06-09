import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics';
import { tasksService } from '../../services/tasks';
import toast from 'react-hot-toast';
import PerformanceOverview from './PerformanceOverview';
import CompletionTrends from './CompletionTrends';
import ProductivityCharts from './ProductivityCharts';
import InsightCards from './InsightCards';
import Loading from '../common/Loading';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [overviewData, trendsData, insightsData, statsData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends({ period: 'weekly' }),
        analyticsService.getInsights(),
        tasksService.getTaskStats()
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      setInsights(insightsData);
      setTaskStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your productivity and task completion trends
        </p>
      </div>

      {/* Performance Overview Cards */}
      {overview && (
        <PerformanceOverview overview={overview} taskStats={taskStats} />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends Chart */}
        {trends && (
          <CompletionTrends trends={trends} />
        )}

        {/* Weekly Productivity Chart */}
        <ProductivityCharts />
      </div>

      {/* Insights Cards */}
      {insights && (
        <InsightCards insights={insights} />
      )}
    </div>
  );
};

export default Dashboard;