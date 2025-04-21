import axios from 'axios';

const payrollApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPayrollExcel = async (file, reportMonth = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (reportMonth) {
    formData.append('report_month', reportMonth);
  }

  try {
    const response = await payrollApi.post('/upload-payroll', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error.response?.data || error;
  }
};

export const getPayrollEntries = async (month = null) => {
  try {
    const params = month ? { month } : {};
    const response = await payrollApi.get('/payroll-entries', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payroll entries:', error);
    throw error.response?.data || error;
  }
};

export const getPayrollEntry = async (id) => {
  try {
    const response = await payrollApi.get(`/payroll-entries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payroll entry ${id}:`, error);
    throw error.response?.data || error;
  }
};

export default payrollApi;
