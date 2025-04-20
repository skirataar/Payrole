import React, { useState } from 'react';
import { Save, AlertCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const [settings, setSettings] = useState({
    vdaRate: 135.32,
    esiEmployeePercentage: 0.75,
    esiEmployerPercentage: 3.25,
    pfEmployeePercentage: 12,
    pfEmployerPercentage: 13,
    bonusPercentage: 8.33,
    lwfEmployeeContribution: 0,
    lwfEmployerContribution: 0,
    professionalTax: 200
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseFloat(value)
    });
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('payrollSettings', JSON.stringify(settings));
    setSaveStatus('success');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Dark Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          {darkMode ? <Moon size={20} className="mr-2" /> : <Sun size={20} className="mr-2" />}
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={darkMode}
          >
            <span className="sr-only">Toggle Dark Mode</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Switch between light and dark mode for better viewing experience.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Calculation Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vdaRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              VDA Rate
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="vdaRate"
                name="vdaRate"
                value={settings.vdaRate}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-8 pr-3 py-2 w-full"
                step="0.01"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Variable Dearness Allowance rate</p>
          </div>

          <div>
            <label htmlFor="bonusPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bonus Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                id="bonusPercentage"
                name="bonusPercentage"
                value={settings.bonusPercentage}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-3 pr-8 py-2 w-full"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Percentage used for bonus calculation</p>
          </div>

          <div>
            <label htmlFor="esiEmployeePercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ESI Employee Contribution
            </label>
            <div className="relative">
              <input
                type="number"
                id="esiEmployeePercentage"
                name="esiEmployeePercentage"
                value={settings.esiEmployeePercentage}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-3 pr-8 py-2 w-full"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Employee's ESI contribution percentage</p>
          </div>

          <div>
            <label htmlFor="esiEmployerPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ESI Employer Contribution
            </label>
            <div className="relative">
              <input
                type="number"
                id="esiEmployerPercentage"
                name="esiEmployerPercentage"
                value={settings.esiEmployerPercentage}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-3 pr-8 py-2 w-full"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Employer's ESI contribution percentage</p>
          </div>

          <div>
            <label htmlFor="pfEmployeePercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PF Employee Contribution
            </label>
            <div className="relative">
              <input
                type="number"
                id="pfEmployeePercentage"
                name="pfEmployeePercentage"
                value={settings.pfEmployeePercentage}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-3 pr-8 py-2 w-full"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Employee's PF contribution percentage</p>
          </div>

          <div>
            <label htmlFor="pfEmployerPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PF Employer Contribution
            </label>
            <div className="relative">
              <input
                type="number"
                id="pfEmployerPercentage"
                name="pfEmployerPercentage"
                value={settings.pfEmployerPercentage}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-3 pr-8 py-2 w-full"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Employer's PF contribution percentage</p>
          </div>

          <div>
            <label htmlFor="lwfEmployeeContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LWF Employee Contribution
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="lwfEmployeeContribution"
                name="lwfEmployeeContribution"
                value={settings.lwfEmployeeContribution}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-8 pr-3 py-2 w-full"
                step="0.01"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Labour Welfare Fund employee contribution</p>
          </div>

          <div>
            <label htmlFor="lwfEmployerContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LWF Employer Contribution
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="lwfEmployerContribution"
                name="lwfEmployerContribution"
                value={settings.lwfEmployerContribution}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-8 pr-3 py-2 w-full"
                step="0.01"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Labour Welfare Fund employer contribution</p>
          </div>

          <div>
            <label htmlFor="professionalTax" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Tax
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="professionalTax"
                name="professionalTax"
                value={settings.professionalTax}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pl-8 pr-3 py-2 w-full"
                step="0.01"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Default professional tax amount</p>
          </div>
        </div>

        {saveStatus === 'success' && (
          <div className="mt-6 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2" />
            Settings saved successfully!
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Save size={18} className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Data Management</h2>

        <div className="space-y-4">
          <div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  // Clear all application data
                  localStorage.removeItem('uploadedData');
                  localStorage.removeItem('lastUploadMonth');
                  localStorage.removeItem('lastUploadTime');

                  // Also clear payment status data
                  localStorage.removeItem('paidEmployees');

                  // Reload the page to reflect changes
                  window.location.reload();
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Clear All Data
            </button>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This will remove all uploaded data from the application. This action cannot be undone.
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                fetch('http://localhost:5000/api/clear-data', {
                  method: 'DELETE',
                })
                .then(response => response.json())
                .then(data => {
                  // Also clear payment status data from localStorage
                  localStorage.removeItem('paidEmployees');

                  alert(data.message + ' Payment status data has also been cleared.');

                  // Reload the page to reflect changes
                  window.location.reload();
                })
                .catch(error => {
                  console.error('Error clearing data:', error);
                  alert('Failed to clear data from the server');
                });
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
            >
              Clear Server Data
            </button>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This will remove all data from the server. You will need to upload your Excel file again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
