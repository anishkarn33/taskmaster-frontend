import React from "react";
import {
  CheckIcon,
  CalendarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const PerformanceOverview = ({ overview, taskStats }) => {
  const stats = [
    {
      name: "Today",
      value: `${overview.today_completed}/${overview.today_created}`,
      description: "Tasks completed",
      icon: CheckIcon,
      color: "blue",
      percentage: overview.completion_rate_today,
    },
    {
      name: "This Week",
      value: `${overview.week_completed}/${overview.week_created}`,
      description: "Weekly progress",
      icon: CalendarIcon,
      color: "green",
      percentage: overview.completion_rate_week,
    },
    {
      name: "Current Streak",
      value: `${overview.current_streak} days`,
      description: "Consecutive days",
      icon: FireIcon,
      color: "orange",
      percentage: null,
    },
    {
      name: "Completion Rate",
      value: `${overview.completion_rate_month.toFixed(1)}%`,
      description: "Monthly average",
      icon: ArrowTrendingUpIcon,
      color: "purple",
      percentage: overview.completion_rate_month,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
        progress: "bg-blue-500",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
        progress: "bg-green-500",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600 dark:text-orange-400",
        progress: "bg-orange-500",
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-600 dark:text-purple-400",
        progress: "bg-purple-500",
      },
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const colorClasses = getColorClasses(stat.color);

        return (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                <stat.icon className={`h-6 w-6 ${colorClasses.text}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>

            {/* Progress bar for percentage stats */}
            {stat.percentage !== null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{stat.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${colorClasses.progress}`}
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceOverview;
