import React from 'react';
import { LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

const InsightCards = ({ insights }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Productivity Insights
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div>
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Key Insights
            </h4>
          </div>
          <div className="space-y-3">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Recommendations
            </h4>
          </div>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals if available */}
      {insights.goals_suggestions && insights.goals_suggestions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Suggested Goals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.goals_suggestions.map((goal, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  🎯 {goal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightCards;