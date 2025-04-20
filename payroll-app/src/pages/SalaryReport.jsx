import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, CheckCircle, Calendar } from 'lucide-react';

const SalaryReport = ({ uploadedData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Company filtering removed as the app is for a single company
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paidEmployees, setPaidEmployees] = useState(() => {
    // Load paid employees from localStorage with month information
    const savedPaidEmployees = localStorage.getItem('paidEmployees');
    return savedPaidEmployees ? JSON.parse(savedPaidEmployees) : {};
  });

  // Generate months for the current year and set available months
  useEffect(() => {
    const generateMonths = () => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // Generate all months for the current year
      const monthsList = monthNames.map(month => `${month} ${currentYear}`);

      // Also check if we have data with month information
      const dataMonths = new Set();

      if (uploadedData && uploadedData.companies) {
        // Check if the uploadedData has a month property
        if (uploadedData.month) {
          dataMonths.add(uploadedData.month);
        }

        // Check each company's employees for month information
        uploadedData.companies.forEach(company => {
          if (company.employees) {
            company.employees.forEach(employee => {
              if (employee.month) {
                dataMonths.add(employee.month);
              }
            });
          }
        });
      }

      // Add any months from the data that aren't already in our list
      dataMonths.forEach(month => {
        if (!monthsList.includes(month)) {
          monthsList.push(month);
        }
      });

      return monthsList;
    };

    const months = generateMonths();
    setAvailableMonths(months);

    // Set default selected month
    if (months.length > 0) {
      // Try to get the month from localStorage or uploadedData
      const lastUploadMonth = localStorage.getItem('lastUploadMonth');
      const dataMonth = uploadedData?.month;

      if (lastUploadMonth && months.includes(lastUploadMonth)) {
        setSelectedMonth(lastUploadMonth);
      } else if (dataMonth && months.includes(dataMonth)) {
        setSelectedMonth(dataMonth);
      } else {
        // Default to the current month
        const currentDate = new Date();
        const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
        const currentYear = currentDate.getFullYear();
        const currentMonthYear = `${currentMonthName} ${currentYear}`;

        if (months.includes(currentMonthYear)) {
          setSelectedMonth(currentMonthYear);
        } else {
          setSelectedMonth(months[0]);
        }
      }
    }
  }, [uploadedData]);

  // Company filtering removed as the app is for a single company

  // Convert uploaded data to salary reports format
  const convertToSalaryReports = (data) => {
    if (!data) return [];

    // Check if we have monthly data structure
    if (data.monthlyData && Object.keys(data.monthlyData).length > 0) {
      const reports = [];

      // Process each month's data
      Object.entries(data.monthlyData).forEach(([month, monthData]) => {
        if (monthData && monthData.companies) {
          // Process this month's data and add to reports
          monthData.companies.forEach(company => {
            company.employees.forEach(emp => {
              // Calculate regular pay (monthly salary)
              const regularPay = emp.monthly_salary || emp.net_salary || 0;

              // Only add employees with valid data
              if (regularPay > 0 || emp.name) {
                // Get the employee ID
                let employeeId = emp.employee_id || '';

                // Check if this employee is marked as paid for this specific month
                const isPaid = paidEmployees[month] &&
                              paidEmployees[month].includes(employeeId);

                // Only include employees for the selected month, or all if no month is selected
                if (!selectedMonth || selectedMonth === '' || month === selectedMonth) {
                  reports.push({
                    id: employeeId,
                    name: emp.name || 'Unknown Employee',
                    company: company.name,
                    daily_salary: emp.daily_salary || emp.basic_rate || 0,
                    attendance_days: typeof emp.attendance_days === 'number' ?
                      emp.attendance_days : parseFloat(emp.attendance_days || 26),
                    monthly_salary: emp.monthly_salary || emp.earned_wage || 0,
                    vda: emp.vda || 0,
                    total_b: emp.total_b || emp.gross_salary || 0,
                    deduction_total: emp.deduction_total || 0,
                    net_salary: emp.net_salary || emp.bank_transfer || 0,
                    bank_transfer: emp.bank_transfer || emp.net_salary || 0,
                    status: isPaid ? "Paid" : "Unpaid",
                    month: month
                  });
                }
              }
            });
          });
        }
      });

      return reports;
    }

    // Fallback to old structure if no monthly data
    if (!data.companies) return [];

    const reports = [];

    data.companies.forEach(company => {
      company.employees.forEach(emp => {
        // Calculate regular pay (monthly salary)
        const regularPay = emp.monthly_salary || emp.net_salary || 0;

        // Only add employees with valid data
        if (regularPay > 0 || emp.name) {
          // Get the employee ID
          let employeeId = emp.employee_id || '';

          // Get the employee's month (or use the company/data month, or 'Unknown')
          const employeeMonth = emp.month || company.month || data.month || 'Unknown';

          // Check if this employee is marked as paid for this specific month
          const isPaid = paidEmployees[employeeMonth] &&
                        paidEmployees[employeeMonth].includes(employeeId);

          // Only include employees for the selected month, or all if no month is selected
          if (!selectedMonth || selectedMonth === '' || employeeMonth === selectedMonth) {
            reports.push({
              id: employeeId,
              name: emp.name || 'Unknown Employee',
              company: company.name,
              daily_salary: emp.daily_salary || emp.basic_rate || 0,
              attendance_days: typeof emp.attendance_days === 'number' ?
                emp.attendance_days : parseFloat(emp.attendance_days || 26),
              monthly_salary: emp.monthly_salary || emp.earned_wage || 0,
              vda: emp.vda || 0,
              total_b: emp.total_b || emp.gross_salary || 0,
              deduction_total: emp.deduction_total || 0,
              net_salary: emp.net_salary || emp.bank_transfer || 0,
              bank_transfer: emp.bank_transfer || emp.net_salary || 0,
              status: isPaid ? "Paid" : "Unpaid",
              month: employeeMonth
            });
          }
        }
      });
    });

    return reports;
  };

  const salaryReports = convertToSalaryReports(uploadedData);

  // Filter reports based on search term, selected month, and payment status
  const filteredReports = salaryReports.filter(report => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Company filtering removed as the app is for a single company

    const matchesMonth = !selectedMonth || selectedMonth === '' || report.month === selectedMonth;

    // Filter by payment status
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Paid' && report.status === 'Paid') ||
      (selectedStatus === 'Unpaid' && report.status === 'Unpaid');

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const handlePaymentConfirm = () => {
    if (selectedEmployee) {
      const month = selectedEmployee.month;

      // Create a copy of the current paid employees object
      const updatedPaidEmployees = { ...paidEmployees };

      // Initialize the array for this month if it doesn't exist
      if (!updatedPaidEmployees[month]) {
        updatedPaidEmployees[month] = [];
      }

      // Add the employee ID to the array for this month if not already there
      if (!updatedPaidEmployees[month].includes(selectedEmployee.id)) {
        updatedPaidEmployees[month] = [...updatedPaidEmployees[month], selectedEmployee.id];
      }

      // Update state and localStorage
      setPaidEmployees(updatedPaidEmployees);
      localStorage.setItem('paidEmployees', JSON.stringify(updatedPaidEmployees));
      setShowModal(false);
    }
  };

  const handleMarkAsPaid = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Function to mark all currently filtered employees as paid
  const handleMarkAllAsPaid = () => {
    if (!selectedMonth || filteredReports.length === 0) {
      alert('Please select a month and ensure there are employees to mark as paid.');
      return;
    }

    // Get all unpaid employees from the filtered list
    const unpaidEmployees = filteredReports.filter(emp => emp.status === 'Unpaid');

    if (unpaidEmployees.length === 0) {
      alert('All employees for this month are already marked as paid.');
      return;
    }

    // Create a copy of the current paid employees object
    const updatedPaidEmployees = { ...paidEmployees };

    // Initialize the array for this month if it doesn't exist
    if (!updatedPaidEmployees[selectedMonth]) {
      updatedPaidEmployees[selectedMonth] = [];
    }

    // Add all unpaid employee IDs to the array for this month
    unpaidEmployees.forEach(emp => {
      if (!updatedPaidEmployees[selectedMonth].includes(emp.id)) {
        updatedPaidEmployees[selectedMonth].push(emp.id);
      }
    });

    // Update state and localStorage
    setPaidEmployees(updatedPaidEmployees);
    localStorage.setItem('paidEmployees', JSON.stringify(updatedPaidEmployees));

    // Show success message
    alert(`Successfully marked ${unpaidEmployees.length} employees as paid for ${selectedMonth}.`);
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Salary Report</h1>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
          <div className="flex items-center">
            <Filter size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-300 mr-4">Filters:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:-ml-2">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <Calendar size={16} className="mr-2" />
                Month
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full md:w-56 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Months</option>
                {availableMonths.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <CheckCircle size={16} className="mr-2" />
                Payment Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full md:w-40 dark:bg-gray-700 dark:text-white"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="flex-grow md:max-w-md md:ml-auto">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 w-full dark:bg-gray-700 dark:text-white"
              />
              <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 mt-4">
          <button
            onClick={handleMarkAllAsPaid}
            disabled={!selectedMonth || filteredReports.filter(r => r.status === 'Unpaid').length === 0}
            className={`flex items-center px-4 py-2 rounded-md ${!selectedMonth || filteredReports.filter(r => r.status === 'Unpaid').length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'}`}
          >
            <CheckCircle size={18} className="mr-2" />
            Mark All as Paid
          </button>

          <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
            <Download size={18} className="mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Daily Rate (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attendance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Monthly Salary (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  VDA (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total-B (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Deductions (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net Salary (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={`${report.id}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 dark:text-white">{report.id}</td>
                    <td className="px-6 py-4 dark:text-white">{report.name}</td>
                    <td className="px-6 py-4 dark:text-white">{report.month || 'Unknown'}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.daily_salary).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">{report.attendance_days.toFixed(2)}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.monthly_salary).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.vda).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.total_b).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.deduction_total).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{(report.net_salary).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.status !== "Paid" && (
                        <button
                          onClick={() => handleMarkAsPaid(report)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {report.status === "Paid" && (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle size={16} className="mr-1" />
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {selectedMonth ?
                      `No salary data available for ${selectedMonth}. Please upload an Excel file for this month.` :
                      `No salary data available. Please upload an Excel file.`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full dark:text-white">
            <h3 className="text-lg font-medium mb-4">Confirm Payment</h3>
            <p className="mb-2">Are you sure you want to mark the payment for <strong>{selectedEmployee.name}</strong> as completed?</p>
            <p className="mb-2">Month: <strong>{selectedEmployee.month || 'Unknown'}</strong></p>
            <p className="mb-2">Attendance: <strong>{typeof selectedEmployee.attendance_days === 'number' ? selectedEmployee.attendance_days.toFixed(2) : parseFloat(selectedEmployee.attendance_days || 26).toFixed(2)} days</strong></p>
            <p className="mb-6">Amount: <strong>₹{(selectedEmployee.bank_transfer || selectedEmployee.net_salary || 0).toLocaleString()}</strong></p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;
