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

  // Helper function to get the employee count for a company
  const getCompanyEmployeeCount = (company) => {
    try {
      // Get the most recent month's data
      const monthlyDataEntries = Object.entries(company.monthlyData || {});

      if (monthlyDataEntries.length === 0) {
        // If no monthly data, use the company's employees array
        return company.employees?.length || 0;
      }

      // Sort months by date (most recent first)
      monthlyDataEntries.sort((a, b) => {
        // Try to parse the month strings into dates
        try {
          // Format is typically "Month YYYY"
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          const [monthA, yearA] = a[0].split(' ');
          const [monthB, yearB] = b[0].split(' ');

          const monthIndexA = monthNames.indexOf(monthA);
          const monthIndexB = monthNames.indexOf(monthB);

          if (yearA !== yearB) {
            return parseInt(yearB) - parseInt(yearA);
          }

          return monthIndexB - monthIndexA;
        } catch (e) {
          // If parsing fails, use string comparison
          return a[0].localeCompare(b[0]);
        }
      });

      // Get the most recent month's data
      const [month, mostRecentData] = monthlyDataEntries[0];

      // Check if the data has the expected structure
      if (mostRecentData.summary && mostRecentData.summary.total_employees) {
        return mostRecentData.summary.total_employees;
      }

      // If we have companies data with employees
      if (mostRecentData.companies && Array.isArray(mostRecentData.companies)) {
        // Sum up all employees across all companies in this month
        let totalEmployees = 0;

        mostRecentData.companies.forEach(comp => {
          if (comp.employees && Array.isArray(comp.employees)) {
            totalEmployees += comp.employees.length;
          }
        });

        return totalEmployees;
      }

      // Fallback to company's employees array
      return company.employees?.length || 0;
    } catch (error) {
      console.error(`Error calculating employee count for ${company.name}:`, error);
      return company.employees?.length || 0;
    }
  };

  // Calculate analytics data
  const totalEmployees = companies.reduce((sum, company) => sum + getCompanyEmployeeCount(company), 0);

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart3 size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
          Analytics Dashboard
        </h1>

        <button
          onClick={() => {
            console.log('All companies data:', companies);

            // Log detailed employee counts for each company
            companies.forEach(company => {
              console.log(`Company: ${company.name}`);

              // Log base employee count
              console.log(`  Base employees array length: ${company.employees?.length || 0}`);

              // Log monthly data
              if (company.monthlyData) {
                Object.entries(company.monthlyData).forEach(([month, data]) => {
                  console.log(`  Month: ${month}`);

                  // Log summary if available
                  if (data.summary) {
                    console.log(`    Summary total employees: ${data.summary.total_employees || 'N/A'}`);
                  }

                  // Log companies data
                  if (data.companies) {
                    data.companies.forEach((comp, i) => {
                      console.log(`    Company ${i+1}: ${comp.name || 'Unnamed'}`);
                      console.log(`      Employees: ${comp.employees?.length || 0}`);
                    });
                  }
                });
              }

              // Log calculated employee count
              console.log(`  Calculated employee count: ${getCompanyEmployeeCount(company)}`);
              console.log('---');
            });
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
        >
          Debug Data Structure
        </button>
      </div>

      {/* Work in Progress Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-md dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-bold">Work in Progress</p>
            <p className="text-sm">The analytics feature is currently under development. Some data may not be displayed correctly.</p>
          </div>
        </div>
      </div>

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
                      {getCompanyEmployeeCount(company)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${totalEmployees > 0 ? (getCompanyEmployeeCount(company) / totalEmployees) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500 dark:text-gray-300">
                          {totalEmployees > 0 ? Math.round((getCompanyEmployeeCount(company) / totalEmployees) * 100) : 0}%
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
