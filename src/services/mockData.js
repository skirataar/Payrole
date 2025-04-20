// Mock data service for when the backend is not available

/**
 * Generate mock data for testing
 * @returns {Object} - Mock data object
 */
export const generateMockData = () => {
  return {
    companies: [
      {
        name: "Golana",
        employees: [
          {
            employee_id: "GO1001",
            name: "John Doe",
            daily_salary: 500,
            attendance_days: 22.5,
            vda_rate: 135.32,
            pl: 21.18,
            bonus_rate: 8.33,
            monthly_salary: 11250,
            vda: 3044.7,
            total_b: 14294.7,
            esi_employee: 107.21,
            esi_employer: 464.58,
            pf_employee: 1715.36,
            pf_employer: 1858.31,
            lwf_employee: 0,
            lwf_employer: 0,
            pt: 200,
            uniform_deduction: 0,
            deduction_total: 2022.57,
            net_salary: 12272.13,
            bank_transfer: 12272.13,
            status: "Unpaid"
          },
          {
            employee_id: "GO1002",
            name: "Jane Smith",
            daily_salary: 600,
            attendance_days: 23.38,
            vda_rate: 135.32,
            pl: 24.51,
            bonus_rate: 8.33,
            monthly_salary: 14028,
            vda: 3163.78,
            total_b: 17191.78,
            esi_employee: 128.94,
            esi_employer: 558.73,
            pf_employee: 2063.01,
            pf_employer: 2234.93,
            lwf_employee: 0,
            lwf_employer: 0,
            pt: 200,
            uniform_deduction: 0,
            deduction_total: 2391.95,
            net_salary: 14799.83,
            bank_transfer: 14799.83,
            status: "Unpaid"
          },
          {
            employee_id: "GO1003",
            name: "Robert Johnson",
            daily_salary: 550,
            attendance_days: 21.0,
            vda_rate: 135.32,
            pl: 22.84,
            bonus_rate: 8.33,
            monthly_salary: 11550,
            vda: 2841.72,
            total_b: 14391.72,
            esi_employee: 107.94,
            esi_employer: 467.73,
            pf_employee: 1727.01,
            pf_employer: 1870.92,
            lwf_employee: 0,
            lwf_employer: 0,
            pt: 200,
            uniform_deduction: 0,
            deduction_total: 2034.95,
            net_salary: 12356.77,
            bank_transfer: 12356.77,
            status: "Unpaid"
          }
        ],
        summary: {
          employee_count: 3,
          total_salary: 39428.73,
          total_overtime_hours: 0
        }
      }
    ],
    summary: {
      total_companies: 1,
      total_employees: 3,
      total_salary: 39428.73,
      total_overtime_hours: 0
    }
  };
};

/**
 * Mock function to simulate uploading an Excel file
 * @param {File} file - The Excel file to upload
 * @returns {Promise<Object>} - The processed data
 */
export const mockUploadExcelFile = async (file) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return generateMockData();
};
