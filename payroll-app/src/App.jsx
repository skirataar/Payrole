import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import Dashboard from './pages/Dashboard';
import UploadExcel from './pages/UploadExcel';
import SalaryReport from './pages/SalaryReport';
import Settings from './pages/Settings';

// Import layout
import Layout from './components/Layout';

// Import theme provider
import { ThemeProvider } from './context/ThemeContext';

function App() {
  // State to store uploaded data with localStorage persistence
  const [uploadedData, setUploadedData] = useState(() => {
    const savedData = localStorage.getItem('uploadedData');
    return savedData ? JSON.parse(savedData) : { monthlyData: {}, companies: [] };
  });

  // Update localStorage when uploadedData changes
  useEffect(() => {
    localStorage.setItem('uploadedData', JSON.stringify(uploadedData));
  }, [uploadedData]);

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

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard uploadedData={uploadedData} setUploadedData={setUploadedData} />} />
            <Route path="/upload" element={<UploadExcel setUploadedData={setUploadedData} updateMonthData={updateMonthData} />} />
            <Route path="/salary-report" element={<SalaryReport uploadedData={uploadedData} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
