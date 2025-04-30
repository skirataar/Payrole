import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SubscriptionGate from './SubscriptionGate';
import logo from '../assets/logo.png';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Redirect if not admin
  useEffect(() => {
    // Only redirect if we're sure the user isn't an admin (not during initial loading)
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const sidebarItems = [
    {
      name: 'Companies',
      path: '/admin',
      icon: <Building size={20} />
    },
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: <CreditCard size={20} />
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 size={20} />
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings size={20} />
    }
  ];

  return (
    <SubscriptionGate>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Top Navigation */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`mr-4 p-1 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center">
            <img src={logo} alt="Payroll Pro Logo" className="h-8 w-auto mr-2" />
            <h1 className="text-xl font-bold">Payroll Pro Admin</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2">{user?.name || 'Admin'}</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
          } ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } transition-all duration-300 ease-in-out fixed left-0 top-14 bottom-0 z-10 overflow-y-auto md:translate-x-0 md:w-64 md:relative md:top-0`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      location.pathname === item.path
                        ? darkMode
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-blue-100 text-blue-800'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center p-3 rounded-md ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
    </SubscriptionGate>
  );
};

export default AdminLayout;
