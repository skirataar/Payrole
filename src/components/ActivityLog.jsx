import React, { useMemo } from 'react';
import { Clock, User, FileText, Upload, DollarSign, Settings, LogIn, LogOut, Trash, RefreshCw, AlertCircle } from 'lucide-react';
import { useActivity } from '../context/ActivityContext';

const ActivityLog = () => {
  const { activities = [], clearActivities } = useActivity() || {};

  // Get current user's company ID
  const getCurrentCompanyId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return user?.companyId || null;
    } catch (error) {
      console.error('Error getting current company ID:', error);
      return null;
    }
  };

  // Filter activities to only show those for the current company
  const filteredActivities = useMemo(() => {
    const companyId = getCurrentCompanyId();
    if (!companyId) return [];

    return activities.filter(activity =>
      // Include activities that have the same company ID as the current user
      // or don't have a company ID at all (for backward compatibility)
      activity.companyId === companyId || !activity.companyId
    );
  }, [activities]);

  // Function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Function to get icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn size={16} className="text-green-500" />;
      case 'LOGOUT':
        return <LogOut size={16} className="text-orange-500" />;
      case 'UPLOAD_EXCEL':
        return <Upload size={16} className="text-blue-500" />;
      case 'GENERATE_REPORT':
        return <FileText size={16} className="text-purple-500" />;
      case 'MARK_PAID':
        return <DollarSign size={16} className="text-green-500" />;
      case 'MARK_UNPAID':
        return <RefreshCw size={16} className="text-yellow-500" />;
      case 'CHANGE_SETTINGS':
        return <Settings size={16} className="text-gray-500" />;
      case 'CLEAR_DATA':
        return <Trash size={16} className="text-red-500" />;
      case 'CLEAR_ACTIVITIES':
        return <Trash size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  // Function to get description based on action and details
  const getActionDescription = (activity) => {
    const { action, details, userName } = activity;

    switch (action) {
      case 'LOGIN':
        return `${userName} logged in`;
      case 'LOGOUT':
        return `${userName} logged out`;
      case 'UPLOAD_EXCEL':
        return `${userName} uploaded Excel file: ${details.fileName || 'Unnamed file'}`;
      case 'GENERATE_REPORT':
        return `${userName} generated ${details.reportType || 'salary'} report for ${details.month || 'current month'}`;
      case 'MARK_PAID':
        return `${userName} marked ${details.employeeName || 'an employee'} as paid`;
      case 'MARK_UNPAID':
        return `${userName} marked ${details.employeeName || 'an employee'} as unpaid`;
      case 'CHANGE_SETTINGS':
        return `${userName} updated ${details.settingType || 'application'} settings`;
      case 'CLEAR_DATA':
        return `${userName} cleared ${details.dataType || 'all'} data`;
      case 'CLEAR_ACTIVITIES':
        return `${userName} cleared activity logs`;
      default:
        return `${userName} performed ${action.toLowerCase().replace('_', ' ')}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-5 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white flex items-center">
          <Clock size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
          Recent Activity
        </h2>
        {filteredActivities.length > 0 && clearActivities && (
          <button
            onClick={() => {
              try {
                clearActivities();
              } catch (error) {
                console.error('Error clearing activities:', error);
              }
            }}
            className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium flex items-center"
          >
            <Trash size={16} className="mr-1" />
            Clear Log
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActivities.map((activity) => (
              <li key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getActionDescription(activity)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Clock size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-1">No activity recorded for your account</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your recent actions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
