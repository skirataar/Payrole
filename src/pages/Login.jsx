import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, LogIn } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { darkMode } = useTheme();
  const { user, login } = useAuth();
  const { logActivity } = useActivity();
  const navigate = useNavigate();

  // Use only the local error for this form
  const error = loginError;

  // Only redirect after successful login, not on initial load
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only redirect if we've attempted a login (shouldRedirect is true)
    if (user && shouldRedirect) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, shouldRedirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Call the login function from auth context
      const loggedInUser = await login(email, password);

      // Log the login activity if the activity logger is available
      if (logActivity) {
        try {
          logActivity('LOGIN', {
            email: loggedInUser.email,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error logging activity:', error);
          // Continue with login even if activity logging fails
        }
      }

      // Set shouldRedirect to true to trigger the redirect in useEffect
      setShouldRedirect(true);
      setIsLoading(false);
    } catch (err) {
      setLoginError(err.message || 'An error occurred during login. Please try again.');
      setIsLoading(false);
    }
  };

  // Clear error when user types
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setLoginError("");
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLoginError("");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="mx-auto flex justify-center items-center h-20 w-20 mb-4">
              <img src={logo} alt="Payroll Pro Logo" className="h-20 w-auto" />
            </div>
          </Link>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payroll Pro
          </h1>
          <h2 className={`mt-4 text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Company Sign In
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Enter your credentials to access the payroll system
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500 text-gray-900'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500 text-gray-900'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'} focus:ring-blue-500`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                New to Payroll Pro?
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className={`text-blue-600 hover:text-blue-500 font-medium`}
            >
              Create a company account
            </Link>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <Link
                to="/"
                className={`inline-flex items-center text-blue-600 hover:text-blue-500 font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
