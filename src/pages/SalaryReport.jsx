import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, CheckCircle, Calendar, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useActivity } from '../context/ActivityContext';
import * as XLSX from 'xlsx';

const SalaryReport = () => {
  const { user, verifyPassword } = useAuth();
  const { uploadedData } = useCompany();
  const { logActivity } = useActivity();

  const [searchTerm, setSearchTerm] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Use the uploaded data from the company context
  const effectiveData = uploadedData;

  // Get company ID for storing paid employees data
  const companyId = user?.companyId || 'default';

  // For debugging
  useEffect(() => {
    console.log('SalaryReport - User:', user);
    console.log('SalaryReport - Company ID:', companyId);
    console.log('SalaryReport - Uploaded Data:', uploadedData);
  }, [user, companyId, uploadedData]);

  const [paidEmployees, setPaidEmployees] = useState({});

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

      if (effectiveData && effectiveData.companies) {
        // Check if the effectiveData has a month property
        if (effectiveData.month) {
          dataMonths.add(effectiveData.month);
        }

        // Check each company's employees for month information
        effectiveData.companies.forEach(company => {
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
      // Try to get the month from localStorage or effectiveData
      const lastUploadMonth = localStorage.getItem(`lastUploadMonth_${companyId}`);
      const dataMonth = effectiveData?.month;

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
  }, [effectiveData, companyId]);

  // Update paidEmployees when companyId changes
  useEffect(() => {
    if (companyId) {
      console.log(`Loading paid employees data for company: ${companyId}`);
      // Load paid employees from localStorage with company and month information
      const savedPaidEmployees = localStorage.getItem(`paidEmployees_${companyId}`);
      if (savedPaidEmployees) {
        try {
          const parsedData = JSON.parse(savedPaidEmployees);
          console.log('Loaded paid employees data:', parsedData);

          // Ensure the structure is correct (an object with arrays)
          const validatedData = {};
          Object.keys(parsedData).forEach(month => {
            // Ensure each month has an array of employee IDs
            if (Array.isArray(parsedData[month])) {
              validatedData[month] = parsedData[month];
            } else {
              console.warn(`Invalid data structure for month ${month}, resetting to empty array`);
              validatedData[month] = [];
            }
          });

          setPaidEmployees(validatedData);
        } catch (error) {
          console.error('Error parsing paid employees data:', error);
          setPaidEmployees({});
        }
      } else {
        console.log('No paid employees data found for this company');
        setPaidEmployees({});
      }
    }
  }, [companyId]);

  // Add a listener for localStorage changes to update paidEmployees
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `paidEmployees_${companyId}`) {
        console.log('localStorage changed, updating paidEmployees');
        try {
          const newData = JSON.parse(e.newValue);
          setPaidEmployees(newData || {});
        } catch (error) {
          console.error('Error parsing updated paid employees data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [companyId]);

  // Convert data to salary reports format
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
                // Get the employee ID - ensure it's not empty
                let employeeId = emp.employee_id || emp.id || '';

                // Check if this employee is marked as paid for this specific month
                // Use a more defensive approach to check if the employee is paid
                let isPaid = false;
                try {
                  // First check if the paidEmployees object and the month array exist
                  if (paidEmployees &&
                      typeof paidEmployees === 'object' &&
                      month &&
                      paidEmployees[month]) {

                    // Make sure the month entry is an array
                    const monthArray = Array.isArray(paidEmployees[month]) ?
                      paidEmployees[month] :
                      [];

                    // Check if the employee ID is in the array
                    if (employeeId && monthArray.includes(employeeId)) {
                      isPaid = true;
                      console.log(`Employee ${employeeId} is marked as paid for ${month}`);
                    }
                  }
                } catch (error) {
                  console.error('Error checking paid status:', error);
                }

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
          // Get the employee ID - ensure it's not empty
          let employeeId = emp.employee_id || emp.id || '';

          // Get the employee's month (or use the company/data month, or 'Unknown')
          const employeeMonth = emp.month || company.month || data.month || 'Unknown';

          // Check if this employee is marked as paid for this specific month
          // Use a more defensive approach to check if the employee is paid
          let isPaid = false;
          try {
            // First check if the paidEmployees object and the month array exist
            if (paidEmployees &&
                typeof paidEmployees === 'object' &&
                employeeMonth &&
                paidEmployees[employeeMonth]) {

              // Make sure the month entry is an array
              const monthArray = Array.isArray(paidEmployees[employeeMonth]) ?
                paidEmployees[employeeMonth] :
                [];

              // Check if the employee ID is in the array
              if (employeeId && monthArray.includes(employeeId)) {
                isPaid = true;
                console.log(`Employee ${employeeId} is marked as paid for ${employeeMonth} (fallback)`);
              }
            }
          } catch (error) {
            console.error('Error checking paid status:', error);
          }

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

  const salaryReports = convertToSalaryReports(effectiveData);

  // Add debugging for the selected status
  useEffect(() => {
    console.log(`Selected status changed to: ${selectedStatus}`);
  }, [selectedStatus]);

  // Use useMemo to filter reports only when dependencies change
  const filteredReports = useMemo(() => {
    console.log('Filtering reports with status:', selectedStatus);
    let result = [];

    try {
      // Make a safe copy of salary reports
      const safeReports = Array.isArray(salaryReports) ? salaryReports : [];

      // Apply all filters at once
      result = safeReports.filter(report => {
        // Skip null/undefined reports
        if (!report) return false;

        // Month filter
        const monthMatch = !selectedMonth || report.month === selectedMonth;

        // Search filter
        let searchMatch = true;
        if (searchTerm) {
          const name = String(report.name || '').toLowerCase();
          const id = String(report.id || '').toLowerCase();
          const term = searchTerm.toLowerCase();
          searchMatch = name.includes(term) || id.includes(term);
        }

        // Status filter
        let statusMatch = true;
        if (selectedStatus !== 'All') {
          if (selectedStatus === 'Paid') {
            statusMatch = report.status === 'Paid';
          } else if (selectedStatus === 'Unpaid') {
            statusMatch = report.status !== 'Paid';
          }
        }

        return monthMatch && searchMatch && statusMatch;
      });

      console.log(`Filtered to ${result.length} reports with status: ${selectedStatus}`);
    } catch (error) {
      console.error('Error in filtering reports:', error);
      // Return empty array if there's an error
      result = [];
    }

    return result;
  }, [salaryReports, selectedMonth, selectedStatus, searchTerm]);

  const handlePaymentConfirm = () => {
    if (selectedEmployee) {
      try {
        // Safely get month and status
        const month = selectedEmployee.month || 'Unknown';
        const isCurrentlyPaid = selectedEmployee.status === "Paid";
        const employeeId = selectedEmployee.id;

        // Make sure we have a valid employee ID
        if (!employeeId) {
          console.error('Missing employee ID in handlePaymentConfirm');
          setShowModal(false);
          return;
        }

        // Create a copy of the current paid employees object
        const updatedPaidEmployees = { ...paidEmployees };

        // Initialize the array for this month if it doesn't exist
        if (!updatedPaidEmployees[month]) {
          updatedPaidEmployees[month] = [];
        }

        if (isCurrentlyPaid) {
          // If currently paid, remove from the paid list (mark as unpaid)
          updatedPaidEmployees[month] = updatedPaidEmployees[month].filter(id => id !== employeeId);
          console.log(`Marking employee ${employeeId} as unpaid for month ${month}`);

          // Log the activity if the activity logger is available
          if (logActivity) {
            try {
              logActivity('MARK_UNPAID', {
                employeeId,
                employeeName: selectedEmployee.name,
                month,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error logging activity:', error);
              // Continue even if activity logging fails
            }
          }
        } else {
          // If currently unpaid, add to the paid list (mark as paid)
          if (!updatedPaidEmployees[month].includes(employeeId)) {
            updatedPaidEmployees[month].push(employeeId);
          }
          console.log(`Marking employee ${employeeId} as paid for month ${month}`);

          // Log the activity if the activity logger is available
          if (logActivity) {
            try {
              logActivity('MARK_PAID', {
                employeeId,
                employeeName: selectedEmployee.name,
                month,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error logging activity:', error);
              // Continue even if activity logging fails
            }
          }
        }

        // Update localStorage first
        localStorage.setItem(`paidEmployees_${companyId}`, JSON.stringify(updatedPaidEmployees));

        // Then update state
        setPaidEmployees(updatedPaidEmployees);

        // Reset the status filter to "All" to avoid blank screen issues
        setSelectedStatus('All');

      } catch (error) {
        console.error('Error in handlePaymentConfirm:', error);
        alert('An error occurred while updating payment status. Please try again.');
      } finally {
        setShowModal(false);
      }
    }
  };

  const handleTogglePaymentStatus = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Function to export salary data to Excel
  const handleExportToExcel = () => {
    // Check if we have data to export
    if (filteredReports.length === 0) {
      alert('No data to export. Please upload salary data first.');
      return;
    }

    // Prepare data for export
    const exportData = filteredReports.map(report => ({
      'Employee ID': report.id,
      'Name': report.name,
      'Month': report.month || 'Unknown',
      'Daily Rate (₹)': report.daily_salary,
      'Attendance Days': report.attendance_days,
      'Monthly Salary (₹)': report.monthly_salary,
      'VDA (₹)': report.vda,
      'Total-B (₹)': report.total_b,
      'Deductions (₹)': report.deduction_total,
      'Net Salary (₹)': report.net_salary,
      'Status': report.status
    }));

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Report');

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const fileName = `Salary_Report_${selectedMonth ? selectedMonth.replace(' ', '_') : dateStr}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);

    // Log the activity if the activity logger is available
    if (logActivity) {
      try {
        logActivity('GENERATE_REPORT', {
          reportType: 'Salary Report',
          month: selectedMonth || 'All Months',
          employeeCount: filteredReports.length,
          fileName,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error logging activity:', error);
        // Continue even if activity logging fails
      }
    }

    // Show success message
    alert(`Salary report exported successfully as ${fileName}`);
  };

  // Function to toggle payment status for all currently filtered employees
  const handleMarkAllAsPaid = () => {
    if (!selectedMonth || filteredReports.length === 0) {
      alert('Please select a month and ensure there are employees to update.');
      return;
    }

    try {
      // Create a copy of the current paid employees object
      const updatedPaidEmployees = { ...paidEmployees };

      // Initialize the array for this month if it doesn't exist
      if (!updatedPaidEmployees[selectedMonth]) {
        updatedPaidEmployees[selectedMonth] = [];
      }

      // If we're viewing paid employees, mark all as unpaid
      if (selectedStatus === 'Paid') {
        // Get all employee IDs from filtered reports
        const employeeIdsToRemove = filteredReports
          .filter(emp => emp && emp.id)
          .map(emp => emp.id);

        // Remove these IDs from the paid list
        updatedPaidEmployees[selectedMonth] = updatedPaidEmployees[selectedMonth]
          .filter(id => !employeeIdsToRemove.includes(id));

        // Update state and localStorage
        setPaidEmployees(updatedPaidEmployees);
        localStorage.setItem(`paidEmployees_${companyId}`, JSON.stringify(updatedPaidEmployees));

        // Reset the status filter to "All" to avoid blank screen issues
        setSelectedStatus('All');

        // Show success message
        alert(`Successfully marked ${employeeIdsToRemove.length} employees as unpaid for ${selectedMonth}.`);
      }
      // Otherwise, mark all as paid
      else {
        // Get all employee IDs from filtered reports
        const employeeIdsToAdd = [];

        filteredReports.forEach(report => {
          if (report && report.id && !updatedPaidEmployees[selectedMonth].includes(report.id)) {
            employeeIdsToAdd.push(report.id);
            updatedPaidEmployees[selectedMonth].push(report.id);
          }
        });

        // Update state and localStorage
        setPaidEmployees(updatedPaidEmployees);
        localStorage.setItem(`paidEmployees_${companyId}`, JSON.stringify(updatedPaidEmployees));

        // Reset the status filter to "All" to avoid blank screen issues
        setSelectedStatus('All');

        // Show success message
        alert(`Successfully marked ${employeeIdsToAdd.length} employees as paid for ${selectedMonth}.`);
      }

    } catch (error) {
      console.error('Error in handleMarkAllAsPaid:', error);
      alert('An error occurred while updating payment status. Please try again.');
    }
  };

  // Function to delete all salary report data for this company
  const handleDeleteAllData = () => {
    setDeletePassword("");
    setDeleteError("");
    setDeleteSuccess("");
    setDeleteConfirm(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteError("");
    if (!verifyPassword(deletePassword)) {
      setDeleteError("Incorrect password.");
      return;
    }
    if (!deleteConfirm) {
      setDeleteError("Please confirm deletion by checking the box.");
      return;
    }
    // Delete data from localStorage
    localStorage.removeItem(`uploadedData_${companyId}`);
    localStorage.removeItem(`paidEmployees_${companyId}`);
    localStorage.removeItem(`lastUploadMonth_${companyId}`);
    localStorage.removeItem(`lastUploadTime_${companyId}`);
    // Optionally clear more keys if needed
    setDeleteSuccess("All salary report data deleted successfully.");
    setDeleteError("");
    // Optionally, reset state or reload page
    window.location.reload();
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
            disabled={!selectedMonth || filteredReports.length === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              !selectedMonth || filteredReports.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : selectedStatus === 'Paid'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {selectedStatus === 'Paid' ? (
              <>
                <XCircle size={18} className="mr-2" />
                Mark All as Unpaid
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Mark All as Paid
              </>
            )}
          </button>

          <button
            onClick={handleExportToExcel}
            disabled={filteredReports.length === 0}
            className={`flex items-center px-4 py-2 rounded-md ${filteredReports.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'}`}
          >
            <Download size={18} className="mr-2" />
            Export to Excel
          </button>

          {/* Delete All Data Button (only for company/admin users) */}
          {(user?.role === 'company' || user?.role === 'admin') && (
            <button
              onClick={handleDeleteAllData}
              className="flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Trash2 size={18} className="mr-2" />
              Delete All Data
            </button>
          )}
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
              {filteredReports && filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={`${report?.id || index}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 dark:text-white">{report?.id || 'N/A'}</td>
                    <td className="px-6 py-4 dark:text-white">{report?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 dark:text-white">{report?.month || 'Unknown'}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.daily_salary || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">{typeof report?.attendance_days === 'number' ? report.attendance_days.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.monthly_salary || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.vda || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.total_b || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.deduction_total || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4 dark:text-white">₹{((report?.net_salary || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {report.status || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePaymentStatus(report)}
                        className={`flex items-center ${
                          report.status === "Paid"
                            ? "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        }`}
                      >
                        {report.status === "Paid" ? (
                          <>
                            <CheckCircle size={16} className="mr-1" />
                            Mark as Unpaid
                          </>
                        ) : (
                          "Mark as Paid"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {selectedStatus !== 'All' ? (
                      <div>
                        <p className="mb-4">No {selectedStatus} employees found for the selected filters.</p>
                        <button
                          onClick={() => setSelectedStatus('All')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                          Show All Employees
                        </button>
                      </div>
                    ) : selectedMonth ? (
                      `No salary data available for ${selectedMonth}. Please upload an Excel file for this month.`
                    ) : (
                      `No salary data available. Please upload an Excel file.`
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Status Toggle Confirmation Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full dark:text-white">
            <h3 className="text-lg font-medium mb-4">
              {selectedEmployee?.status === "Paid" ? "Mark as Unpaid" : "Confirm Payment"}
            </h3>

            {selectedEmployee?.status === "Paid" ? (
              <p className="mb-2">Are you sure you want to mark <strong>{selectedEmployee?.name || 'this employee'}</strong> as unpaid?</p>
            ) : (
              <p className="mb-2">Are you sure you want to mark the payment for <strong>{selectedEmployee?.name || 'this employee'}</strong> as completed?</p>
            )}

            <p className="mb-2">Month: <strong>{selectedEmployee?.month || 'Unknown'}</strong></p>
            <p className="mb-2">Attendance: <strong>
              {typeof selectedEmployee?.attendance_days === 'number'
                ? selectedEmployee.attendance_days.toFixed(2)
                : '0.00'} days
            </strong></p>
            <p className="mb-6">Amount: <strong>₹{(
              selectedEmployee?.net_salary || 0
            ).toLocaleString()}</strong></p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className={`px-4 py-2 text-white rounded-md ${
                  selectedEmployee?.status === "Paid"
                    ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                }`}
              >
                {selectedEmployee?.status === "Paid" ? "Mark as Unpaid" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Data Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full dark:text-white">
            <h3 className="text-lg font-medium mb-4 text-red-600">Delete All Salary Report Data</h3>
            {deleteSuccess ? (
              <div className="mb-4 text-green-600">{deleteSuccess}</div>
            ) : (
              <>
                <p className="mb-2">This will permanently delete <strong>all salary report data</strong> for this company. This action cannot be undone.</p>
                <p className="mb-4 text-red-500">Are you sure you want to continue?</p>
                <label className="block mb-2 font-medium">Enter your password to confirm:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full mb-2 dark:bg-gray-700 dark:text-white"
                  placeholder="Password"
                />
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="delete-confirm"
                    checked={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="delete-confirm" className="text-sm">Yes, I am sure I want to delete all data.</label>
                </div>
                {deleteError && <div className="mb-2 text-red-600">{deleteError}</div>}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    Delete All Data
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;
