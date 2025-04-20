import React, { useState, useEffect } from 'react';
import { BarChart3, ArrowUp, ArrowDown, Users, DollarSign, Calendar } from 'lucide-react';

const Dashboard = ({ uploadedData, setUploadedData }) => {
  // State to store previous month's data for comparison
  const [prevMonthData, setPrevMonthData] = useState({
    totalEmployees: 0,
    totalSalary: 0,
    avgSalary: 0
  });

  // State to store percentage changes
  const [percentChanges, setPercentChanges] = useState({
    employees: 0,
    salary: 0,
    avgSalary: 0
  });

  // Get current month and previous month
  const getCurrentAndPrevMonth = () => {
    const date = new Date();
    const currentMonth = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} ${date.getFullYear()}`;

    // Get previous month
    date.setMonth(date.getMonth() - 1);
    const prevMonth = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} ${date.getFullYear()}`;

    return { currentMonth, prevMonth };
  };

  // Calculate summary data for current month
  const totalEmployees = uploadedData?.companies?.reduce((sum, company) =>
    sum + company.employees.length, 0) || 0;

  const totalSalary = uploadedData?.companies?.reduce((sum, company) =>
    sum + company.summary.total_salary, 0) || 0;

  const avgSalary = totalEmployees ? Math.round(totalSalary / totalEmployees) : 0;

  const recentEmployees = uploadedData?.companies?.flatMap(company =>
    company.employees.slice(0, 5).map(emp => ({...emp, company: company.name}))
  )?.slice(0, 5) || [];

  // Helper function to add test data for March 2025 (TEMPORARY - to be removed after testing)
  const addTestDataForMarch = () => {
    // Check if we already have April data (current month) but no March data
    const { currentMonth, prevMonth } = getCurrentAndPrevMonth();

    if (uploadedData?.monthlyData &&
        uploadedData.monthlyData[currentMonth] &&
        !uploadedData.monthlyData['March 2025'] &&
        window.location.search.includes('test=true')) {

      console.log('Adding test data for March 2025');

      // Create a copy of the current data
      const newData = { ...uploadedData };

      // Create March data with slightly different values for testing percentage changes
      const marchData = JSON.parse(JSON.stringify(uploadedData.monthlyData[currentMonth]));

      // Modify employee count and salaries to test percentage changes
      if (marchData && marchData.companies) {
        // Remove some employees to show an increase in April
        marchData.companies.forEach(company => {
          if (company.employees.length > 3) {
            // Remove approximately 10% of employees
            const removeCount = Math.max(1, Math.floor(company.employees.length * 0.1));
            company.employees = company.employees.slice(0, company.employees.length - removeCount);
          }

          // Reduce salaries by about 5%
          company.employees.forEach(emp => {
            emp.net_salary = Math.round(emp.net_salary * 0.95);
            emp.monthly_salary = Math.round(emp.monthly_salary * 0.95);
            emp.month = 'March 2025';
          });

          // Update company summary
          company.summary.total_salary = company.employees.reduce((sum, emp) => sum + emp.net_salary, 0);
        });

        // Update total summary
        marchData.summary = {
          total_companies: marchData.companies.length,
          total_employees: marchData.companies.reduce((sum, company) => sum + company.employees.length, 0),
          total_salary: marchData.companies.reduce((sum, company) => sum + company.summary.total_salary, 0),
          total_overtime_hours: 0
        };
      }

      // Add March data to the monthlyData
      newData.monthlyData['March 2025'] = marchData;

      // Update the state (but don't save to localStorage to avoid persisting test data)
      setUploadedData(newData);
      return true;
    }
    return false;
  };

  // Calculate percentage changes when data changes
  useEffect(() => {
    // Try to add test data for March 2025
    const addedTestData = addTestDataForMarch();

    // Get current and previous month
    const { currentMonth, prevMonth } = getCurrentAndPrevMonth();

    // For testing, use March 2025 as the previous month if available
    const testPrevMonth = 'March 2025';

    // Debug information
    console.log('Available months:', uploadedData?.monthlyData ? Object.keys(uploadedData.monthlyData) : 'No monthly data');
    console.log('Current month:', currentMonth);
    console.log('Previous month:', prevMonth);
    console.log('Test month:', testPrevMonth);

    // Check if we have monthly data structure
    if (uploadedData?.monthlyData && Object.keys(uploadedData.monthlyData).length > 0) {
      // Find the most recent month in the data (might not be the current month)
      const availableMonths = Object.keys(uploadedData.monthlyData);

      // If we have both March and April data, use them for comparison
      const hasCurrentMonth = availableMonths.includes(currentMonth);
      const hasTestPrevMonth = availableMonths.includes(testPrevMonth);

      // Determine which months to compare
      let currentMonthData, prevMonthData;
      let currentMonthName, prevMonthName;

      if (hasCurrentMonth && hasTestPrevMonth) {
        // We have both months - use them for comparison
        currentMonthData = uploadedData.monthlyData[currentMonth];
        prevMonthData = uploadedData.monthlyData[testPrevMonth];
        currentMonthName = currentMonth;
        prevMonthName = testPrevMonth;
      } else if (availableMonths.length >= 2) {
        // We have at least 2 months - sort them and use the latest two
        const sortedMonths = [...availableMonths].sort((a, b) => {
          // Simple sort for "Month Year" format
          const [aMonth, aYear] = a.split(' ');
          const [bMonth, bYear] = b.split(' ');

          if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);

          const monthOrder = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
          };

          return monthOrder[aMonth] - monthOrder[bMonth];
        });

        // Use the two most recent months
        currentMonthName = sortedMonths[sortedMonths.length - 1];
        prevMonthName = sortedMonths[sortedMonths.length - 2];
        currentMonthData = uploadedData.monthlyData[currentMonthName];
        prevMonthData = uploadedData.monthlyData[prevMonthName];
      } else if (availableMonths.length === 1) {
        // Only one month available - can't calculate changes
        console.log('Only one month available - cannot calculate changes');
        setPercentChanges({ employees: 0, salary: 0, avgSalary: 0 });
        return;
      } else {
        // No months available
        console.log('No months available');
        setPercentChanges({ employees: 0, salary: 0, avgSalary: 0 });
        return;
      }

      console.log(`Comparing ${currentMonthName} with ${prevMonthName}`);

      if (currentMonthData && prevMonthData) {
        // Calculate current month totals
        const currTotalEmployees = currentMonthData.companies?.reduce((sum, company) =>
          sum + company.employees.length, 0) || 0;

        const currTotalSalary = currentMonthData.companies?.reduce((sum, company) =>
          sum + company.summary.total_salary, 0) || 0;

        const currAvgSalary = currTotalEmployees ? Math.round(currTotalSalary / currTotalEmployees) : 0;

        // Calculate previous month totals
        const prevTotalEmployees = prevMonthData.companies?.reduce((sum, company) =>
          sum + company.employees.length, 0) || 0;

        const prevTotalSalary = prevMonthData.companies?.reduce((sum, company) =>
          sum + company.summary.total_salary, 0) || 0;

        const prevAvgSalary = prevTotalEmployees ? Math.round(prevTotalSalary / prevTotalEmployees) : 0;

        console.log('Current month data:', {
          employees: currTotalEmployees,
          salary: currTotalSalary,
          avgSalary: currAvgSalary
        });

        console.log('Previous month data:', {
          employees: prevTotalEmployees,
          salary: prevTotalSalary,
          avgSalary: prevAvgSalary
        });

        // Store previous month data
        setPrevMonthData({
          totalEmployees: prevTotalEmployees,
          totalSalary: prevTotalSalary,
          avgSalary: prevAvgSalary
        });

        // Calculate percentage changes
        const empChange = prevTotalEmployees ? ((currTotalEmployees - prevTotalEmployees) / prevTotalEmployees) * 100 : 0;
        const salaryChange = prevTotalSalary ? ((currTotalSalary - prevTotalSalary) / prevTotalSalary) * 100 : 0;
        const avgSalaryChange = prevAvgSalary ? ((currAvgSalary - prevAvgSalary) / prevAvgSalary) * 100 : 0;

        console.log('Calculated changes:', {
          employees: empChange,
          salary: salaryChange,
          avgSalary: avgSalaryChange
        });

        // Only update if there's an actual change (avoid rounding to 0)
        const minThreshold = 0.05; // Minimum threshold to consider a change

        setPercentChanges({
          employees: Math.abs(empChange) > minThreshold ? parseFloat(empChange.toFixed(1)) : 0,
          salary: Math.abs(salaryChange) > minThreshold ? parseFloat(salaryChange.toFixed(1)) : 0,
          avgSalary: Math.abs(avgSalaryChange) > minThreshold ? parseFloat(avgSalaryChange.toFixed(1)) : 0
        });
      } else {
        // Missing data for one of the months
        console.log('Missing data for one of the comparison months');
        setPercentChanges({ employees: 0, salary: 0, avgSalary: 0 });
      }
    } else {
      // If no monthly data structure, use mock changes for now
      console.log('No monthly data structure - using mock data');
      setPercentChanges({ employees: 4.0, salary: 2.5, avgSalary: -1.2 });
    }
  }, [uploadedData, totalEmployees, totalSalary, avgSalary]);

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <BarChart3 size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        Dashboard Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Employees</p>
              <h2 className="text-3xl font-bold dark:text-white">{totalEmployees}</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full shadow-sm">
              <Users className="text-blue-600 dark:text-blue-400" size={26} />
            </div>
          </div>
          <div className="flex items-center mt-5 text-sm">
            {percentChanges.employees !== 0 && (
              <>
                <div className={`flex items-center ${percentChanges.employees >= 0
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'} rounded-full px-2.5 py-1`}>
                  {percentChanges.employees >= 0
                    ? <ArrowUp className="mr-1" size={14} />
                    : <ArrowDown className="mr-1" size={14} />}
                  <span className="font-medium">{Math.abs(percentChanges.employees)}%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
              </>
            )}
            {percentChanges.employees === 0 && (
              <span className="text-gray-500 dark:text-gray-400">No change from last month</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Salary</p>
              <h2 className="text-3xl font-bold dark:text-white">₹{totalSalary.toLocaleString()}</h2>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-full shadow-sm">
              <DollarSign className="text-green-600 dark:text-green-400" size={26} />
            </div>
          </div>
          <div className="flex items-center mt-5 text-sm">
            {percentChanges.salary !== 0 && (
              <>
                <div className={`flex items-center ${percentChanges.salary >= 0
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'} rounded-full px-2.5 py-1`}>
                  {percentChanges.salary >= 0
                    ? <ArrowUp className="mr-1" size={14} />
                    : <ArrowDown className="mr-1" size={14} />}
                  <span className="font-medium">{Math.abs(percentChanges.salary)}%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
              </>
            )}
            {percentChanges.salary === 0 && (
              <span className="text-gray-500 dark:text-gray-400">No change from last month</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Average Salary</p>
              <h2 className="text-3xl font-bold dark:text-white">
                ₹{avgSalary.toLocaleString()}
              </h2>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3.5 rounded-full shadow-sm">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={26} />
            </div>
          </div>
          <div className="flex items-center mt-5 text-sm">
            {percentChanges.avgSalary !== 0 && (
              <>
                <div className={`flex items-center ${percentChanges.avgSalary >= 0
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'} rounded-full px-2.5 py-1`}>
                  {percentChanges.avgSalary >= 0
                    ? <ArrowUp className="mr-1" size={14} />
                    : <ArrowDown className="mr-1" size={14} />}
                  <span className="font-medium">{Math.abs(percentChanges.avgSalary)}%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
              </>
            )}
            {percentChanges.avgSalary === 0 && (
              <span className="text-gray-500 dark:text-gray-400">No change from last month</span>
            )}
          </div>
        </div>


      </div>

      {/* Recent Employees */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <Users size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Recent Employees
          </h2>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee Name
                </th>

                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-1 px-2.5 rounded-md font-medium">{employee.employee_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <span className="text-green-600 dark:text-green-400">₹{employee.net_salary?.toLocaleString() || 0}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">No employee data available</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Upload an Excel file to see employee data here</p>
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

export default Dashboard;
