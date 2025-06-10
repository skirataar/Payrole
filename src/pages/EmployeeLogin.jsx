import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import logo from '../assets/logo.png';

const EmployeeLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);

  const { darkMode } = useTheme();
  const { loginEmployee, user, error: authError, clearError, getAllEmployeeIds } = useAuth();
  const { logActivity } = useActivity();
  const navigate = useNavigate();

  // Use the error from auth context or local error
  const displayError = error || authError;

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
    setError('');
  }, [clearError]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'employee') {
      navigate('/employee-dashboard');
    }
  }, [user, navigate]);

  // Handle redirect after successful login
  useEffect(() => {
    if (shouldRedirect) {
      navigate('/employee-dashboard');
    }
  }, [shouldRedirect, navigate]);

  // Function to handle employee ID lookup
  const handleLookupEmployeeIds = () => {
    try {
      const employees = getAllEmployeeIds();
      setEmployeeList(employees);
      setShowEmployeeList(true);
    } catch (err) {
      console.error('Error looking up employee IDs:', err);
      setError('Failed to retrieve employee IDs');
    }
  };

  // Function to select an employee ID from the list
  const selectEmployeeId = (id) => {
    setEmployeeId(id);
    setShowEmployeeList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!employeeId.trim()) {
      setError('Employee ID is required');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      // Call the login function from auth context
      const loggedInEmployee = await loginEmployee(employeeId, password);

      // Log the login activity if the activity logger is available
      if (logActivity) {
        try {
          logActivity('EMPLOYEE_LOGIN', {
            employeeId: loggedInEmployee.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error logging activity:', error);
          // Continue with login even if activity logging fails
        }
      }

      // Set shouldRedirect to true to trigger the redirect in useEffect
      setShouldRedirect(true);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="flex-grow flex items-center justify-center p-6">
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="Payroll Pro Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="text-2xl font-bold">Employee Login</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to access your payroll information
            </p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="employeeId" className="block text-sm font-medium mb-2">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 focus:ring-blue-600'
                      : 'bg-white border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your employee ID"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={handleLookupEmployeeIds}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    title="Look up employee IDs"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>

              {/* Employee ID lookup results */}
              {showEmployeeList && (
                <div className={`mt-1 p-2 border rounded-md shadow-lg max-h-60 overflow-y-auto ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium">Available Employee IDs</h4>
                    <button
                      type="button"
                      onClick={() => setShowEmployeeList(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      &times;
                    </button>
                  </div>

                  {employeeList.length > 0 ? (
                    <ul className="space-y-1">
                      {employeeList.map(employee => (
                        <li key={employee.id}>
                          <button
                            type="button"
                            onClick={() => selectEmployeeId(employee.id)}
                            className={`w-full text-left px-2 py-1 rounded text-sm ${
                              darkMode
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">{employee.id}</span> - {employee.name}
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {employee.companyName}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                      No employee IDs found
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 focus:ring-blue-600'
                      : 'bg-white border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Default password: PayPro1245
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
