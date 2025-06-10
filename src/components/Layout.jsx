import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubscriptionAlert from './SubscriptionAlert';
import SubscriptionGate from './SubscriptionGate';
import {
  Menu, X, BarChart3, Upload, FileText, Settings,
  Bell, User, ChevronDown, LogOut, HelpCircle, UserCog,
  Moon, Sun, Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, path: '/dashboard' },
    { id: 'upload', label: 'Upload Excel', icon: <Upload size={20} />, path: '/upload' },
    { id: 'salary-report', label: 'Salary Report', icon: <FileText size={20} />, path: '/salary-report' },
    { id: 'employees', label: 'Employees', icon: <Users size={20} />, path: '/employees' }
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Check if user is logged in
  useEffect(() => {
    // Only redirect if we're sure the user isn't logged in (not during initial loading)
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Get current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/upload') return 'upload';
    if (path === '/salary-report') return 'salary-report';
    if (path === '/employees') return 'employees';
    if (path === '/settings') return 'settings';
    return '';
  };

  const currentPage = getCurrentPage();

  return (
    <SubscriptionGate>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <aside
        className={`bg-white dark:bg-gray-800 shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <img src={logo} alt="Payroll Pro Logo" className="h-8 w-auto mr-2" />
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Payroll Pro</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when a menu item is clicked
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`flex items-center px-4 py-3 mb-2 rounded-md ${
                currentPage === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <div className="relative">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center dark:text-white"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center dark:text-white"
                title="Notifications"
              >
                <Bell size={20} />
              </button>
            </div>

            <div className="relative">
              <Link
                to="/settings"
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center dark:text-white ${
                  currentPage === 'settings' ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                title="Settings"
              >
                <Settings size={20} />
              </Link>
            </div>

            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center dark:text-white"
                title="User Profile"
              >
                <User size={20} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCog size={16} className="mr-2" />
                    Profile Settings
                  </Link>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help & Support
                  </a>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {/* Subscription alert */}
          <SubscriptionAlert />

          {children}
        </main>
      </div>
    </div>
    </SubscriptionGate>
  );
};

export default Layout;
