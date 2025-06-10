import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useActivity } from '../context/ActivityContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Search, Plus, Edit, Trash2, X, Check,
  AlertCircle, UserPlus, FileText, DollarSign, RefreshCw
} from 'lucide-react';

const EmployeeManagement = () => {
  const { darkMode } = useTheme();
  const { user, registerEmployee, getCompanyEmployees: getAuthEmployees } = useAuth();
  const { companyData, addEmployee, updateEmployee, deleteEmployee, setUploadedData, getCompanyEmployees } = useCompany();
  const { logActivity } = useActivity();

  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for employee list and form
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    position: '',
    department: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Load employees for the current company
  useEffect(() => {
    if (companyData && user?.companyId) {
      // Get employees from both sources
      const companyContextEmployees = getCompanyEmployees();
      const authContextEmployees = getAuthEmployees();

      console.log(`Company ID: ${user.companyId}`);
      console.log(`CompanyContext: ${companyContextEmployees.length} employees`);
      console.log(`AuthContext: ${authContextEmployees.length} employees`);

      // Combine employees from both sources, removing duplicates
      const combinedEmployees = [...companyContextEmployees];

      // Add employees from auth context that aren't already in the list
      authContextEmployees.forEach(authEmp => {
        if (!combinedEmployees.some(emp => emp.id === authEmp.id)) {
          combinedEmployees.push({
            id: authEmp.id,
            name: authEmp.name,
            position: authEmp.position || '',
            department: authEmp.department || '',
            salary: authEmp.salary || 0,
            attendance: authEmp.attendance || 26,
            joinDate: authEmp.joinDate || new Date().toISOString().split('T')[0],
            role: 'employee',
            companyId: user.companyId
          });
        }
      });

      // Filter to only include employees for the current company
      const filteredEmployees = combinedEmployees.filter(emp => emp.companyId === user.companyId);

      // Log the employees for debugging
      console.log(`Combined and filtered: ${filteredEmployees.length} employees for company ID: ${user.companyId}`);

      // Set the employees in state
      setEmployees(filteredEmployees);

      // Log the first few employees for debugging
      if (filteredEmployees.length > 0) {
        console.log('Sample employees:');
        filteredEmployees.slice(0, 3).forEach((emp, index) => {
          console.log(`Employee ${index + 1}:`, emp);
        });
      }

      // Register employees in the auth system if they're not already registered
      // Using a separate function to handle registration
      const registerAllEmployees = async () => {
        for (const employee of filteredEmployees) {
          try {
            // Create employee object for registration
            const employeeData = {
              id: employee.id,
              name: employee.name,
              position: employee.position || '',
              department: employee.department || '',
              salary: employee.salary || 0,
              attendance: employee.attendance || 26,
              joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
              password: 'PayPro1245',
              role: 'employee',
              companyId: user.companyId
            };

            // Try to register the employee
            try {
              await registerEmployee(employeeData);
              console.log(`Registered employee: ${employee.id} - ${employee.name}`);
            } catch (error) {
              // If employee already exists, just ignore the error
              if (!error.message.includes('already exists')) {
                console.error(`Error registering employee ${employee.id}:`, error.message);
              }
            }
          } catch (error) {
            console.error(`Error processing employee ${employee.id}:`, error);
          }
        }
      };

      // Call the registration function but don't wait for it
      registerAllEmployees().catch(error => {
        console.error('Error registering employees:', error);
      });
    } else {
      // Initialize empty array if no company data exists
      setEmployees([]);
    }
  }, [companyData, user, getCompanyEmployees, getAuthEmployees]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'salary' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      position: '',
      department: '',
      salary: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setEditingEmployee(null);
  };

  // Open edit form
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      id: employee.id,
      name: employee.name,
      position: employee.position || '',
      department: employee.department || '',
      salary: employee.salary || '',
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0]
    });
    setShowAddForm(true);
    setFormError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.id.trim()) {
      setFormError('Employee ID is required');
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Employee name is required');
      return;
    }

    if (formData.salary === '' || isNaN(formData.salary) || formData.salary <= 0) {
      setFormError('Please enter a valid salary amount');
      return;
    }

    // Check if employee ID already exists (for new employees)
    if (!editingEmployee && employees.some(emp => emp.id === formData.id)) {
      setFormError('Employee ID already exists');
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        const success = updateEmployee(editingEmployee.id, formData);

        if (!success) {
          throw new Error('Failed to update employee');
        }

        // Log activity
        if (logActivity) {
          logActivity('EDIT_EMPLOYEE', {
            employeeId: formData.id,
            employeeName: formData.name,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Add new employee
        const newEmployee = {
          ...formData,
          // Add default password for employee login
          password: 'PayPro1245',
          role: 'employee',
          companyId: user.companyId
        };

        // First register the employee in the auth system
        try {
          await registerEmployee(newEmployee);
        } catch (error) {
          throw new Error(`Failed to register employee: ${error.message}`);
        }

        // Then add to company data
        const success = addEmployee(newEmployee);

        if (!success) {
          throw new Error('Failed to add employee to company data');
        }

        // Log activity
        if (logActivity) {
          logActivity('ADD_EMPLOYEE', {
            employeeId: formData.id,
            employeeName: formData.name,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Reset form and close it
      resetForm();
      setShowAddForm(false);

      // Show success message
      alert(`Employee ${editingEmployee ? 'updated' : 'added'} successfully!`);

    } catch (error) {
      console.error('Error saving employee:', error);
      setFormError(error.message || 'An error occurred while saving the employee');
    }
  };

  // Function to refresh employee data
  const refreshEmployeeData = () => {
    setIsRefreshing(true);

    try {
      // Get the current data from localStorage
      const savedData = localStorage.getItem(`uploadedData_${user.companyId}`);

      if (savedData) {
        // Parse the data
        const parsedData = JSON.parse(savedData);

        // Update the context with the data
        setUploadedData(parsedData);

        // Log activity
        if (logActivity) {
          logActivity('REFRESH_EMPLOYEES', {
            timestamp: new Date().toISOString()
          });
        }

        console.log('Employee data refreshed from localStorage');
      } else {
        console.log('No saved data found in localStorage');
      }
    } catch (error) {
      console.error('Error refreshing employee data:', error);
      alert('An error occurred while refreshing employee data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle employee deletion
  const handleDelete = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        // Find employee before deletion for activity log
        const employee = employees.find(emp => emp.id === employeeId);

        // Delete employee using context function
        const success = deleteEmployee(employeeId);

        if (!success) {
          throw new Error('Failed to delete employee');
        }

        // Log activity
        if (logActivity) {
          logActivity('DELETE_EMPLOYEE', {
            employeeId,
            employeeName: employee?.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }

        alert('Employee deleted successfully!');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(error.message || 'An error occurred while deleting the employee');
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white flex items-center">
            <User className="mr-2 text-blue-600 dark:text-blue-400" />
            Employee Management
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={refreshEmployeeData}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center mr-2"
              title="Refresh employee data"
              disabled={isRefreshing}
            >
              <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                // Get employees from both sources
                const companyContextEmployees = getCompanyEmployees();
                const authContextEmployees = getAuthEmployees();

                console.log('Company Data:', companyData);
                console.log('Employees in state:', employees);
                console.log('Employees from CompanyContext:', companyContextEmployees);
                console.log('Employees from AuthContext:', authContextEmployees);

                alert(`Debug info logged to console.\nFound ${employees.length} employees in state.\nCompanyContext: ${companyContextEmployees.length} employees.\nAuthContext: ${authContextEmployees.length} employees.`);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center mr-2"
              title="Debug employee data"
            >
              <AlertCircle size={18} className="mr-2" />
              Debug
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <UserPlus size={18} className="mr-2" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees by name, ID, position, or department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-md border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>

        {/* Note about employee login */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
          <p className="flex items-center text-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            All employees listed here can log in to the employee portal using their Employee ID and the default password: <strong className="ml-1">PayPro1245</strong>
          </p>
        </div>

        {/* Employee list */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ₹{employee.salary ? parseFloat(employee.salary).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit employee"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete employee"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No employees found matching your search' : 'No employees added yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex justify-between items-center border-b dark:border-gray-700 p-4">
              <h2 className="text-xl font-bold">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="id" className="block text-sm font-medium mb-1">
                  Employee ID*
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={!!editingEmployee}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500'
                      : 'bg-white border-gray-300 disabled:bg-gray-100 disabled:text-gray-500'
                  } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter employee name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter position"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium mb-1">
                    Salary (₹)*
                  </label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter salary amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>

              {!editingEmployee && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm">
                  <p className="flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    Default password for employee login will be set to: <strong className="ml-1">PayPro1245</strong>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Check size={18} className="mr-2" />
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
