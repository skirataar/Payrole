import React from 'react';
import { Link } from 'react-router-dom';
import { Building, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

const HomePage = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md py-4`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Payroll Pro Logo" className="h-10 w-auto mr-3" />
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Payroll Pro</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Payroll Pro</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            The all-in-one solution for managing your company's payroll and employee attendance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Company Login Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105`}>
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Company Login</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Access your company dashboard to manage payroll, upload attendance data, and generate reports.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  Sign In as Company
                </Link>
              </div>
            </div>
          </div>

          {/* Employee Login Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105`}>
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Employee Login</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                View your salary details, attendance records, and download your payslips.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/employee-login"
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                >
                  Sign In as Employee
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-6`}>
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Payroll Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
