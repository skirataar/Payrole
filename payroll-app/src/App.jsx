import { useState } from 'react';
import { Search, User, Settings, FileText, Clock, BarChart3, Upload, ChevronRight, ChevronLeft, Menu, X, Calendar, Download, CheckCircle, Edit, Eye } from 'lucide-react';

// Component definitions
const DashboardPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-8">Dashboard</h2>
      
      {/* Stats Section */}
      <div className="space-y-6">
        {/* Total Employees */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm text-gray-600 mb-1">Total Employees</h3>
          <div className="text-2xl font-medium mb-1">24</div>
          <div className="text-sm text-green-600">+2 since last month</div>
        </div>

        {/* Payroll Processed */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm text-gray-600 mb-1">Payroll Processed</h3>
          <div className="text-2xl font-medium mb-1">₹32,45,000</div>
          <div className="text-sm text-gray-600">April 2025</div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm text-gray-600 mb-1">Pending Approvals</h3>
          <div className="text-2xl font-medium mb-1">3</div>
          <div>
            <button className="text-sm text-blue-600">View details</button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="text-blue-600 w-4 h-4" />
              <div>
                <div className="text-sm">New timesheet uploaded</div>
                <div className="text-xs text-gray-500">April 14, 2025 - 09:45 AM</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600 w-4 h-4" />
              <div>
                <div className="text-sm">Payroll approved for 5 employees</div>
                <div className="text-xs text-gray-500">April 14, 2025 - 09:30 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadExcelPage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleSubmit = () => {
    if (file) {
      // Handle file upload logic here
      console.log('Uploading file:', file.name);
    } else {
      alert('Please select a file first');
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
              Upload .xlsx file with Employee ID, Name, and Hours Worked
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              Browse Files
            </label>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Requirements:</h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>File must be in Excel format (.xlsx or .xls)</li>
            <li>Must contain columns for Employee ID, Name, and Hours Worked</li>
            <li>Each row should represent a single employee record</li>
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

const EmployeeHoursPage = ({ employees }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(employee => 
    employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">View Employee Hours</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID or Name"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3">EMPLOYEE ID</th>
              <th className="px-6 py-3">NAME</th>
              <th className="px-6 py-3">TOTAL HOURS</th>
              <th className="px-6 py-3">OVERTIME HOURS</th>
              <th className="px-6 py-3">UPLOAD DATE</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{employee.id}</td>
                <td className="px-6 py-4">{employee.name}</td>
                <td className="px-6 py-4">{employee.hours}</td>
                <td className="px-6 py-4">{employee.overtime}</td>
                <td className="px-6 py-4">{employee.uploadDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${employee.status === 'Approved' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SalaryReportPage = ({ salaryReports }) => {
  const [selectedMonth, setSelectedMonth] = useState('April 2025');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Salary Report</h2>
      
      {/* Month Selection and Generate Report */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="space-y-4">
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
          
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3">EMPLOYEE ID</th>
              <th className="px-6 py-3">NAME</th>
              <th className="px-6 py-3">REGULAR PAY ($)</th>
              <th className="px-6 py-3">OVERTIME PAY ($)</th>
              <th className="px-6 py-3">TOTAL PAY ($)</th>
              <th className="px-6 py-3">PAYMENT STATUS</th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {salaryReports.map(report => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{report.id}</td>
                <td className="px-6 py-4">{report.name}</td>
                <td className="px-6 py-4">{report.regularPay.toFixed(2)}</td>
                <td className="px-6 py-4">{report.overtimePay.toFixed(2)}</td>
                <td className="px-6 py-4">{report.totalPay.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${report.status === 'Paid' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-600'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      className={`px-3 py-1 rounded text-sm
                        ${report.status === 'Paid'
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      disabled={report.status === 'Paid'}
                    >
                      Mark as Paid
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    regularHoursRate: 20.00,
    overtimeMultiplier: 1.5,
    standardHoursPerWeek: 40,
    workingDaysPerWeek: 5
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Handle saving settings to backend
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      {/* Default Salary Structure */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Default Salary Structure</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Regular Hours Rate ($)
            </label>
            <input
              type="number"
              name="regularHoursRate"
              value={settings.regularHoursRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Overtime Rate Multiplier
            </label>
            <input
              type="number"
              name="overtimeMultiplier"
              value={settings.overtimeMultiplier}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              step="0.1"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Working Hours Configuration */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Working Hours Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Standard Hours Per Week
            </label>
            <input
              type="number"
              name="standardHoursPerWeek"
              value={settings.standardHoursPerWeek}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Working Days Per Week
            </label>
            <input
              type="number"
              name="workingDaysPerWeek"
              value={settings.workingDaysPerWeek}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
              max="7"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button 
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sample data for demonstration
  const employees = [
    { id: "EMP001", name: "John Doe", hours: 42, overtime: 2, uploadDate: "2025-04-10", status: "Pending" },
    { id: "EMP002", name: "Jane Smith", hours: 40, overtime: 0, uploadDate: "2025-04-10", status: "Approved" },
    { id: "EMP003", name: "Mike Johnson", hours: 45, overtime: 5, uploadDate: "2025-04-12", status: "Pending" },
    { id: "EMP004", name: "Sarah Williams", hours: 38, overtime: 0, uploadDate: "2025-04-12", status: "Approved" },
    { id: "EMP005", name: "Robert Brown", hours: 41, overtime: 1, uploadDate: "2025-04-10", status: "Pending" }
  ];
  
  const salaryReports = [
    { id: "EMP001", name: "John Doe", regularPay: 3200, overtimePay: 100, totalPay: 3300, status: "Unpaid" },
    { id: "EMP002", name: "Jane Smith", regularPay: 3200, overtimePay: 0, totalPay: 3200, status: "Paid" },
    { id: "EMP003", name: "Mike Johnson", regularPay: 3200, overtimePay: 250, totalPay: 3450, status: "Unpaid" },
    { id: "EMP004", name: "Sarah Williams", regularPay: 3040, overtimePay: 0, totalPay: 3040, status: "Paid" },
    { id: "EMP005", name: "Robert Brown", regularPay: 3200, overtimePay: 50, totalPay: 3250, status: "Unpaid" }
  ];

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'upload', label: 'Upload Excel', icon: <Upload size={20} /> },
    { id: 'employee-hours', label: 'View Employee Hours', icon: <Clock size={20} /> },
    { id: 'salary-report', label: 'Salary Report', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'upload':
        return <UploadExcelPage />;
      case 'employee-hours':
        return <EmployeeHoursPage employees={employees} />;
      case 'salary-report':
        return <SalaryReportPage salaryReports={salaryReports} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
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
              <button className="p-2 rounded-full hover:bg-gray-200">
                <Settings size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-200">
                <User size={20} />
              </button>
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
