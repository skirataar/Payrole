import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, BarChart3, Upload, FileText, Settings, 
  Bell, User, ChevronDown, LogOut, HelpCircle, UserCog
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, path: '/' },
    { id: 'upload', label: 'Upload Excel', icon: <Upload size={20} />, path: '/upload' },
    { id: 'salary-report', label: 'Salary Report', icon: <FileText size={20} />, path: '/salary-report' }
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
  
  // Get current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/upload') return 'upload';
    if (path === '/salary-report') return 'salary-report';
    if (path === '/settings') return 'settings';
    return '';
  };
  
  const currentPage = getCurrentPage();
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Golana Payroll</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md lg:hidden hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-md ${
                currentPage === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
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
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md lg:hidden hover:bg-gray-200"
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-200 flex items-center"
                title="Notifications"
              >
                <Bell size={20} />
              </button>
            </div>
            
            <div className="relative">
              <Link 
                to="/settings"
                className={`p-2 rounded-full hover:bg-gray-200 flex items-center ${
                  currentPage === 'settings' ? 'bg-gray-200' : ''
                }`}
                title="Settings"
              >
                <Settings size={20} />
              </Link>
            </div>
            
            <div className="relative user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full hover:bg-gray-200 flex items-center"
                title="User Profile"
              >
                <User size={20} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-500">admin@golana.com</p>
                  </div>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCog size={16} className="mr-2" />
                    Profile Settings
                  </Link>
                  <a 
                    href="#" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help & Support
                  </a>
                  <a 
                    href="#" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </a>
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
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
