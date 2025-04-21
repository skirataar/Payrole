import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun, Save, RefreshCw, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminSettings = () => {
  const { user, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [systemSettings, setSystemSettings] = useState({
    defaultSubscriptionDuration: 30,
    defaultPlan: 'basic',
    autoRenewSubscriptions: false,
    sendExpirationReminders: true,
    reminderDays: 7,
    maxCompaniesPerAdmin: 50
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPasswords: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSystemSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSecuritySettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} min-h-screen`}>
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <Settings size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        Admin Settings
      </h1>

      {saveSuccess && (
        <div className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded relative">
          <span className="block sm:inline">Settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System Settings */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <RefreshCw size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            System Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Subscription Duration (days)</label>
              <input 
                type="number" 
                name="defaultSubscriptionDuration"
                value={systemSettings.defaultSubscriptionDuration}
                onChange={handleSystemSettingsChange}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Default Plan</label>
              <select 
                name="defaultPlan"
                value={systemSettings.defaultPlan}
                onChange={handleSystemSettingsChange}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="autoRenewSubscriptions"
                name="autoRenewSubscriptions"
                checked={systemSettings.autoRenewSubscriptions}
                onChange={handleSystemSettingsChange}
                className={`h-4 w-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'} focus:ring-blue-500`}
              />
              <label htmlFor="autoRenewSubscriptions" className="ml-2 block text-sm">
                Auto-renew subscriptions
              </label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="sendExpirationReminders"
                name="sendExpirationReminders"
                checked={systemSettings.sendExpirationReminders}
                onChange={handleSystemSettingsChange}
                className={`h-4 w-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'} focus:ring-blue-500`}
              />
              <label htmlFor="sendExpirationReminders" className="ml-2 block text-sm">
                Send expiration reminders
              </label>
            </div>
            
            {systemSettings.sendExpirationReminders && (
              <div>
                <label className="block text-sm font-medium mb-1">Reminder Days Before Expiration</label>
                <input 
                  type="number" 
                  name="reminderDays"
                  value={systemSettings.reminderDays}
                  onChange={handleSystemSettingsChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Companies Per Admin</label>
              <input 
                type="number" 
                name="maxCompaniesPerAdmin"
                value={systemSettings.maxCompaniesPerAdmin}
                onChange={handleSystemSettingsChange}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Security Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="requireStrongPasswords"
                name="requireStrongPasswords"
                checked={securitySettings.requireStrongPasswords}
                onChange={handleSecuritySettingsChange}
                className={`h-4 w-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'} focus:ring-blue-500`}
              />
              <label htmlFor="requireStrongPasswords" className="ml-2 block text-sm">
                Require strong passwords
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
              <input 
                type="number" 
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecuritySettingsChange}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Login Attempts</label>
              <input 
                type="number" 
                name="maxLoginAttempts"
                value={securitySettings.maxLoginAttempts}
                onChange={handleSecuritySettingsChange}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="twoFactorAuth"
                name="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecuritySettingsChange}
                className={`h-4 w-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'} focus:ring-blue-500`}
              />
              <label htmlFor="twoFactorAuth" className="ml-2 block text-sm">
                Enable two-factor authentication
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mt-8`}>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        
        <div className="flex items-center">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? (
              <>
                <Sun size={20} className="mr-2" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={20} className="mr-2" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <RefreshCw size={20} className="mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
