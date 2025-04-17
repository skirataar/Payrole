import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';  // Remove /api from base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    const response = await api.delete('/api/clear-data');
    console.log('Database cleared successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clearing database:', error);
    // Create a more descriptive error
    const errorMessage = error.response?.data?.detail ||
                         error.message ||
                         'An unknown error occurred while clearing the database';
    throw new Error(errorMessage);
  }
};

export const uploadExcelFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // Add default column mappings
  const defaultMappings = {
    'default': {
      'employee_id': 0,     // Column 1 (0-based: 0) - Card No
      'name': 1,            // Column 2 (0-based: 1) - Name
      'attendance': 2,      // Column 3 (0-based: 2) - Total days attended
      'net_salary': 3,      // Column 4 (0-based: 3) - Basic Rate (daily salary)
      'daily_allowance': 4, // Column 5 (0-based: 4) - Daily Allowance
      'nh_fh_days': 5,      // Column 6 (0-based: 5) - NH/FH days
      'ot_days': 6,         // Column 7 (0-based: 6) - OT days
      'uniform_deduction': 7, // Column 8 (0-based: 7) - Uniform Deduction
      'pt': 8,              // Column 9 (0-based: 8) - Professional Tax (PT)
      'lwf_employee_bool': 9, // Column 10 (0-based: 9) - LWF40 (boolean)
      'lwf_employer_bool': 10  // Column 11 (0-based: 10) - LWF60 (boolean)
    }
  };

  formData.append('column_mappings', JSON.stringify(defaultMappings));

  try {
    // Use the endpoint that creates a log file
    const endpoint = '/api/upload_excel_by_position';
    console.log('Uploading file to endpoint:', endpoint);

    // Set a longer timeout for large files
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for large files
    });

    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      details: error.response?.data?.detail
    });

    // Create a custom error object with details
    let errorMessage = 'An error occurred while uploading the file.';

    if (!error.response) {
      errorMessage = 'Cannot connect to server. Is it running at http://localhost:5000?';
    } else if (error.response.status === 404) {
      errorMessage = 'Upload endpoint not found. Is the backend server running?';
    } else if (error.response.status === 400) {
      errorMessage = 'Invalid file format or content. Please check the Excel file structure.';
    } else if (error.response.data?.detail) {
      errorMessage = error.response.data.detail;
    }

    const errorObj = new Error(errorMessage);

    // Add details property to the error object
    errorObj.details = error.response?.data?.detail || errorMessage;
    errorObj.status = error.response?.status || null;
    errorObj.response = error.response?.data || null;

    throw errorObj;
  }
};

export const getEmployees = async (companyId = null) => {
  try {
    const params = companyId ? { company_id: companyId } : {};
    const response = await api.get('/api/employees', { params });  // Add /api prefix
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employees');
  }
};

export const getCompanies = async () => {
  try {
    const response = await api.get('/api/companies');
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to fetch companies data');
  }
};

export default {
  uploadExcelFile,
  clearDatabase,
};
