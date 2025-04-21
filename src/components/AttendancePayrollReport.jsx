import { useState, useEffect } from 'react';
import { Download, Search, Filter, Eye, FileText, Calendar } from 'lucide-react';
import { getPayrollEntries, getEmployees } from '../services/attendancePayrollApi';

const AttendancePayrollReport = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Fetch payroll data and employees
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employees
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Fetch payroll data for the selected month
        const payrollEntries = await getPayrollEntries(selectedEmployee || null, selectedMonth);
        setPayrollData(payrollEntries);
        setFilteredData(payrollEntries);
      } catch (err) {
        setError(err.detail || err.message || 'Failed to fetch payroll data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedEmployee]);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(payrollData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = payrollData.filter(entry => 
        entry.name.toLowerCase().includes(query) || 
        entry.employee_id.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, payrollData]);

  // Calculate summary statistics
  const calculateSummary = (data) => {
    return {
      totalEmployees: data.length,
      totalDaysWorked: data.reduce((sum, entry) => sum + entry.days_worked, 0),
      totalOTHours: data.reduce((sum, entry) => sum + entry.ot_hours, 0),
      totalGrossSalary: data.reduce((sum, entry) => sum + entry.gross_salary, 0),
      totalDeductions: data.reduce((sum, entry) => sum + entry.deduction_total, 0),
      totalNetSalary: data.reduce((sum, entry) => sum + entry.net_salary, 0),
      totalCTC: data.reduce((sum, entry) => sum + entry.ctc, 0),
      averageSalary: data.length > 0 ? data.reduce((sum, entry) => sum + entry.net_salary, 0) / data.length : 0
    };
  };

  // Export to Excel
  const exportToExcel = () => {
    // Implementation would require a library like xlsx
    alert('Export to Excel functionality would be implemented here');
  };

  // Calculate summary for the filtered data
  const summary = calculateSummary(filteredData);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Attendance-Based Payroll Report</h2>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Month</label>
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.employee_id}>
                  {employee.name} ({employee.employee_id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Employees</h3>
          <p className="text-2xl font-semibold">{summary.totalEmployees}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Days Worked</h3>
          <p className="text-2xl font-semibold">{summary.totalDaysWorked}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Net Salary</h3>
          <p className="text-2xl font-semibold">₹{summary.totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total CTC</h3>
          <p className="text-2xl font-semibold">₹{summary.totalCTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="text-lg font-medium mb-3">Detailed Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-500">Gross Salary</p>
            <p className="text-lg font-medium">₹{summary.totalGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-500">Total Deductions</p>
            <p className="text-lg font-medium">₹{summary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-500">Average Salary</p>
            <p className="text-lg font-medium">₹{summary.averageSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-500">Total OT Hours</p>
            <p className="text-lg font-medium">{summary.totalOTHours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading payroll data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
          <p>No payroll data found for the selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((entry, index) => (
                <tr key={entry.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.employee_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.days_worked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.ot_hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.basic.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.gross_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.deduction_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.ctc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900" title="View Details">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="Generate Slip">
                        <FileText className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePayrollReport;
