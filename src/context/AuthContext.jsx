import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock API functions (replace with real API calls later)
// Initialize mockUsers from localStorage or use default values
const defaultUsers = [
  {
    id: '1',
    email: 'admin@payrollpro.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    companyId: null
  },
  {
    id: '2',
    email: 'company1@example.com',
    password: 'password123',
    name: 'Company One',
    role: 'company',
    companyId: 'comp1',
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: '2024-12-31'
    }
  },
  {
    id: '3',
    email: 'company2@example.com',
    password: 'password123',
    name: 'Company Two',
    role: 'company',
    companyId: 'comp2',
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: '2024-10-15'
    }
  },
  {
    id: '4',
    email: 'expired@example.com',
    password: 'password123',
    name: 'Expired Company',
    role: 'company',
    companyId: 'comp3',
    subscription: {
      plan: 'basic',
      status: 'inactive',
      expiresAt: '2024-04-01' // Already expired
    }
  },
  {
    id: '5',
    email: 'expiring@example.com',
    password: 'password123',
    name: 'Expiring Soon Company',
    role: 'company',
    companyId: 'comp4',
    subscription: {
      plan: 'standard',
      status: 'active',
      expiresAt: '2024-05-15' // Expiring soon (within 7 days of current date)
    }
  },
  // Employee users
  {
    id: '101',
    password: 'PayPro1245',
    name: 'John Doe',
    role: 'employee',
    companyId: 'comp1',
    department: 'Engineering',
    position: 'Manager',
    joinDate: '2023-01-15',
    salary: {
      basic: 75000,
      allowances: 7500,
      deductions: 3000,
      net: 79500
    }
  },
  {
    id: '102',
    password: 'PayPro1245',
    name: 'Jane Smith',
    role: 'employee',
    companyId: 'comp1',
    department: 'Development',
    position: 'Developer',
    joinDate: '2023-02-01',
    salary: {
      basic: 65000,
      allowances: 6000,
      deductions: 2500,
      net: 68500
    }
  },
  {
    id: '201',
    password: 'PayPro1245',
    name: 'Robert Johnson',
    role: 'employee',
    companyId: 'comp2',
    department: 'Management',
    position: 'Director',
    joinDate: '2023-01-10',
    salary: {
      basic: 85000,
      allowances: 8500,
      deductions: 4000,
      net: 89500
    }
  },
  {
    id: '202',
    password: 'PayPro1245',
    name: 'Emily Davis',
    role: 'employee',
    companyId: 'comp2',
    department: 'Design',
    position: 'Designer',
    joinDate: '2023-03-15',
    salary: {
      basic: 60000,
      allowances: 5000,
      deductions: 2000,
      net: 63000
    }
  },
  {
    id: '203',
    password: 'PayPro1245',
    name: 'Michael Wilson',
    role: 'employee',
    companyId: 'comp2',
    department: 'Development',
    position: 'Developer',
    joinDate: '2023-02-20',
    salary: {
      basic: 62000,
      allowances: 5500,
      deductions: 2200,
      net: 65300
    }
  }
];

// Get users from localStorage or use default
const savedUsers = localStorage.getItem('mockUsers');
const mockUsers = savedUsers ? JSON.parse(savedUsers) : defaultUsers;

