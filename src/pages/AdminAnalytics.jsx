import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, TrendingUp, Users, Building, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminAnalytics = () => {
  const { user, getAllCompanies, getAllUsers, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  // Load companies and users
  useEffect(() => {
    if (isAdmin) {
      const companyData = getAllCompanies();
      const userData = getAllUsers();
      
      if (companyData) setCompanies(companyData);
      if (userData) setUsers(userData.filter(u => u.role === 'company'));
    }
  }, [isAdmin, getAllCompanies, getAllUsers]);

  // Calculate analytics data
  const totalEmployees = companies.reduce((sum, company) => sum + (company.employees?.length || 0), 0);
  const totalSalary = companies.reduce((sum, company) => {
    const monthlySalary = Object.values(company.monthlyData || {}).reduce((monthSum, monthData) => {
      return monthSum + (monthData.companies?.[0]?.summary?.total_salary || 0);
    }, 0);
    return sum + monthlySalary;
  }, 0);
  
  const planDistribution = {
    basic: users.filter(u => u.subscription?.plan === 'basic').length,
    premium: users.filter(u => u.subscription?.plan === 'premium').length,
    enterprise: users.filter(u => u.subscription?.plan === 'enterprise').length
  };

  const statusDistribution = {
    active: users.filter(u => u.subscription?.status === 'active').length,
    inactive: users.filter(u => u.subscription?.status === 'inactive').length,
    pending: users.filter(u => u.subscription?.status === 'pending').length
  };

  // Calculate average employees per company
  const avgEmployeesPerCompany = companies.length > 0 
    ? Math.round(totalEmployees / companies.length) 
    : 0;

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} min-h-screen`}>
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <BarChart3 size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Companies</p>
              <h2 className="text-3xl font-bold dark:text-white">{companies.length}</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full shadow-sm">
              <Building className="text-blue-600 dark:text-blue-400" size={26} />
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Employees</p>
              <h2 className="text-3xl font-bold dark:text-white">{totalEmployees}</h2>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-full shadow-sm">
              <Users className="text-green-600 dark:text-green-400" size={26} />
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Avg. Employees/Company</p>
              <h2 className="text-3xl font-bold dark:text-white">{avgEmployeesPerCompany}</h2>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3.5 rounded-full shadow-sm">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Subscription Plans Distribution */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Subscription Plans
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (planDistribution.basic / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Basic: {planDistribution.basic}</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-purple-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (planDistribution.premium / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Premium: {planDistribution.premium}</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-indigo-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (planDistribution.enterprise / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Enterprise: {planDistribution.enterprise}</span>
            </div>
          </div>
        </div>

        {/* Subscription Status Distribution */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Subscription Status
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (statusDistribution.active / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Active: {statusDistribution.active}</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-red-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (statusDistribution.inactive / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Inactive: {statusDistribution.inactive}</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-yellow-600 h-4 rounded-full" 
                  style={{ width: `${users.length > 0 ? (statusDistribution.pending / users.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="ml-4 min-w-16 text-sm">Pending: {statusDistribution.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Size Distribution */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
          Company Size Distribution
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {company.employees?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${totalEmployees > 0 ? ((company.employees?.length || 0) / totalEmployees) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500 dark:text-gray-300">
                          {totalEmployees > 0 ? Math.round(((company.employees?.length || 0) / totalEmployees) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">No companies found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
