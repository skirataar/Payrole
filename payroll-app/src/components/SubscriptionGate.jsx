import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SubscriptionGate = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // If no user, don't block anything (login page will handle this)
  // Also don't block admin users
  if (!user || !user.subscription || user.role === 'admin') {
    return children;
  }

  // Parse expiration date
  const expirationDate = new Date(user.subscription.expiresAt);
  const today = new Date();

  // Calculate days until expiration
  const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

  // Check if subscription is active and not expired
  const isSubscriptionValid = user.subscription.status === 'active' && daysUntilExpiration > 0;

  // If subscription is valid, render children
  if (isSubscriptionValid) {
    return children;
  }

  // If subscription is expired or inactive, show blocking page
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {user.subscription.status === 'inactive'
              ? 'Your subscription is inactive.'
              : 'Your subscription has expired.'}
            <br />Please renew to continue using Payroll Pro.
          </p>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="font-medium mb-2">Subscription Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Plan:</div>
              <div className="font-medium">{user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}</div>

              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Status:</div>
              <div className="font-medium text-red-500">{user.subscription.status === 'inactive' ? 'Inactive' : 'Expired'}</div>

              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Expired on:</div>
              <div className="font-medium">{new Date(user.subscription.expiresAt).toLocaleDateString()}</div>
            </div>
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
            onClick={() => {
              // In a real app, this would redirect to a payment page
              alert('This would redirect to a payment page in a real application.');
            }}
          >
            <CreditCard className="mr-2" size={20} />
            Renew Subscription
          </button>

          <button
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="mr-2" size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGate;
