import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { uploadExcelFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

const UploadExcel = () => {
  const { user } = useAuth();
  const { updateMonthData } = useCompany();

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [months, setMonths] = useState([]);

  // Get company ID for storing data
  const companyId = user?.companyId || 'default';

  // For debugging
  useEffect(() => {
    console.log('UploadExcel - User:', user);
    console.log('UploadExcel - Company ID:', companyId);
  }, [user, companyId]);

  // Generate months for the dropdown (current month and 11 months ahead)
  useEffect(() => {
    const generateMonths = () => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthsList = [];

      // Generate 12 months starting from current month
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth + i) % 12;
        const year = currentYear + Math.floor((currentMonth + i) / 12);
        monthsList.push(`${monthNames[monthIndex]} ${year}`);
      }

      setMonths(monthsList);
      setSelectedMonth(monthsList[0]); // Set current month as default
    };

    generateMonths();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    if (!selectedMonth) {
      setError('Please select a month for this data');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      console.log('Uploading file:', file.name, 'for month:', selectedMonth);

      // Use the uploadExcelFile service function with the selected month
      const data = await uploadExcelFile(file, selectedMonth);
      console.log('Upload successful:', data);

      // Add the month to the data
      if (data && data.companies) {
        data.month = selectedMonth;
        data.companies.forEach(company => {
          if (company.employees) {
            company.employees.forEach(employee => {
              employee.month = selectedMonth;
            });
          }
        });
      }

      // Update state with the uploaded data for this specific month
      updateMonthData(data, selectedMonth);
      setUploadStatus('success');

      // Save last upload info to localStorage with company ID
      localStorage.setItem(`lastUploadTime_${companyId}`, new Date().toISOString());
      localStorage.setItem(`lastUploadMonth_${companyId}`, selectedMonth);

      // Also save to the default key for backward compatibility
      localStorage.setItem('lastUploadTime', new Date().toISOString());
      localStorage.setItem('lastUploadMonth', selectedMonth);

      console.log(`Data saved for company ID: ${companyId}, month: ${selectedMonth}`);

      // Show success message
      alert(`File uploaded successfully for ${selectedMonth}! ${data.companies?.length || 0} companies and ${data.summary?.total_employees || 0} employees processed.`);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError(null);
      setUploadStatus(null);
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Upload Excel</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center dark:text-gray-300"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
            <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer"
            >
              Browse Files
            </label>

            {file && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Selected file: <span className="font-medium">{file.name}</span>
              </div>
            )}

            {/* Month Selector */}
            <div className="mt-6 w-full max-w-xs">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                Select Month for this Data
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <CheckCircle size={20} className="mr-2" />
            File uploaded successfully!
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded-md ${
              !file || isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Upload Instructions</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Upload an Excel file (.xlsx or .xls) containing employee data</li>
          <li>The file should have columns for Employee ID, Name, Attendance, Daily Rate, etc.</li>
          <li>Each sheet in the Excel file will be treated as a separate company</li>
          <li>Empty cells will be treated as zero values</li>
          <li>The system will automatically calculate salaries based on the uploaded data</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadExcel;
