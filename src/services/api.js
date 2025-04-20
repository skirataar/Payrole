// API service for interacting with the backend

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Upload an Excel file to the server
 * @param {File} file - The Excel file to upload
 * @returns {Promise<Object>} - The processed data
 */
export const uploadExcelFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload_excel_by_position`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Clear all data from the database
 * @returns {Promise<Object>} - The response from the server
 */
export const clearDatabase = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-data`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to clear database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

/**
 * Get all companies
 * @returns {Promise<Array>} - The list of companies
 */
export const getCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get companies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

/**
 * Get employees for a specific company
 * @param {string} companyId - The ID of the company
 * @returns {Promise<Array>} - The list of employees
 */
export const getEmployees = async (companyId) => {
  try {
    const url = companyId 
      ? `${API_BASE_URL}/employees?company_id=${encodeURIComponent(companyId)}`
      : `${API_BASE_URL}/employees`;
      
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get employees');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};
