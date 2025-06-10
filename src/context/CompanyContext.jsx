import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the company context
const CompanyContext = createContext();

// Custom hook to use the company context
export const useCompany = () => useContext(CompanyContext);

// Provider component
export const CompanyProvider = ({ children }) => {
  const { user } = useAuth();
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

  // Function to update data for a specific month
  const updateMonthData = (data, month) => {
    if (!month) return;

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

      // Extract employees from the uploaded data and add them to the employees array
      if (data.companies && Array.isArray(data.companies)) {
        // Initialize employees array if it doesn't exist
        if (!newData.employees) {
          newData.employees = [];
        }

        // Process each company's employees
        data.companies.forEach(company => {
          if (company.employees && Array.isArray(company.employees)) {
            company.employees.forEach(employee => {
              // Extract employee ID and name
              const employeeId = employee.id || employee.employee_id || employee.card_no || '';
              const employeeName = employee.name || employee.employee_name || '';

              // Only process if we have an ID and name
              if (employeeId && employeeName) {
                // Check if this employee already exists in our list
                const existingIndex = newData.employees.findIndex(emp => emp.id === employeeId);

                // Extract salary from the correct field
                const salary = employee.basic_rate || employee.daily_rate || employee.net_salary || 0;

                // Extract attendance from the correct field
                const attendance = employee.attendance_days || employee.attendance || employee.total || 26;

                // Log the attendance value for debugging
                console.log(`Extracted attendance for ${employeeId}: ${attendance}`);

                if (existingIndex === -1) {
                  // Add new employee
                  newData.employees.push({
                    id: employeeId,
                    name: employeeName,
                    position: employee.position || employee.designation || '',
                    department: employee.department || '',
                    salary: salary,
                    attendance: parseFloat(attendance), // Store as float
                    joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
                    role: 'employee',
                    companyId: currentCompanyId
                  });

                  console.log(`Added employee from Excel: ${employeeId} - ${employeeName}`);
                } else {
                  // Update existing employee
                  newData.employees[existingIndex] = {
                    ...newData.employees[existingIndex],
                    name: employeeName,
                    salary: salary,
                    attendance: parseFloat(attendance) // Store as float
                  };

                  console.log(`Updated existing employee from Excel: ${employeeId} - ${employeeName}`);
                }
              }
            });
          }
        });

        console.log(`Total employees after processing: ${newData.employees.length}`);
      }

      return newData;
    });
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
    removeAllEmployees
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
