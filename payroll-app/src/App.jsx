import { useState, useEffect, useMemo } from 'react';
import { User, Settings, FileText, BarChart3, Upload, ChevronRight, ChevronLeft, Menu, X, Download, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { uploadExcelFile, clearDatabase } from './services/api';

// Component definitions
const DashboardPage = ({ salaryReports, onNavigate }) => {
  // Calculate summary metrics
  const totalEmployees = salaryReports.length;
  const totalSalary = salaryReports.reduce((sum, report) => sum + (report.net_salary || report.totalPay || 0), 0);
  const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
  const paidEmployees = salaryReports.filter(report => report.status === 'Paid').length;
  const unpaidEmployees = totalEmployees - paidEmployees;

  // Get recent employees (last 5)
  const recentEmployees = [...salaryReports]
    .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Payroll Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onNavigate && onNavigate('upload')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </button>
          <button
            onClick={() => onNavigate && onNavigate('salary-report')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-blue-600 font-medium">{Math.round((totalEmployees / 100) * 100)}%</span> of target
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Salary</p>
              <p className="text-2xl font-bold">₹{totalSalary.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-medium">+5.2%</span> from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Salary</p>
              <p className="text-2xl font-bold">₹{averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-yellow-600 font-medium">+2.3%</span> from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <p className="text-2xl font-bold">{paidEmployees}/{totalEmployees}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-purple-600 font-medium">{totalEmployees > 0 ? Math.round((paidEmployees / totalEmployees) * 100) : 0}%</span> payments completed
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Employees</h3>
            <button
              onClick={() => onNavigate && onNavigate('salary-report')}
              className="text-indigo-600 text-sm hover:text-indigo-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">NAME</th>
                  <th className="pb-3 pr-4">SALARY</th>
                  <th className="pb-3 pr-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.length > 0 ? (
                  recentEmployees.map((employee, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">{employee.id || employee.employee_id}</td>
                      <td className="py-3 pr-4">{employee.name}</td>
                      <td className="py-3 pr-4">₹{(employee.net_salary || employee.totalPay || 0).toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${employee.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {employee.status || 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No employee data available. Upload an Excel file to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Instructions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate && onNavigate('upload')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Upload Excel File</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('salary-report')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <span>View Salary Reports</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Configure Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-blue-600 font-bold">1</div>
                </div>
                <div>
                  <p className="font-medium">Upload Excel File</p>
                  <p className="text-sm text-gray-500">Upload your Excel file with employee data.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-blue-600 font-bold">2</div>
                </div>
                <div>
                  <p className="font-medium">Process Data</p>
                  <p className="text-sm text-gray-500">The system will automatically process the data.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-blue-600 font-bold">3</div>
                </div>
                <div>
                  <p className="font-medium">View Reports</p>
                  <p className="text-sm text-gray-500">Access the salary reports for all employees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadExcelPage = ({ onDataUploaded }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        setIsUploading(true);
        const result = await clearDatabase();

        // Also clear localStorage to ensure data is completely removed
        localStorage.removeItem('payrollUploadedData');

        alert('Database cleared successfully!');

        // Reload the page to ensure the UI is updated
        window.location.reload();
        console.log('Database cleared:', result);
      } catch (err) {
        console.error('Error clearing database:', err);
        alert('Error clearing database: ' + (err.message || 'Unknown error'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('Uploading file:', file.name);

      // Upload the file to the server
      const result = await uploadExcelFile(file);
      console.log('Upload successful:', result);

      // Reset the file input
      setFile(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }

      // Make sure we have a valid result object
      if (!result || !result.companies) {
        throw new Error('Invalid response from server. Expected companies data.');
      }

      // Check if we got actual data or just dummy data
      const hasRealData = result.companies.some(company =>
        company.employees && company.employees.some(emp =>
          emp.employee_id &&
          !emp.employee_id.includes('DUMMY') &&
          !emp.employee_id.includes('SAMPLE')
        )
      );

      // Count real employees
      const totalEmployees = result.companies.reduce((count, company) => {
        if (!company.employees) return count;
        return count + company.employees.filter(emp =>
          emp.employee_id &&
          !emp.employee_id.includes('DUMMY') &&
          !emp.employee_id.includes('SAMPLE')
        ).length;
      }, 0);

      // Call the callback to update the data in the parent component
      if (onDataUploaded) {
        onDataUploaded(result);
      }

      if (hasRealData) {
        alert(`File uploaded successfully! Data has been processed and added to the February 2025 salary report.\n\nEmployees processed: ${totalEmployees}\n\nPlease go to the Salary Report tab and select February 2025 to view the data.`);
      } else {
        alert('File uploaded, but no valid employee data was found. Please check your Excel file format.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Display more detailed error message
      if (err.details) {
        setError(err.details);
      } else {
        setError(err.message || 'An unknown error occurred during upload');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8">Upload Excel</h2>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg mb-2">Drop your Excel file here</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload Excel file (.xlsx or .xls)
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700 transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Browse Files
            </label>
            {file && (
              <div className="mt-2 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {file.name}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className={`mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}

            {!file && isUploading && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Please check that your Excel file follows the required format with data in the correct column numbers
              as shown below. Make sure employee IDs start with GO to be processed correctly.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearDatabase}
            disabled={isUploading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Database
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload your Excel file with the following columns:
            <br />
            Column 1: Employee ID, Column 2: Name, Column 3: Attendance, Column 4: Daily Salary
            <br />
            Optional columns: Column 5: Daily Allowance, Column 6: NH/FH days, Column 7: OT days
            <br />
            Column 8: Uniform Deduction, Column 9: Professional Tax (PT)
            <br />
            Column 10: LWF40 (boolean), Column 11: LWF60 (boolean)
            <br />
            <small>Empty cells in optional columns will be treated as 0. Salary will be calculated using the detailed formulas including VDA, PL, Bonus, ESI, PF, etc.</small>
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full
              ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Submit'}
          </button>

          <div className="flex items-center justify-between">
            <div className="h-px bg-gray-300 flex-grow"></div>
            <span className="px-4 text-sm text-gray-500">Database Actions</span>
            <div className="h-px bg-gray-300 flex-grow"></div>
          </div>

          <button
            onClick={handleClearDatabase}
            disabled={isUploading}
            className={`bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors w-full flex items-center justify-center
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Database
          </button>
        </div>
      </div>
    </div>
  );
};

// EmployeeHoursPage component removed as it's not needed in the simplified workflow

const SalaryReportPage = ({ salaryReports: initialReports, onUpdateReports }) => {
  const [salaryReports, setSalaryReports] = useState(initialReports);
  const [selectedMonth, setSelectedMonth] = useState('February 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Update local reports when initialReports changes
  useEffect(() => {
    setSalaryReports(initialReports);
  }, [initialReports]);

  // Filter reports by selected month, search query, status, and deduplicate by ID
  const filteredReports = useMemo(() => {
    // First filter by month
    const monthReports = salaryReports.filter(report => report.month === selectedMonth);

    // Then deduplicate by ID
    const uniqueReports = [];
    const seen = new Set();

    monthReports.forEach(report => {
      const employeeId = report.id || report.employee_id || '';
      if (employeeId) {
        const key = `${employeeId}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueReports.push(report);
        }
      }
    });

    // Filter by status if not 'all'
    let statusFiltered = uniqueReports;
    if (statusFilter !== 'all') {
      const isPaid = statusFilter === 'paid';
      statusFiltered = uniqueReports.filter(report =>
        (report.status === 'Paid') === isPaid
      );
    }

    // Filter by search query
    if (searchQuery.trim() === '') {
      return statusFiltered;
    }

    const query = searchQuery.toLowerCase();
    return statusFiltered.filter(report =>
      (report.id || '').toLowerCase().includes(query) ||
      (report.name || '').toLowerCase().includes(query)
    );
  }, [salaryReports, selectedMonth, searchQuery, statusFilter]);

  // Count unpaid employees
  const unpaidCount = filteredReports.filter(report => report.status !== 'Paid').length;

  // Sort the filtered reports
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      let aValue, bValue;

      // Handle different field types
      switch(sortField) {
        case 'id':
          aValue = a.id || a.employee_id || '';
          bValue = b.id || b.employee_id || '';
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'daily_salary':
          aValue = a.daily_salary || a.basic_rate || 0;
          bValue = b.daily_salary || b.basic_rate || 0;
          break;
        case 'attendance':
          aValue = a.attendance_days || 0;
          bValue = b.attendance_days || 0;
          break;
        case 'monthly_salary':
          aValue = a.monthly_salary || a.earned_wage || 0;
          bValue = b.monthly_salary || b.earned_wage || 0;
          break;
        case 'bank_transfer':
          aValue = a.bank_transfer || a.net_salary || a.totalPay || 0;
          bValue = b.bank_transfer || b.net_salary || b.totalPay || 0;
          break;
        case 'status':
          aValue = a.status || 'Unpaid';
          bValue = b.status || 'Unpaid';
          break;
        default:
          aValue = a[sortField] || 0;
          bValue = b[sortField] || 0;
      }

      // Compare based on direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredReports, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Handle mark all as paid
  const handleMarkAllAsPaid = () => {
    if (unpaidCount === 0) {
      alert('All employees are already marked as paid.');
      return;
    }

    if (window.confirm(`Are you sure you want to mark all ${unpaidCount} unpaid employees as paid?`)) {
      // Update all unpaid employees in the current filter
      const updatedReports = salaryReports.map(report => {
        // Only update reports that match the current month and are unpaid
        if (report.month === selectedMonth && report.status !== 'Paid') {
          return { ...report, status: 'Paid' };
        }
        return report;
      });

      // Update the local state
      setSalaryReports(updatedReports);

      // Update the parent component's state if callback provided
      if (onUpdateReports) {
        onUpdateReports(updatedReports);
      }

      // Show confirmation
      alert(`${unpaidCount} employees have been marked as paid.`);
    }
  };

  // Handle confirm payment for a single employee
  const confirmPayment = () => {
    // Get the unique identifier for the employee
    const employeeId = selectedEmployee.id || selectedEmployee.employee_id;

    // Update the status of only the selected employee
    const updatedReports = salaryReports.map(report => {
      const reportId = report.id || report.employee_id;
      if (reportId === employeeId && report.month === selectedMonth) {
        return { ...report, status: 'Paid' };
      }
      return report;
    });

    // Update the local state
    setSalaryReports(updatedReports);

    // Update the parent component's state if callback provided
    if (onUpdateReports) {
      onUpdateReports(updatedReports);
    }

    // Close the modal
    setShowModal(false);
    setSelectedEmployee(null);

    // Show confirmation
    alert(`Payment for ${selectedEmployee.name} has been marked as completed.`);
  };

  // Generate report
  const generateReport = () => {
    alert(`Report generated for ${selectedMonth} with ${filteredReports.length} employees.`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Employees Salary Report</h2>
        <div className="flex space-x-3">
          {unpaidCount > 0 && (
            <button
              onClick={handleMarkAllAsPaid}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Paid ({unpaidCount})
            </button>
          )}
          <button
            onClick={generateReport}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>April 2025</option>
              <option>March 2025</option>
              <option>February 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Search Employee</label>
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Employees Summary for {selectedMonth}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-xl font-semibold">{filteredReports.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Salary</p>
            <p className="text-xl font-semibold">₹{filteredReports.reduce((sum, report) => sum + (report.net_salary || report.totalPay || 0), 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Salary</p>
            <p className="text-xl font-semibold">₹{filteredReports.length > 0 ? (filteredReports.reduce((sum, report) => sum + (report.net_salary || report.totalPay || 0), 0) / filteredReports.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className="text-xl font-semibold">
              <span className="text-green-600">{filteredReports.filter(r => r.status === 'Paid').length}</span> / {filteredReports.length}
            </p>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  EMPLOYEE ID
                  {sortField === 'id' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  NAME
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('daily_salary')}
              >
                <div className="flex items-center">
                  DAILY RATE (₹)
                  {sortField === 'daily_salary' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('attendance')}
              >
                <div className="flex items-center">
                  ATTENDANCE
                  {sortField === 'attendance' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('monthly_salary')}
              >
                <div className="flex items-center">
                  MONTHLY SALARY (₹)
                  {sortField === 'monthly_salary' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3">VDA (₹)</th>
              <th className="px-6 py-3">TOTAL-B (₹)</th>
              <th className="px-6 py-3">DEDUCTIONS (₹)</th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('bank_transfer')}
              >
                <div className="flex items-center">
                  BANK TRANSFER (₹)
                  {sortField === 'bank_transfer' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3">CTC (₹)</th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  PAYMENT STATUS
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.length > 0 ? (
              sortedReports.map((report, index) => (
                <tr key={`${report.id}-${index}`} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{report.id || report.employee_id}</td>
                  <td className="px-6 py-4">{report.name}</td>
                  <td className="px-6 py-4">₹{(report.daily_salary || report.basic_rate || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">{report.attendance_days || 26}</td>
                  <td className="px-6 py-4">₹{(report.monthly_salary || report.earned_wage || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(report.vda || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(report.total_b || report.gross_salary || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(report.deduction_total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(report.bank_transfer || report.net_salary || report.totalPay || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">₹{(report.ctc || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${report.status === 'Paid'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {report.status || 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAsPaid(report)}
                        className={`px-3 py-1 rounded text-sm
                          ${report.status === 'Paid'
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        disabled={report.status === 'Paid'}
                      >
                        Mark as Paid
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Download Salary Slip"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                  No employee salary reports found for {selectedMonth}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Confirmation Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Payment</h3>
            <p className="mb-4">Are you sure you want to mark the payment for <strong>{selectedEmployee.name}</strong> as completed?</p>
            <p className="mb-6">Amount: <strong>₹{(selectedEmployee.bank_transfer || selectedEmployee.net_salary || selectedEmployee.totalPay || 0).toLocaleString()}</strong></p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    vdaRate: 135.32,
    plCalculationFactor: 1.5,
    bonusPercentage: 8.33,
    esiEmployeePercentage: 0.75,
    esiEmployerPercentage: 3.25,
    pfEmployeePercentage: 12,
    pfEmployerPercentage: 13,
    commissionPerDay: 25,
    ppeCostPerDay: 3,
    workingDaysPerMonth: 26
  });

  const [activeTab, setActiveTab] = useState('payroll');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
    }, 1000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        vdaRate: 135.32,
        plCalculationFactor: 1.5,
        bonusPercentage: 8.33,
        esiEmployeePercentage: 0.75,
        esiEmployerPercentage: 3.25,
        pfEmployeePercentage: 12,
        pfEmployerPercentage: 13,
        commissionPerDay: 25,
        ppeCostPerDay: 3,
        workingDaysPerMonth: 26
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        {showSavedMessage && (
          <div className="bg-green-100 text-green-600 px-4 py-2 rounded-md flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Settings saved successfully
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'payroll' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('payroll')}
          >
            Payroll Calculations
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'system' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('system')}
          >
            System Settings
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'backup' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('backup')}
          >
            Backup & Restore
          </button>
        </div>

        {/* Payroll Settings */}
        {activeTab === 'payroll' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Rates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">VDA Rate (₹)</label>
                    <input
                      type="number"
                      name="vdaRate"
                      value={settings.vdaRate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variable Dearness Allowance rate</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">PL Calculation Factor</label>
                    <input
                      type="number"
                      name="plCalculationFactor"
                      value={settings.plCalculationFactor}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in formula: (Daily salary + VDA rate)/30 * Factor</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Bonus Percentage (%)</label>
                    <input
                      type="number"
                      name="bonusPercentage"
                      value={settings.bonusPercentage}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bonus rate: (Daily salary + VDA rate) * Percentage/100</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Working Days Per Month</label>
                    <input
                      type="number"
                      name="workingDaysPerMonth"
                      value={settings.workingDaysPerMonth}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      max="31"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default number of working days in a month</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Deductions & Contributions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">ESI Employee Percentage (%)</label>
                    <input
                      type="number"
                      name="esiEmployeePercentage"
                      value={settings.esiEmployeePercentage}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee's ESI contribution percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">ESI Employer Percentage (%)</label>
                    <input
                      type="number"
                      name="esiEmployerPercentage"
                      value={settings.esiEmployerPercentage}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employer's ESI contribution percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">PF Employee Percentage (%)</label>
                    <input
                      type="number"
                      name="pfEmployeePercentage"
                      value={settings.pfEmployeePercentage}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee's PF contribution percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">PF Employer Percentage (%)</label>
                    <input
                      type="number"
                      name="pfEmployerPercentage"
                      value={settings.pfEmployerPercentage}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employer's PF contribution percentage</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex justify-between">
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">System Configuration</h3>
            <p className="text-gray-500 mb-4">Configure system-wide settings for the payroll application.</p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Enable email notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Send email notifications for payroll processing</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Auto-generate salary slips</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Automatically generate PDF salary slips after processing</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Save calculation logs</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Keep detailed logs of all payroll calculations</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Backup & Restore</h3>
            <p className="text-gray-500 mb-6">Manage your payroll data backups and restore from previous backups.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Create Backup</h4>
                <p className="text-sm text-gray-500 mb-4">Create a backup of all your payroll data</p>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Restore Data</h4>
                <p className="text-sm text-gray-500 mb-4">Restore your data from a previous backup</p>
                <div className="flex items-center">
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-600
                      hover:file:bg-indigo-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Backup History</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Created By</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="text-sm">
                      <td className="px-6 py-4">2023-06-15 09:45 AM</td>
                      <td className="px-6 py-4">2.4 MB</td>
                      <td className="px-6 py-4">Admin</td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Download</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    <tr className="text-sm">
                      <td className="px-6 py-4">2023-05-30 02:30 PM</td>
                      <td className="px-6 py-4">2.3 MB</td>
                      <td className="px-6 py-4">Admin</td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Download</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // State to store uploaded data with localStorage persistence
  const [uploadedData, setUploadedData] = useState(() => {
    // Try to load data from localStorage on initial render
    const savedData = localStorage.getItem('payrollUploadedData');
    return savedData ? JSON.parse(savedData) : null;
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (uploadedData) {
      localStorage.setItem('payrollUploadedData', JSON.stringify(uploadedData));
      console.log('Data saved to localStorage');
    }
  }, [uploadedData]);

  // Sample data removed as it's not needed in the simplified workflow

  // Function to convert uploaded data to salary reports format
  const convertToSalaryReports = (data, month) => {
    if (!data || !data.companies) return [];

    const reports = [];
    data.companies.forEach(company => {
      // Skip dummy companies
      if (company.name.includes('Sample')) {
        return;
      }

      company.employees.forEach(emp => {
        // Skip dummy data
        if (emp.employee_id.includes('DUMMY') || emp.employee_id.includes('SAMPLE')) {
          return;
        }

        // Calculate regular and overtime pay based on settings
        const regularHoursRate = 20; // Default rate from settings
        const overtimeMultiplier = 1.5; // Default multiplier from settings
        // Standard hours per week is 40

        // Use net_salary as the regular pay
        const regularPay = emp.net_salary || 0;
        // Calculate overtime pay if hours are available
        const overtimePay = emp.overtime_hours ? (emp.overtime_hours * regularHoursRate * overtimeMultiplier) : 0;
        const totalPay = regularPay + overtimePay;

        // Only add employees with valid data and ensure IDs start with GO
        if (regularPay > 0 || emp.name) {
          // Get the employee ID, ensure it starts with GO
          let employeeId = emp.employee_id || '';
          if (!employeeId.toString().toUpperCase().startsWith('GO')) {
            employeeId = `GO${Math.floor(1000 + Math.random() * 9000)}`;
          }

          reports.push({
            id: employeeId,
            name: emp.name || 'Unknown Employee',
            company: company.name,  // Use the company name from the sheet
            daily_salary: emp.daily_salary || emp.basic_rate || 0,
            attendance_days: emp.attendance_days || 26,
            vda_rate: emp.vda_rate || 135.32,
            pl: emp.pl || 0,
            bonus_rate: emp.bonus_rate || 0,
            monthly_salary: emp.monthly_salary || emp.earned_wage || 0,
            vda: emp.vda || 0,
            daily_allowance: emp.daily_allowance || 0,
            allowance: emp.allowance || 0,
            bonus: emp.bonus || 0,
            pl_daily_rate: emp.pl_daily_rate || 0,
            nh_fh_days: emp.nh_fh_days || 0,
            nh_fh_amt: emp.nh_fh_amt || 0,
            ot_days: emp.ot_days || 0,
            ot_wages: emp.ot_wages || 0,
            ppe_cost: emp.ppe_cost || 0,
            total_b: emp.total_b || emp.gross_salary || 0,
            basic_rate: emp.basic_rate || emp.daily_salary || 0,
            earned_wage: emp.earned_wage || emp.monthly_salary || 0,
            basic: emp.basic || emp.monthly_salary || 0,
            gross_salary: emp.gross_salary || emp.total_b || 0,
            esi_employee: emp.esi_employee || 0,
            pf_employee: emp.pf_employee || 0,
            uniform_deduction: emp.uniform_deduction || 0,
            pt: emp.pt || 0,
            lwf_employee: emp.lwf_employee || 0,
            deduction_total: emp.deduction_total || 0,
            bank_transfer: emp.bank_transfer || emp.net_salary || 0,
            esi_employer: emp.esi_employer || 0,
            pf_employer: emp.pf_employer || 0,
            commission: emp.commission || 0,
            lwf_employer: emp.lwf_employer || 0,
            ctc: emp.ctc || (emp.commission || 0) + (emp.pf_employer || 0) + (emp.esi_employer || 0) + (emp.total_b || emp.gross_salary || 0) + (emp.lwf_employer || 0),
            net_salary: emp.net_salary || 0,
            regularPay: regularPay,
            overtimePay: overtimePay,
            totalPay: totalPay,
            status: "Unpaid",
            month: month
          });
        }
      });
    });

    return reports;
  };

  // Sample data for different months
  const [salaryReports, setSalaryReports] = useState([
    // April 2025
    { id: "EMP001", name: "John Doe", company: "Finance", regularPay: 32000, overtimePay: 1000, totalPay: 33000, status: "Unpaid", month: "April 2025" },
    { id: "EMP002", name: "Jane Smith", company: "HR", regularPay: 28000, overtimePay: 0, totalPay: 28000, status: "Paid", month: "April 2025" },
    { id: "EMP003", name: "Mike Johnson", company: "IT", regularPay: 35000, overtimePay: 2500, totalPay: 37500, status: "Unpaid", month: "April 2025" },
    { id: "EMP004", name: "Sarah Williams", company: "Marketing", regularPay: 30000, overtimePay: 0, totalPay: 30000, status: "Paid", month: "April 2025" },
    { id: "EMP005", name: "Robert Brown", company: "Operations", regularPay: 40000, overtimePay: 5000, totalPay: 45000, status: "Unpaid", month: "April 2025" },

    // February 2025 - Will be populated from uploaded data
    ...(uploadedData ? convertToSalaryReports(uploadedData, "February 2025") : [])
  ]);

  // Update salary reports when uploaded data changes
  useEffect(() => {
    if (uploadedData) {
      const newReports = [
        // Keep the April data
        ...salaryReports.filter(report => report.month === "April 2025"),
        // Add the February data
        ...convertToSalaryReports(uploadedData, "February 2025")
      ];
      setSalaryReports(newReports);
    }
  }, [uploadedData]);

  // Navigation items - simplified for Golana employees workflow
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'upload', label: 'Upload Excel', icon: <Upload size={20} /> },
    { id: 'salary-report', label: 'Salary Report', icon: <FileText size={20} /> }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage salaryReports={salaryReports} onNavigate={setCurrentPage} />;
      case 'upload':
        return <UploadExcelPage onDataUploaded={setUploadedData} />;
      case 'salary-report':
        return <SalaryReportPage salaryReports={salaryReports} onUpdateReports={setSalaryReports} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage salaryReports={salaryReports} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 hidden md:block`}>
        <div className="flex justify-between items-center p-4 border-b">
          <div className={`font-bold text-lg text-blue-600 ${!sidebarOpen && 'hidden'}`}>PayrollPro</div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <nav className="mt-6">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`flex items-center w-full p-4 ${currentPage === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <div className="flex items-center">
                {item.icon}
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Payroll Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('settings')}
                className={`p-2 rounded-full hover:bg-gray-200 ${currentPage === 'settings' ? 'bg-gray-200' : ''}`}
                title="Settings"
              >
                <Settings size={20} />
              </button>
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
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Settings
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Help & Support
                    </button>
                    <div className="border-t">
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
            <div className="bg-white w-64 h-full overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="font-bold text-lg text-blue-600">PayrollPro</div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-6">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    className={`flex items-center w-full p-4 ${currentPage === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </div>
                  </button>
                ))}
                <button
                  className={`flex items-center w-full p-4 ${currentPage === 'settings' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => {
                    setCurrentPage('settings');
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <Settings size={20} />
                    <span className="ml-3">Settings</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
