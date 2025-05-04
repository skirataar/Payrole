import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the activity context
const ActivityContext = createContext();

// Custom hook to use the activity context
export const useActivity = () => useContext(ActivityContext);

// Provider component
export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);

  // Get user from localStorage directly to avoid circular dependency
  const getUserFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  // Track the current user's company ID
  const [currentCompanyId, setCurrentCompanyId] = useState(null);

  // Listen for user changes in localStorage
  useEffect(() => {
    // Initial load
    loadActivitiesForCurrentUser();

    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        console.log('User changed in localStorage, reloading activities');
        loadActivitiesForCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also set up an interval to check for user changes (for same-tab changes)
    const intervalId = setInterval(() => {
      const user = getUserFromLocalStorage();
      if (user?.companyId !== currentCompanyId) {
        console.log('User changed, reloading activities');
        loadActivitiesForCurrentUser();
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [currentCompanyId]);

  // Function to load activities for the current user
  const loadActivitiesForCurrentUser = () => {
    const user = getUserFromLocalStorage();

    if (user?.companyId) {
      const companyId = user.companyId;

      // Only reload if company ID has changed
      if (companyId !== currentCompanyId) {
        setCurrentCompanyId(companyId);

        const savedActivities = localStorage.getItem(`activities_${companyId}`);

        if (savedActivities) {
          try {
            setActivities(JSON.parse(savedActivities));
            console.log(`Loaded activities for company: ${companyId}`);
          } catch (error) {
            console.error('Error parsing saved activities:', error);
            setActivities([]);
          }
        } else {
          // Initialize empty activities for new company
          setActivities([]);
          console.log(`No saved activities found for company: ${companyId}, initialized empty activities`);
        }
      }
    } else {
      // Reset to empty if no user or no company ID
      setCurrentCompanyId(null);
      setActivities([]);
    }
  };

  // Save activities to localStorage when they change
  useEffect(() => {
    if (currentCompanyId && activities.length > 0) {
      localStorage.setItem(`activities_${currentCompanyId}`, JSON.stringify(activities));
      console.log(`Saved ${activities.length} activities for company: ${currentCompanyId}`);
    }
  }, [activities, currentCompanyId]);

  // Function to log a new activity
  const logActivity = (action, details = {}) => {
    const user = getUserFromLocalStorage();
    if (!user) return;

    // Check if the user's company ID matches the current company ID
    if (user.companyId !== currentCompanyId) {
      // If not, reload activities for the current user before adding the new activity
      loadActivitiesForCurrentUser();
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      companyId: user.companyId, // Store the company ID with the activity
      action,
      details,
    };

    console.log(`Logging activity for company: ${user.companyId}`, newActivity);

    // Add to beginning of array (newest first)
    setActivities(prev => [newActivity, ...prev.slice(0, 99)]); // Keep only the last 100 activities
  };

  // Function to clear all activities
  const clearActivities = () => {
    const user = getUserFromLocalStorage();
    if (!user?.companyId) return;

    // Check if the user's company ID matches the current company ID
    if (user.companyId !== currentCompanyId) {
      // If not, reload activities for the current user before clearing
      loadActivitiesForCurrentUser();
      return; // Return early to prevent clearing activities for the wrong company
    }

    console.log(`Clearing activities for company: ${currentCompanyId}`);

    setActivities([]);
    localStorage.removeItem(`activities_${currentCompanyId}`);

    // Log this action itself
    const clearActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      companyId: user.companyId, // Store the company ID with the activity
      action: 'CLEAR_ACTIVITIES',
      details: { message: 'All activity logs cleared' },
    };

    setActivities([clearActivity]);
  };

  // Value object that will be passed to any consumer components
  const value = {
    activities,
    logActivity,
    clearActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export default ActivityContext;
