import axios from 'axios';

const attendancePayrollApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee endpoints
export const createEmployee = async (employeeData) => {
  try {
    const response = await attendancePayrollApi.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error.response?.data || error;
  }
};

export const getEmployees = async () => {
  try {
    const response = await attendancePayrollApi.get('/employees/');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error.response?.data || error;
  }
};

export const getEmployee = async (employeeId) => {
  try {
    const response = await attendancePayrollApi.get(`/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${employeeId}:`, error);
    throw error.response?.data || error;
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await attendancePayrollApi.put(`/employees/${employeeId}`, employeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${employeeId}:`, error);
    throw error.response?.data || error;
  }
};

// Attendance endpoints
export const createAttendance = async (attendanceData) => {
  try {
    const response = await attendancePayrollApi.post('/attendance/', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error.response?.data || error;
  }
};

export const getAttendanceRecords = async (employeeId = null, month = null) => {
  try {
    const params = {};
    if (employeeId) params.employee_id = employeeId;
    if (month) params.month = month;
    
    const response = await attendancePayrollApi.get('/attendance/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error.response?.data || error;
  }
};

// Payroll endpoints
export const calculatePayroll = async (payrollData) => {
  try {
    const response = await attendancePayrollApi.post('/payroll/calculate', payrollData);
    return response.data;
  } catch (error) {
    console.error('Error calculating payroll:', error);
    throw error.response?.data || error;
  }
};

export const calculateBulkPayroll = async (attendanceDataList) => {
  try {
    const response = await attendancePayrollApi.post('/payroll/calculate-bulk', attendanceDataList);
    return response.data;
  } catch (error) {
    console.error('Error calculating bulk payroll:', error);
    throw error.response?.data || error;
  }
};

export const uploadExcelAttendance = async (file, month) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    
    const response = await attendancePayrollApi.post('/payroll/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading attendance Excel:', error);
    throw error.response?.data || error;
  }
};

export const getPayrollEntries = async (employeeId = null, month = null) => {
  try {
    const params = {};
    if (employeeId) params.employee_id = employeeId;
    if (month) params.month = month;
    
    const response = await attendancePayrollApi.get('/payroll/entries', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payroll entries:', error);
    throw error.response?.data || error;
  }
};

export const getPayrollEntry = async (entryId) => {
  try {
    const response = await attendancePayrollApi.get(`/payroll/entries/${entryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payroll entry ${entryId}:`, error);
    throw error.response?.data || error;
  }
};

export default attendancePayrollApi;
