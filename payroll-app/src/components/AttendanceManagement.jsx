import { useState, useEffect } from 'react';
import { Plus, Upload, Search, Calendar, Clock } from 'lucide-react';
import { getEmployees, getAttendanceRecords, createAttendance, uploadExcelAttendance } from '../services/attendancePayrollApi';

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: selectedMonth,
    days_worked: 0,
    ot_hours: 0
  });
  
  // File upload state
  const [file, setFile] = useState(null);
  const [uploadMonth, setUploadMonth] = useState(selectedMonth);

  // Fetch employees and attendance records
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employees
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Fetch attendance records for the selected month
        const attendanceData = await getAttendanceRecords(null, selectedMonth);
        setAttendanceRecords(attendanceData);
        setFilteredRecords(attendanceData);
      } catch (err) {
        setError(err.detail || err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Filter attendance records based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecords(attendanceRecords);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = attendanceRecords.filter(record => {
        // Find the employee for this record
        const employee = employees.find(emp => emp.employee_id === record.employee_id);
        return (
          record.employee_id.toLowerCase().includes(query) || 
          (employee && employee.name.toLowerCase().includes(query))
        );
      });
      setFilteredRecords(filtered);
    }
  }, [searchQuery, attendanceRecords, employees]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employee_id' ? value : 
              (name === 'month' ? value : 
              parseFloat(value) || 0)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format month to YYYY-MM-DD
      const formattedData = {
        ...formData,
        month: `${formData.month}-01` // Add day to make it a valid date
      };
      
      // Create attendance record
      const result = await createAttendance(formattedData);
      
      // Update attendance records list
      setAttendanceRecords(prev => {
        const index = prev.findIndex(record => 
          record.employee_id === result.employee_id && 
          record.month.startsWith(formData.month)
        );
        
        if (index >= 0) {
          // Replace existing record
          return [
            ...prev.slice(0, index),
            result,
            ...prev.slice(index + 1)
          ];
        } else {
          // Add new record
          return [...prev, result];
        }
      });
      
      // Reset form
      setFormData({
        employee_id: '',
        month: selectedMonth,
        days_worked: 0,
        ot_hours: 0
      });
      setIsFormOpen(false);
      
    } catch (err) {
      setError(err.detail || err.message || 'Failed to save attendance record');
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);

    // Validate file type
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadExcelAttendance(file, uploadMonth);
      console.log('Upload successful:', result);
      
      // Refresh attendance records
      const attendanceData = await getAttendanceRecords(null, selectedMonth);
      setAttendanceRecords(attendanceData);
      setFilteredRecords(attendanceData);
      
      // Reset file input
      setFile(null);
      document.getElementById('attendance-file-upload').value = '';
      
      // Show success message
      alert(`File uploaded successfully! Processed ${result.length} attendance records.`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.detail || err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.employee_id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Attendance Management</h2>

      {/* Month selector and search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
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
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Attendance Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">Add Attendance Record</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employee</label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.employee_id}>
                      {employee.name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Days Worked</label>
                <input
                  type="number"
                  name="days_worked"
                  value={formData.days_worked}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="31"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">OT Hours</label>
                <input
                  type="number"
                  name="ot_hours"
                  value={formData.ot_hours}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.5"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Excel Upload Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Bulk Upload Attendance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Excel File</label>
            <div className="relative">
              <input
                id="attendance-file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Month</label>
            <input
              type="month"
              value={uploadMonth}
              onChange={(e) => setUploadMonth(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center ${
                !file || isUploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Excel
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Excel file should contain columns: employee_id, days_worked, ot_hours</p>
        </div>
      </div>

      {/* Attendance Records Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading attendance records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
          <p>No attendance records found for the selected month.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Worked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.employee_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getEmployeeName(record.employee_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.days_worked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.ot_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