// Mock company data - default values
const defaultCompanyData = {
  'comp1': {
    id: 'comp1',
    name: 'Company One',
    employees: [
      { id: '101', name: 'John Doe', position: 'Manager', salary: 75000 },
      { id: '102', name: 'Jane Smith', position: 'Developer', salary: 65000 },
    ],
    monthlyData: {
      'April 2024': {
        companies: [{
          name: 'Company One',
          employees: [
            { employee_id: '101', name: 'John Doe', net_salary: 75000, monthly_salary: 6250 },
            { employee_id: '102', name: 'Jane Smith', net_salary: 65000, monthly_salary: 5416 }
          ],
          summary: { total_salary: 140000 }
        }]
      }
    }
  },
  'comp2': {
    id: 'comp2',
    name: 'Company Two',
    employees: [
      { id: '201', name: 'Robert Johnson', position: 'Director', salary: 85000 },
      { id: '202', name: 'Emily Davis', position: 'Designer', salary: 60000 },
      { id: '203', name: 'Michael Wilson', position: 'Developer', salary: 62000 }
    ],
    monthlyData: {
      'April 2024': {
        companies: [{
          name: 'Company Two',
          employees: [
            { employee_id: '201', name: 'Robert Johnson', net_salary: 85000, monthly_salary: 7083 },
            { employee_id: '202', name: 'Emily Davis', net_salary: 60000, monthly_salary: 5000 },
            { employee_id: '203', name: 'Michael Wilson', net_salary: 62000, monthly_salary: 5166 }
          ],
          summary: { total_salary: 207000 }
        }]
      }
    }
  },
  'comp3': {
    id: 'comp3',
    name: 'Expired Company',
    employees: [
      { id: '301', name: 'Alex Brown', position: 'Manager', salary: 70000 },
      { id: '302', name: 'Sarah Miller', position: 'Accountant', salary: 55000 }
    ],
    monthlyData: {
      'April 2024': {
        companies: [{
          name: 'Expired Company',
          employees: [
            { employee_id: '301', name: 'Alex Brown', net_salary: 70000, monthly_salary: 5833 },
            { employee_id: '302', name: 'Sarah Miller', net_salary: 55000, monthly_salary: 4583 }
          ],
          summary: { total_salary: 125000 }
        }]
      }
    }
  },
  'comp4': {
    id: 'comp4',
    name: 'Expiring Soon Company',
    employees: [
      { id: '401', name: 'David Lee', position: 'CEO', salary: 90000 },
      { id: '402', name: 'Lisa Wang', position: 'CTO', salary: 85000 },
      { id: '403', name: 'Kevin Chen', position: 'Developer', salary: 60000 }
    ],
    monthlyData: {
      'April 2024': {
        companies: [{
          name: 'Expiring Soon Company',
          employees: [
            { employee_id: '401', name: 'David Lee', net_salary: 90000, monthly_salary: 7500 },
            { employee_id: '402', name: 'Lisa Wang', net_salary: 85000, monthly_salary: 7083 },
            { employee_id: '403', name: 'Kevin Chen', net_salary: 60000, monthly_salary: 5000 }
          ],
          summary: { total_salary: 235000 }
        }]
      }
    }
  }
};

