import React, { useState } from 'react';
import { Search, Download, Filter, CheckCircle } from 'lucide-react';

const SalaryReport = ({ uploadedData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('Current');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paidEmployees, setPaidEmployees] = useState([]);

  // Get all companies from uploaded data
  const companies = uploadedData?.companies?.map(company => company.name) || [];
  
  // Convert uploaded data to salary reports format
  const convertToSalaryReports = (data, month) => {
    if (!data || !data.companies) return [];
    
    const reports = [];
    
    data.companies.forEach(company => {
      company.employees.forEach(emp => {
        // Calculate regular pay (monthly salary)
        const regularPay = emp.monthly_salary || emp.net_salary || 0;
        
        // Only add employees with valid data
        if (regularPay > 0 || emp.name) {
          // Get the employee ID
          let employeeId = emp.employee_id || '';
          
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
            status: paidEmployees.includes(employeeId) ? "Paid" : "Unpaid",
            month: month
          });
        }
      });
    });
    
    return reports;
  };

  const salaryReports = convertToSalaryReports(uploadedData, selectedMonth);
  
  // Filter reports based on search term and selected company
  const filteredReports = salaryReports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'All' || report.company === selectedCompany;
    
    return matchesSearch && matchesCompany;
  });

  const handlePaymentConfirm = () => {
    if (selectedEmployee) {
      setPaidEmployees([...paidEmployees, selectedEmployee.id]);
      setShowModal(false);
    }
  };

  const handleMarkAsPaid = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Salary Report</h1>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center">
            <Filter size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-600 mr-2">Filters:</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                id="company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-40"
              >
                <option value="All">All Companies</option>
                {companies.map((company, index) => (
                  <option key={index} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-40"
              >
                <option value="Current">Current Month</option>
                <option value="Previous">Previous Month</option>
              </select>
            </div>
          </div>
          
          <div className="flex-grow md:max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full"
              />
              <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={18} className="mr-2" />
            Export to Excel
          </button>
        </div>
      </div>
      
      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Rate (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Salary (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VDA (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total-B (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={`${report.id}-${index}`} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{report.id}</td>
                    <td className="px-6 py-4">{report.name}</td>
                    <td className="px-6 py-4">₹{(report.daily_salary).toLocaleString()}</td>
                    <td className="px-6 py-4">{report.attendance_days.toFixed(2)}</td>
                    <td className="px-6 py-4">₹{(report.monthly_salary).toLocaleString()}</td>
                    <td className="px-6 py-4">₹{(report.vda).toLocaleString()}</td>
                    <td className="px-6 py-4">₹{(report.total_b).toLocaleString()}</td>
                    <td className="px-6 py-4">₹{(report.deduction_total).toLocaleString()}</td>
                    <td className="px-6 py-4">₹{(report.net_salary).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.status !== "Paid" && (
                        <button
                          onClick={() => handleMarkAsPaid(report)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {report.status === "Paid" && (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle size={16} className="mr-1" />
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                    No salary data available. Please upload an Excel file.
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Payment</h3>
            <p className="mb-2">Are you sure you want to mark the payment for <strong>{selectedEmployee.name}</strong> as completed?</p>
            <p className="mb-2">Attendance: <strong>{typeof selectedEmployee.attendance_days === 'number' ? selectedEmployee.attendance_days.toFixed(2) : parseFloat(selectedEmployee.attendance_days || 26).toFixed(2)} days</strong></p>
            <p className="mb-6">Amount: <strong>₹{(selectedEmployee.bank_transfer || selectedEmployee.net_salary || 0).toLocaleString()}</strong></p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
