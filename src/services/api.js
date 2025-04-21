// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to get the correct API URL
const getApiUrl = (endpoint) => {
  // If the endpoint already starts with http, return it as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  // Make sure the endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return formattedEndpoint;
};

export const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    const endpoint = getApiUrl('/api/clear-data');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
    }

    // Also clear payment status data from localStorage
    localStorage.removeItem('paidEmployees');

    const data = await response.json();
    console.log('Database cleared successfully:', data);
    return data;
  } catch (error) {
    console.error('Error clearing database:', error);
    // Create a more descriptive error
    const errorMessage = error.message || 'An unknown error occurred while clearing the database';
    throw new Error(errorMessage);
  }
};

export const uploadExcelFile = async (file, month = null) => {
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

  // Add month parameter if provided
  if (month) {
    formData.append('month', month);
  }

  try {
    // Use the endpoint that creates a log file
    const endpoint = getApiUrl('/api/upload_excel_by_position');
    console.log('Uploading file to endpoint:', endpoint);
    console.log('File being uploaded:', file.name, 'Size:', file.size, 'bytes');

    // Try using fetch directly instead of axios
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      // No need to set Content-Type header, fetch will set it automatically with the boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    return data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Create a custom error object with details
    let errorMessage = 'An error occurred while uploading the file.';

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to server. Is it running at http://localhost:8000?';
    } else if (error.message.includes('404')) {
      errorMessage = 'Upload endpoint not found. Is the backend server running?';
    } else if (error.message.includes('400')) {
      errorMessage = 'Invalid file format or content. Please check the Excel file structure.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.log('Final error message:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getEmployees = async (companyId = null) => {
  try {
    const endpoint = getApiUrl('/api/employees');
    const url = companyId
      ? `${API_BASE_URL}${endpoint}?company_id=${encodeURIComponent(companyId)}`
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error.message || 'Failed to fetch employees');
  }
};

export const getCompanies = async () => {
  try {
    const endpoint = getApiUrl('/api/companies');
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error(error.message || 'Failed to fetch companies data');
  }
};

export default {
  uploadExcelFile,
  clearDatabase,
  getEmployees,
  getCompanies
};
