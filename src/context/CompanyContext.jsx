import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the company context
const CompanyContext = createContext();

// Custom hook to use the company context
export const useCompany = () => useContext(CompanyContext);

// Provider component
export const CompanyProvider = ({ children }) => {
  const { user, registerEmployee } = useAuth();
  const [currentCompanyId, setCurrentCompanyId] = useState('default');

  // State to store uploaded data with localStorage persistence
  const [uploadedData, setUploadedData] = useState({ monthlyData: {}, companies: [] });

  // Update current company ID when user changes
  useEffect(() => {
    if (user?.companyId) {
      const companyId = user.companyId;
      console.log(`User logged in, switching to company: ${companyId}`);
      setCurrentCompanyId(companyId);

      // Load company-specific data
      const savedData = localStorage.getItem(`uploadedData_${companyId}`);
      if (savedData) {
        setUploadedData(JSON.parse(savedData));
        console.log(`Loaded data for company: ${companyId}`);
      } else {
        // Initialize empty data for new company
        setUploadedData({ monthlyData: {}, companies: [] });
        console.log(`No saved data found for company: ${companyId}, initialized empty data`);
      }
    } else {
      // Reset to default if no user or no company ID
      setCurrentCompanyId('default');
      const savedData = localStorage.getItem('uploadedData');
      if (savedData) {
        setUploadedData(JSON.parse(savedData));
      } else {
        setUploadedData({ monthlyData: {}, companies: [] });
      }
    }
  }, [user]);

  // Update localStorage when uploadedData changes
  useEffect(() => {
    if (currentCompanyId) {
      // Store data with company-specific key
      localStorage.setItem(`uploadedData_${currentCompanyId}`, JSON.stringify(uploadedData));
      console.log(`Saved data for company: ${currentCompanyId}`);

      // Also store in the default key for backward compatibility
      if (currentCompanyId === 'default') {
        localStorage.setItem('uploadedData', JSON.stringify(uploadedData));
      }
    }
  }, [uploadedData, currentCompanyId]);

  // Update month data with new uploaded data
  const updateMonthData = (data, month) => {
    if (!data || !data.companies) return;

    console.log('Processing uploaded data for month:', month);
    let totalEmployees = 0;

    setUploadedData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };

      // Initialize monthlyData if it doesn't exist
      if (!newData.monthlyData) {
        newData.monthlyData = {};
      }

      // Store the data for this month
      newData.monthlyData[month] = data;

      // Also update the current companies data for backward compatibility
      newData.companies = data.companies || [];

      // Initialize employees array if it doesn't exist
      if (!newData.employees) {
        newData.employees = [];
      }

      data.companies.forEach(company => {
        if (company.employees && Array.isArray(company.employees)) {
          company.employees.forEach(employee => {
            const employeeId = employee.employee_id || employee.id;
            const employeeName = employee.name;
            
            if (employeeId && employeeName) {
              // Extract attendance from the correct field
              const attendance = employee.attendance || employee.attendance_days || employee.total || 26;
              console.log(`Extracted attendance for ${employeeId}: ${attendance}`);

              // Prefer monthly_salary for Employee Management salary field
              const salary = employee.monthly_salary || employee.salary || employee.basic_rate || employee.daily_rate || employee.net_salary || 0;

              // Extract join date from the correct field
              const joinDate = employee.joinDate || employee.join_date || new Date().toISOString().split('T')[0];

              // Check if employee already exists
              const existingIndex = newData.employees.findIndex(emp => emp.id === employeeId);

              if (existingIndex >= 0) {
                // Update existing employee
                newData.employees[existingIndex] = {
                  ...newData.employees[existingIndex],
                  name: employeeName,
                  salary: salary,
                  attendance: attendance,
                  joinDate: joinDate,
                  position: employee.position || '',
                  department: employee.department || ''
                };
                console.log(`Updated existing employee from Excel: ${employeeId} - ${employeeName}`);
              } else {
                // Add new employee
                newData.employees.push({
                  id: employeeId,
                  name: employeeName,
                  position: employee.position || '',
                  department: employee.department || '',
                  salary: salary,
                  attendance: attendance,
                  joinDate: joinDate,
                  role: 'employee',
                  companyId: user?.companyId || 'default'
                });
                console.log(`Added employee from Excel: ${employeeId} - ${employeeName}`);
              }

              totalEmployees++;
            }
          });
        }
      });

      console.log(`Total employees after processing: ${totalEmployees}`);

      // Register all employees for login access
      registerEmployeesForLogin(newData.employees);

      return newData;
    });

    saveCompanyData(uploadedData);
  };

  // Register employees for login access
  const registerEmployeesForLogin = async (employees) => {
    if (!employees || !Array.isArray(employees)) return;

    console.log('Registering employees for login access...');
    
    for (const employee of employees) {
      try {
        // Create employee data for registration
        const employeeData = {
          id: employee.id,
          name: employee.name,
          position: employee.position || '',
          department: employee.department || '',
          salary: employee.salary || 0,
          attendance: employee.attendance || 26,
          joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
          password: 'PayPro1245', // Default password for all employees
          role: 'employee',
          companyId: user?.companyId || 'default'
        };

        // Register the employee in the auth system
        await registerEmployee(employeeData);
        console.log(`Registered employee for login: ${employee.id} - ${employee.name}`);
      } catch (error) {
        // If employee already exists, just ignore the error
        if (!error.message.includes('already exists')) {
          console.error(`Error registering employee ${employee.id} for login:`, error.message);
        }
      }
    }
  };

  // Function to add a new employee
  const addEmployee = (employeeData) => {
    if (!employeeData) return false;

    // Extract employee ID from different possible formats
    const employeeId = employeeData.id || employeeData.employee_id || employeeData.card_no || '';

    if (!employeeId) {
      console.error('Cannot add employee: No valid ID found');
      return false;
    }

    try {
      setUploadedData(prevData => {
        // Create a copy of the previous data
        const newData = { ...prevData };

        // Initialize employees array if it doesn't exist
        if (!newData.employees) {
          newData.employees = [];
        }

        // Check if employee already exists
        const existingEmployeeIndex = newData.employees.findIndex(emp => emp.id === employeeId);

        // Normalize the employee data
        const normalizedEmployeeData = {
          id: employeeId,
          name: employeeData.name || employeeData.employee_name || '',
          position: employeeData.position || employeeData.designation || '',
          department: employeeData.department || '',
          salary: employeeData.salary || employeeData.basic_rate || employeeData.daily_rate || 0,
          attendance: parseFloat(employeeData.attendance || employeeData.attendance_days || employeeData.total || 26),
          joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0],
          role: 'employee',
          companyId: employeeData.companyId
        };

        console.log('Adding/updating employee in CompanyContext:', normalizedEmployeeData);

        if (existingEmployeeIndex >= 0) {
          // Update existing employee
          newData.employees[existingEmployeeIndex] = {
            ...newData.employees[existingEmployeeIndex],
            ...normalizedEmployeeData
          };
          console.log('Updated existing employee:', newData.employees[existingEmployeeIndex]);
        } else {
          // Add new employee
          newData.employees = [...newData.employees, normalizedEmployeeData];
          console.log('Added new employee to list');
        }

        return newData;
      });

      return true;
    } catch (error) {
      console.error('Error adding employee:', error);
      return false;
    }
  };

  // Function to update an existing employee
  const updateEmployee = (employeeId, updatedData) => {
    if (!employeeId) return false;

    try {
      setUploadedData(prevData => {
        // Create a copy of the previous data
        const newData = { ...prevData };

        // Check if employees array exists
        if (!newData.employees || !Array.isArray(newData.employees)) {
          return prevData;
        }

        // Find the employee to update
        const employeeIndex = newData.employees.findIndex(emp => emp.id === employeeId);

        if (employeeIndex >= 0) {
          // Normalize the updated data
          const normalizedUpdatedData = {
            ...updatedData,
            id: employeeId, // Ensure ID doesn't change
            role: 'employee', // Ensure role doesn't change
            companyId: newData.employees[employeeIndex].companyId // Preserve company ID
          };

          console.log('Updating employee in CompanyContext:', {
            id: employeeId,
            ...normalizedUpdatedData
          });

          // Update the employee
          newData.employees[employeeIndex] = {
            ...newData.employees[employeeIndex],
            ...normalizedUpdatedData
          };

          console.log('Updated employee:', newData.employees[employeeIndex]);

          return newData;
        }

        console.warn(`Employee with ID ${employeeId} not found for update`);
        return prevData;
      });

      return true;
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  };

  // Function to delete an employee
  const deleteEmployee = (employeeId) => {
    if (!employeeId) return false;

    try {
      setUploadedData(prevData => {
        // Create a copy of the previous data
        const newData = { ...prevData };

        // Check if employees array exists
        if (!newData.employees || !Array.isArray(newData.employees)) {
          return prevData;
        }

        // Filter out the employee to delete
        newData.employees = newData.employees.filter(emp => emp.id !== employeeId);

        return newData;
      });

      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  };

  // Function to get employees for the current company
  const getCompanyEmployees = () => {
    if (!uploadedData.employees || !Array.isArray(uploadedData.employees)) {
      return [];
    }

    // Filter employees by company ID
    return uploadedData.employees.filter(emp => emp.companyId === currentCompanyId);
  };

  // Function to remove all employees for a specific company
  const removeAllEmployees = (companyId) => {
    try {
      setUploadedData(prevData => {
        // Create a copy of the previous data
        const newData = { ...prevData };

        // Check if employees array exists
        if (!newData.employees || !Array.isArray(newData.employees)) {
          return prevData;
        }

        // Filter out all employees for the specified company
        const originalLength = newData.employees.length;
        newData.employees = newData.employees.filter(emp => emp.companyId !== companyId);

        // Calculate how many employees were removed
        const removedCount = originalLength - newData.employees.length;
        console.log(`Removed ${removedCount} employees for company ID: ${companyId} from CompanyContext`);

        return newData;
      });

      return true;
    } catch (error) {
      console.error('Error removing employees:', error);
      return false;
    }
  };

  // Value object that will be passed to any consumer components
  const value = {
    currentCompanyId,
    uploadedData,
    setUploadedData,
    updateMonthData,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getCompanyEmployees,
    removeAllEmployees,
    employees: uploadedData.employees || []
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