// Get company data from localStorage or use default
const savedCompanyData = localStorage.getItem('mockCompanyData');
const mockCompanyData = savedCompanyData ? JSON.parse(savedCompanyData) : defaultCompanyData;

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    // Check for existing user data in localStorage
    const savedUser = localStorage.getItem('user');
    const savedCompanyData = localStorage.getItem('companyData');

    console.log('Checking for saved user data...');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Found saved user:', parsedUser.email);
        setUser(parsedUser);

        if (savedCompanyData) {
          const parsedCompanyData = JSON.parse(savedCompanyData);
          console.log('Found saved company data for:', parsedCompanyData.name);
          setCompanyData(parsedCompanyData);
        } else {
          console.log('No saved company data found');

          // If we have a company user but no company data, try to load it from mock data
          if (parsedUser.role === 'company' && parsedUser.companyId) {
            const compData = mockCompanyData[parsedUser.companyId];
            if (compData) {
              console.log('Loading company data from mock data');
              setCompanyData(compData);
              localStorage.setItem('companyData', JSON.stringify(compData));
            }
          }
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('companyData');
      }
    } else {
      console.log('No saved user data found');
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setError('');
    try {
      // In a real app, this would be an API call
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // If user is a company, load their data
      if (userWithoutPassword.role === 'company' && userWithoutPassword.companyId) {
        const compData = mockCompanyData[userWithoutPassword.companyId];
        if (compData) {
          setCompanyData(compData);
          localStorage.setItem('companyData', JSON.stringify(compData));
        }
      }

      // Note: Activity logging will be handled in the Login component
      // since we don't have access to the ActivityContext here

      return userWithoutPassword;
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    setError('');
    try {
      // In a real app, this would be an API call
      const existingUser = mockUsers.find(u => u.email === userData.email);

      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Generate a unique company ID
      const companyId = `comp-${Date.now()}`;

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        role: 'company',
        companyId: companyId,
        subscription: {
          plan: userData.subscriptionType || 'basic',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        }
      };

      // In a real app, you would save this to a database
      mockUsers.push(newUser);

      // Save updated mockUsers to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = newUser;

      // Get current date in "Month YYYY" format
      const currentDate = new Date();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

      // Create empty company data with sample structure
      const newCompanyData = {
        id: companyId,
        name: userWithoutPassword.name,
        employees: [],
        monthlyData: {
          [currentMonth]: {
            companies: [{
              name: userWithoutPassword.name,
              employees: [],
              summary: { total_salary: 0 }
            }]
          }
        }
      };

      // In a real app, you would save this to a database
      mockCompanyData[companyId] = newCompanyData;

      // Save updated mockCompanyData to localStorage
      localStorage.setItem('mockCompanyData', JSON.stringify(mockCompanyData));

      console.log('New company registered:', newCompanyData);
      console.log('Updated mockUsers:', mockUsers);
      console.log('Updated mockCompanyData:', mockCompanyData);

      return userWithoutPassword;
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Save the user ID before logging out (for debugging)
    const userId = user?.id;
    console.log(`Logging out user: ${userId}`);

    // Clear user state
    setUser(null);
    setCompanyData(null);

    // Remove only user-specific data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('companyData');

    console.log('User logged out successfully');
  };

  // Get all companies (admin only)
  const getAllCompanies = () => {
    if (user?.role !== 'admin') {
      setError('Unauthorized access');
      return null;
    }

    return Object.values(mockCompanyData);
  };

  // Get all users (admin only)
  const getAllUsers = () => {
    if (user?.role !== 'admin') {
      setError('Unauthorized access');
      return null;
    }

    return mockUsers.map(({ password: _, ...user }) => user);
  };

  // Update subscription (admin only)
  const updateSubscription = (companyId, subscriptionData) => {
    if (user?.role !== 'admin') {
      setError('Unauthorized access');
      return false;
    }

    const companyUser = mockUsers.find(u => u.companyId === companyId);
    if (companyUser) {
      companyUser.subscription = { ...companyUser.subscription, ...subscriptionData };

      // Save updated mockUsers to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      console.log('Updated subscription data saved to localStorage');

      return true;
    }

    return false;
  };

  // Delete account (admin only)
  const deleteAccount = (userId) => {
    if (user?.role !== 'admin') {
      setError('Unauthorized access');
      return false;
    }

    // Find the user to delete
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      setError('User not found');
      return false;
    }

    // Get the company ID before removing the user
    const companyId = mockUsers[userIndex].companyId;

    // Remove the user from mockUsers
    mockUsers.splice(userIndex, 1);

    // Remove the company data if it exists
    if (companyId && mockCompanyData[companyId]) {
      delete mockCompanyData[companyId];
      localStorage.setItem('mockCompanyData', JSON.stringify(mockCompanyData));
    }

    // Save updated mockUsers to localStorage
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    console.log(`User with ID ${userId} deleted successfully`);

    return true;
  };

  // Change password function
  const changePassword = (currentPassword, newPassword) => {
    setError('');
    try {
      // Find the current user in mockUsers
      const userIndex = mockUsers.findIndex(u => u.id === user.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Verify current password
      if (mockUsers[userIndex].password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Check if new password is the same as current password
      if (currentPassword === newPassword) {
        throw new Error('New password cannot be the same as current password');
      }

      // Update the password
      mockUsers[userIndex].password = newPassword;

      // Save updated mockUsers to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

      console.log('Password changed successfully');
      return true;
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
      throw err;
    }
  };

  // Employee login function
  const loginEmployee = async (employeeId, password) => {
    setError('');
    try {
      // Find the employee in mockUsers
      const foundEmployee = mockUsers.find(u =>
        u.id === employeeId &&
        u.password === password &&
        u.role === 'employee'
      );

      if (!foundEmployee) {
        // Check if the employee ID exists but password is wrong
        const employeeExists = mockUsers.some(u =>
          u.id === employeeId &&
          u.role === 'employee'
        );

        if (employeeExists) {
          throw new Error('Invalid password');
        } else {
          throw new Error('Employee ID not found');
        }
      }

      // Check if the company exists and is active
      const companyUser = mockUsers.find(u =>
        u.companyId === foundEmployee.companyId &&
        u.role === 'company'
      );

      if (!companyUser) {
        throw new Error('Company not found');
      }

      if (companyUser.subscription?.status !== 'active') {
        throw new Error('Your company\'s subscription has expired');
      }

      // Remove password before storing user
      const { password: _, ...employeeWithoutPassword } = foundEmployee;

      // Load company data for the employee
      const compData = mockCompanyData[employeeWithoutPassword.companyId];

      // Check if there's attendance data for this employee in the company data
      if (compData && compData.employees) {
        const employeeData = compData.employees.find(emp => emp.id === employeeId);
        if (employeeData && employeeData.attendance) {
          // Add attendance data to the employee object
          employeeWithoutPassword.attendance = parseFloat(employeeData.attendance);
          console.log(`Found attendance data for employee ${employeeId}: ${employeeWithoutPassword.attendance}`);
        }
      }

      // Store the updated user data
      setUser(employeeWithoutPassword);
      localStorage.setItem('user', JSON.stringify(employeeWithoutPassword));

      // Store company data
      if (compData) {
        setCompanyData(compData);
        localStorage.setItem('companyData', JSON.stringify(compData));
      }

      return employeeWithoutPassword;
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      throw err;
    }
  };

  // Function to clear any auth errors
  const clearError = () => {
    setError('');
  };

  // Function to get all employee IDs
  const getAllEmployeeIds = (companyId = null) => {
    // Filter employees by role and optionally by company ID
    let employees = mockUsers.filter(u => u.role === 'employee');

    // If a company ID is provided, filter by that company ID
    if (companyId) {
      employees = employees.filter(u => u.companyId === companyId);
      console.log(`Filtered employees for company ID ${companyId}: ${employees.length} found`);
    }

    return employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      companyId: employee.companyId,
      companyName: mockUsers.find(u => u.companyId === employee.companyId && u.role === 'company')?.name || 'Unknown Company'
    }));
  };

  // Function to register a new employee (for company admins)
  const registerEmployee = (employeeData) => {
    setError('');
    try {
      if (!user || user.role !== 'company') {
        throw new Error('Only company accounts can register employees');
      }

      if (!employeeData.id || !employeeData.name) {
        throw new Error('Employee ID and name are required');
      }

      // Check if employee ID already exists
      const existingEmployee = mockUsers.find(u => u.id === employeeData.id);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }

      // Create new employee user with properly formatted salary and attendance
      const newEmployee = {
        ...employeeData,
        // Ensure salary is stored as a float
        salary: employeeData.salary ? parseFloat(employeeData.salary) : 0,
        // Include attendance data if available, or default to 26
        attendance: employeeData.attendance ? parseFloat(employeeData.attendance) : 26,
        password: employeeData.password || 'PayPro1245', // Default password
        role: 'employee',
        companyId: user.companyId
      };

      console.log('Registering employee with salary:', newEmployee.salary);
      console.log('Registering employee with attendance:', newEmployee.attendance);

      // Add to mock users
      mockUsers.push(newEmployee);

      // Save updated mockUsers to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

      console.log('New employee registered:', newEmployee);

      return true;
    } catch (err) {
      setError(err.message || 'An error occurred during employee registration');
      throw err;
    }
  };

  // Function to get employees for the current company
  const getCompanyEmployees = () => {
    if (!user || !user.companyId) {
      return [];
    }

    // Use the getAllEmployeeIds function with the current company ID
    return getAllEmployeeIds(user.companyId);
  };

  // Function to remove all employees for a specific company (admin only)
  const removeAllEmployees = (companyId) => {
    setError('');
    try {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new Error('Only admin accounts can remove all employees');
      }

      if (!companyId) {
        throw new Error('Company ID is required');
      }

      // Filter out all employees for the specified company
      const updatedUsers = mockUsers.filter(u => !(u.role === 'employee' && u.companyId === companyId));

      // Calculate how many employees were removed
      const removedCount = mockUsers.length - updatedUsers.length;

      // Update mockUsers
      mockUsers = updatedUsers;

      // Save updated mockUsers to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

      console.log(`Removed ${removedCount} employees for company ID: ${companyId}`);

      return removedCount;
    } catch (err) {
      setError(err.message || 'An error occurred while removing employees');
      throw err;
    }
  };

  // Verify password for the current user
  const verifyPassword = (password) => {
    if (!user) return false;
    const foundUser = mockUsers.find(u => u.id === user.id);
    return foundUser && foundUser.password === password;
  };

  // Value object that will be passed to any consumer components
  const value = {
    user,
    companyData,
    loading,
    error,
    login,
    logout,
    register,
    loginEmployee,
    registerEmployee,
    getAllCompanies,
    getAllUsers,
    getAllEmployeeIds,
    getCompanyEmployees,
    removeAllEmployees,
    updateSubscription,
    deleteAccount,
    changePassword,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    verifyPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
