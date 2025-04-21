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
      return true;
    }

    return false;
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
    getAllCompanies,
    getAllUsers,
    updateSubscription,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
