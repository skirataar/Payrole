import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun, Save, RefreshCw, Shield, User, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminSettings = () => {
  const { user, isAdmin, changePassword } = useAuth();
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

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

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

  // Handle password change form input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Reset status when user starts typing again
    if (passwordChangeStatus) {
      setPasswordChangeStatus(null);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = () => {
    // Reset status
    setPasswordChangeStatus(null);

    // Validate form
    if (!passwordData.currentPassword) {
      setPasswordChangeStatus({ type: 'error', message: 'Current password is required' });
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordChangeStatus({ type: 'error', message: 'New password is required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordChangeStatus({ type: 'error', message: 'New password must be at least 6 characters long' });
      return;
    }

    // Try to change password
    try {
      changePassword(passwordData.currentPassword, passwordData.newPassword);

      // Show success message
      setPasswordChangeStatus({ type: 'success', message: 'Password changed successfully' });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordChangeStatus(null);
      }, 2000);

    } catch (error) {
      // Show error message
      setPasswordChangeStatus({ type: 'error', message: error.message });
    }
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

      {/* Profile Settings */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <User size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
          Profile Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="font-medium">{user?.name || 'Admin User'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
            <p className="font-medium">{user?.email || 'admin@example.com'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</p>
            <p className="font-medium">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 py-0.5 px-2 rounded-full text-xs">
                Administrator
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Lock size={18} className="mr-2" />
            Change Password
          </button>
        </div>
      </div>

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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Lock size={20} className="mr-2" />
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Confirm your new password"
                />
              </div>

              {/* Status Message */}
              {passwordChangeStatus && (
                <div className={`p-3 rounded-md flex items-center ${
                  passwordChangeStatus.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                }`}>
                  <AlertCircle size={20} className="mr-2" />
                  {passwordChangeStatus.message}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save size={18} className="mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
