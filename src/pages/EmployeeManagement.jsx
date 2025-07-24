import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useActivity } from '../context/ActivityContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Search, Plus, Edit, Trash2, X, Check,
  AlertCircle, UserPlus, FileText, DollarSign, RefreshCw,
  Calendar, Phone, Mail, MapPin, Briefcase, Clock, Award,
  ChevronUp, ChevronDown, Filter
} from 'lucide-react';

const EmployeeManagement = () => {
  const { darkMode } = useTheme();
  const { user, registerEmployee, getCompanyEmployees: getAuthEmployees } = useAuth();
  const { companyData, addEmployee, updateEmployee, deleteEmployee, setUploadedData, employees } = useCompany();
  const { logActivity } = useActivity();

  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // State for employee list and form
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    job: true,
    attendance: false
  });

  // Enhanced form state with new fields
  const [formData, setFormData] = useState({
    // Personal Information
    id: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    workLocation: '',
    
    // Job Details
    position: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: '',
    supervisor: '',
    salary: '',
    
    // Attendance and Leave
    leaveBalance: 20,
    shiftDetails: '',
    overtimeHours: 0
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'salary' || name === 'leaveBalance' || name === 'overtimeHours' 
        ? (value === '' ? '' : parseFloat(value)) 
        : value
    });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Enhanced search function - searches across ALL employee fields
  const searchEmployee = (employee, searchTerm) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    // Search in all text fields
    const searchableFields = [
      employee.name,
      employee.id,
      employee.position,
      employee.department,
      employee.email,
      employee.phone,
      employee.workLocation,
      employee.gender,
      employee.employmentType,
      employee.supervisor,
      employee.shiftDetails,
      employee.dateOfBirth,
      employee.joinDate,
      employee.salary?.toString(),
      employee.leaveBalance?.toString(),
      employee.overtimeHours?.toString()
    ];
    
    return searchableFields.some(field => 
      field && field.toLowerCase().includes(term)
    );
  };

  // Enhanced sorting function
  const sortEmployees = (employees, field, direction) => {
    return [...employees].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle numeric fields
      if (field === 'salary' || field === 'leaveBalance' || field === 'overtimeHours') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      // Handle date fields
      if (field === 'dateOfBirth' || field === 'joinDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle null/undefined values
      if (!aValue && aValue !== 0) aValue = '';
      if (!bValue && bValue !== 0) bValue = '';
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = sortEmployees(
    employees.filter(employee => searchEmployee(employee, searchTerm)),
    sortField,
    sortDirection
  );

  // Handle sort field change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
    setShowSortOptions(false);
  };

  // Get sort options for dropdown
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'id', label: 'Employee ID' },
    { value: 'position', label: 'Position' },
    { value: 'department', label: 'Department' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'workLocation', label: 'Work Location' },
    { value: 'gender', label: 'Gender' },
    { value: 'employmentType', label: 'Employment Type' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'salary', label: 'Salary' },
    { value: 'leaveBalance', label: 'Leave Balance' },
    { value: 'overtimeHours', label: 'Overtime Hours' },
    { value: 'joinDate', label: 'Join Date' },
    { value: 'dateOfBirth', label: 'Date of Birth' }
  ];

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortField);
    return option ? option.label : 'Name';
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortOptions && !event.target.closest('.sort-dropdown')) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortOptions]);

  // Reset form
  const resetForm = () => {
    setFormData({
      // Personal Information
      id: '',
      name: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      workLocation: '',
      
      // Job Details
      position: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0],
      employmentType: '',
      supervisor: '',
      salary: '',
      
      // Attendance and Leave
      leaveBalance: 20,
      shiftDetails: '',
      overtimeHours: 0
    });
    setFormError('');
    setEditingEmployee(null);
  };

  // Open edit form
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      // Personal Information
      id: employee.id,
      name: employee.name,
      dateOfBirth: employee.dateOfBirth || '',
      gender: employee.gender || '',
      email: employee.email || '',
      phone: employee.phone || '',
      workLocation: employee.workLocation || '',
      
      // Job Details
      position: employee.position || '',
      department: employee.department || '',
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
      employmentType: employee.employmentType || '',
      supervisor: employee.supervisor || '',
      salary: employee.salary || '',
      
      // Attendance and Leave
      leaveBalance: employee.leaveBalance || 20,
      shiftDetails: employee.shiftDetails || '',
      overtimeHours: employee.overtimeHours || 0
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
                const companyContextEmployees = employees;
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

        {/* Enhanced Search and Sort Controls */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search across all employee fields (name, ID, department, email, phone, location, etc.)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full rounded-md border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <Filter size={16} />
                <span>Sort by: {getCurrentSortLabel()}</span>
                {sortDirection === 'asc' ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {/* Sort Options Dropdown */}
              {showSortOptions && (
                <div className={`sort-dropdown absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-10 ${
                  darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
                }`}>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                          sortField === option.value
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                            : darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {sortField === option.value && (
                            <span className="text-blue-600 dark:text-blue-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? (
                <>
                  <ChevronUp size={16} />
                  <span>A-Z</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Z-A</span>
                </>
              )}
            </button>

            {/* Clear Search */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <X size={16} />
                <span>Clear Search</span>
              </button>
            )}

            {/* Results Count */}
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredAndSortedEmployees.length} of {employees.length} employees
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Note about employee login */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
          <p className="flex items-center text-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            All employees listed here can log in to the employee portal using their Employee ID and the default password: <strong className="ml-1">PayPro1245</strong>
          </p>
        </div>

        {/* Employee list - Enhanced Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedEmployees.length > 0 ? (
            filteredAndSortedEmployees.map((employee) => (
              <div key={employee.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Employee Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <p className="text-blue-100 text-sm">{employee.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-100 hover:text-white transition-colors"
                        title="Edit employee"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-200 hover:text-red-100 transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="p-4 space-y-4">
                  {/* Personal Information */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <User size={14} className="mr-1" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {employee.gender && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.gender}</span>
                        </div>
                      )}
                      {employee.dateOfBirth && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">DOB:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">
                            {new Date(employee.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {employee.workLocation && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Location:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.workLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(employee.email || employee.phone) && (
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Phone size={14} className="mr-1" />
                        Contact
                      </h4>
                      <div className="space-y-1 text-xs">
                        {employee.email && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Mail size={12} className="mr-1 text-gray-500" />
                            {employee.email}
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Phone size={12} className="mr-1 text-gray-500" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Briefcase size={14} className="mr-1" />
                      Job Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {employee.position && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Position:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.position}</span>
                        </div>
                      )}
                      {employee.department && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Department:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.department}</span>
                        </div>
                      )}
                      {employee.employmentType && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.employmentType}</span>
                        </div>
                      )}
                      {employee.joinDate && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">
                            {new Date(employee.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {employee.supervisor && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Supervisor:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.supervisor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial & Attendance */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Award size={14} className="mr-1" />
                      Financial & Attendance
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {employee.salary && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Salary:</span>
                          <div className="text-green-700 dark:text-green-400 font-semibold">
                            ₹{parseFloat(employee.salary).toLocaleString('en-IN')}
                          </div>
                        </div>
                      )}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400">Leave Balance:</span>
                        <div className="text-blue-700 dark:text-blue-400 font-semibold">
                          {employee.leaveBalance || 20} days
                        </div>
                      </div>
                      {employee.overtimeHours > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Overtime:</span>
                          <div className="text-orange-700 dark:text-orange-400 font-semibold">
                            {employee.overtimeHours} hrs
                          </div>
                        </div>
                      )}
                    </div>
                    {employee.shiftDetails && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Shift:</span>
                        <div className="text-gray-700 dark:text-gray-300 mt-1">{employee.shiftDetails}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {searchTerm ? 'No employees found' : 'No employees added yet'}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first employee to get started'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Add/Edit Employee Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex justify-between items-center border-b dark:border-gray-700 p-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
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
              {/* Personal Information Section */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('personal')}
                  className="flex items-center w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3"
                >
                  <User className="mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">Personal Information</span>
                  <span className="ml-auto">{expandedSections.personal ? '−' : '+'}</span>
                </button>
                
                {expandedSections.personal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID*</label>
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

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name*</label>
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

                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">Date of Birth</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="workLocation" className="block text-sm font-medium mb-1">Work Location</label>
                      <input
                        type="text"
                        id="workLocation"
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter work location"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Job Details Section */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('job')}
                  className="flex items-center w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3"
                >
                  <Briefcase className="mr-2 text-green-600 dark:text-green-400" />
                  <span className="font-semibold">Job Details</span>
                  <span className="ml-auto">{expandedSections.job ? '−' : '+'}</span>
                </button>
                
                {expandedSections.job && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium mb-1">Job Title</label>
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
                        placeholder="Enter job title"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium mb-1">Department</label>
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

                    <div>
                      <label htmlFor="joinDate" className="block text-sm font-medium mb-1">Joining Date</label>
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

                    <div>
                      <label htmlFor="employmentType" className="block text-sm font-medium mb-1">Employment Type</label>
                      <select
                        id="employmentType"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="supervisor" className="block text-sm font-medium mb-1">Supervisor/Manager</label>
                      <input
                        type="text"
                        id="supervisor"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter supervisor name"
                      />
                    </div>

                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium mb-1">Salary (₹)*</label>
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
                  </div>
                )}
              </div>

              {/* Attendance and Leave Section */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('attendance')}
                  className="flex items-center w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3"
                >
                  <Clock className="mr-2 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">Attendance and Leave</span>
                  <span className="ml-auto">{expandedSections.attendance ? '−' : '+'}</span>
                </button>
                
                {expandedSections.attendance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <label htmlFor="leaveBalance" className="block text-sm font-medium mb-1">Leave Balance (Days)</label>
                      <input
                        type="number"
                        id="leaveBalance"
                        name="leaveBalance"
                        value={formData.leaveBalance}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter leave balance"
                        min="0"
                        max="365"
                      />
                    </div>

                    <div>
                      <label htmlFor="overtimeHours" className="block text-sm font-medium mb-1">Overtime Hours</label>
                      <input
                        type="number"
                        id="overtimeHours"
                        name="overtimeHours"
                        value={formData.overtimeHours}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter overtime hours"
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="shiftDetails" className="block text-sm font-medium mb-1">Shift Details</label>
                      <textarea
                        id="shiftDetails"
                        name="shiftDetails"
                        value={formData.shiftDetails}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter shift details (e.g., 9 AM - 6 PM, Monday to Friday)"
                      />
                    </div>
                  </div>
                )}
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
