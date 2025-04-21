import React, { useState } from 'react';
import { AlertTriangle, X, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionAlert = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  
  // Check if user has a subscription and if it's expired
  if (!user || !user.subscription || dismissed) {
    return null;
  }
  
  // Parse expiration date
  const expirationDate = new Date(user.subscription.expiresAt);
  const today = new Date();
  
  // Calculate days until expiration
  const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
  
  // If subscription is active and not close to expiration, don't show alert
  if (user.subscription.status === 'active' && daysUntilExpiration > 7) {
    return null;
  }
  
  // Determine alert type based on expiration
  let alertType = 'warning';
  let message = '';
  
  if (daysUntilExpiration <= 0) {
    // Subscription has expired
    alertType = 'error';
    message = 'Your subscription has expired. Please renew to continue using all features.';
  } else if (daysUntilExpiration <= 3) {
    // Subscription expires in 3 days or less
    alertType = 'error';
    message = `Your subscription expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}. Please renew soon to avoid service interruption.`;
  } else if (daysUntilExpiration <= 7) {
    // Subscription expires in 7 days or less
    message = `Your subscription expires in ${daysUntilExpiration} days. Consider renewing your plan.`;
  }
  
  // If subscription is already inactive
  if (user.subscription.status === 'inactive') {
    alertType = 'error';
    message = 'Your subscription is inactive. Please renew to access all features.';
  }
  
  // Determine background color based on alert type
  const bgColor = alertType === 'error' 
    ? 'bg-red-100 dark:bg-red-900/30' 
    : 'bg-yellow-100 dark:bg-yellow-900/30';
  
  const textColor = alertType === 'error'
    ? 'text-red-800 dark:text-red-200'
    : 'text-yellow-800 dark:text-yellow-200';
  
  const buttonBg = alertType === 'error'
    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
    : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800';
  
  return (
    <div className={`${bgColor} ${textColor} px-4 py-3 rounded-lg mb-6 relative flex items-center justify-between`}>
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>{message}</span>
      </div>
      <div className="flex items-center">
        <button 
          className={`${buttonBg} text-white px-4 py-2 rounded-md mr-2 flex items-center`}
          onClick={() => {
            // In a real app, this would redirect to a payment page
            alert('This would redirect to a payment page in a real application.');
          }}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          Renew Subscription
        </button>
        <button 
          onClick={() => setDismissed(true)} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionAlert;
