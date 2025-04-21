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
      
      return newData;
    });
  };
  
  // Value object that will be passed to any consumer components
  const value = {
    currentCompanyId,
    uploadedData,
    setUploadedData,
    updateMonthData
  };
  
  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
