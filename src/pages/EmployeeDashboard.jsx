import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { User, FileText, Calendar, DollarSign } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Get the daily rate from user data
  const dailyRate = user?.salary || 0;

  // Use the actual attendance value from user data or default to 26 days
  // Log the attendance value to debug
  console.log('User data:', user);
  console.log('User attendance data:', user?.attendance);
  const attendance = user?.attendance || 26;
  console.log('Using attendance value:', attendance);

  // Calculate salary components exactly as specified in the README.md
  // Monthly Salary: Daily Rate × Attendance (float)
  const monthlySalary = dailyRate * attendance;

  // VDA: Fixed at 135.32
  const vda = 135.32;

  // PL (Paid Leave): ((Daily Salary + VDA) / 30) × 1.5
  const pl = ((dailyRate + vda) / 30) * 1.5;

  // Bonus: (Daily Salary + VDA) × Bonus % (assuming 8.33% bonus)
  const bonusPercentage = 0.0833; // 8.33%
  const bonus = (dailyRate + vda) * bonusPercentage;

  // Calculate gross earnings
  const grossEarnings = monthlySalary + vda + pl + bonus;

  // ESI - Employee: 0.75% of gross earnings
  const esiEmployee = grossEarnings * 0.0075;

  // ESI - Employer: 3.25% of gross earnings
  const esiEmployer = grossEarnings * 0.0325;

  // PF - Employee: 12% of monthly salary
  const pfEmployee = monthlySalary * 0.12;

  // PF - Employer: 13% of monthly salary
  const pfEmployer = monthlySalary * 0.13;

  // Professional Tax (fixed amount)
  const professionalTax = 200;

  // Total deductions
  const totalDeductions = esiEmployee + pfEmployee + professionalTax;

  // Net salary
  const netSalary = grossEarnings - totalDeductions;

  // CTC (Cost to Company) - includes employer contributions
  const ctc = grossEarnings + esiEmployer + pfEmployer;

  // Use actual user data from auth context with calculated salary details
  const employeeData = {
    name: user?.name || 'Employee Name',
    id: user?.id || 'EMP001',
    department: user?.department || 'Department',
    position: user?.position || 'Position',
    joinDate: user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : '01/01/2023',
    dailyRate: dailyRate,
    attendance: attendance,
    salary: {
      monthly: monthlySalary,
      vda: vda,
      pl: pl,
      bonus: bonus,
      pfEmployee: pfEmployee,
      pfEmployer: pfEmployer,
      esiEmployee: esiEmployee,
      esiEmployer: esiEmployer,
      professionalTax: professionalTax,
      totalDeductions: totalDeductions,
      gross: grossEarnings,
      net: netSalary,
      ctc: ctc
    },
    attendanceDetails: {
      // Keep the exact attendance value as is - don't convert to whole days
      present: attendance,
      // We don't need to calculate absent days since we're showing the exact attendance
      absent: 0,
      // No need to separate into partial days
      partial: 0,
      // Total attendance is the actual attendance value
      total: attendance
    }
  };

  // Log user data for debugging
  console.log('Employee user data:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md py-4`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Employee Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>{employeeData.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <User size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{employeeData.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">ID: {employeeData.id}</p>
              <p className="text-gray-600 dark:text-gray-400">{employeeData.position} - {employeeData.department}</p>
              <p className="text-gray-600 dark:text-gray-400">Joined: {employeeData.joinDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Salary Information</h3>
              <DollarSign size={24} className="text-green-600 dark:text-green-400" />
            </div>

            {/* Daily Rate */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Daily Wage Rate:</span>
                <span className="font-bold">₹{parseFloat(employeeData.dailyRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Monthly Salary = Daily Rate × Attendance ({parseFloat(employeeData.attendance).toFixed(2)} days)</span>
                  <span>₹{parseFloat(employeeData.dailyRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })} × {parseFloat(employeeData.attendance).toFixed(2)} = ₹{parseFloat(employeeData.salary.monthly).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Earnings Breakdown</h4>
              <div className="space-y-2">
                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Salary:</span>
                    <span>₹{parseFloat(employeeData.salary.monthly).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Daily Rate × Attendance = ₹{parseFloat(employeeData.dailyRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })} × {parseFloat(employeeData.attendance).toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VDA (Variable Dearness Allowance):</span>
                    <span>₹{parseFloat(employeeData.salary.vda).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Fixed amount = ₹135.32
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">PL (Paid Leave):</span>
                    <span>₹{parseFloat(employeeData.salary.pl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    ((Daily Rate + VDA) / 30) × 1.5 = ((₹{parseFloat(employeeData.dailyRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })} + ₹135.32) / 30) × 1.5
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
                    <span>₹{parseFloat(employeeData.salary.bonus).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    (Daily Rate + VDA) × 8.33% = (₹{parseFloat(employeeData.dailyRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })} + ₹135.32) × 0.0833
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Earnings (Gross Salary):</span>
                  <span>₹{parseFloat(employeeData.salary.gross).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Deductions Breakdown</h4>
              <div className="space-y-2">
                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Provident Fund (PF):</span>
                    <span>₹{parseFloat(employeeData.salary.pfEmployee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    12% of Monthly Salary = ₹{parseFloat(employeeData.salary.monthly).toLocaleString('en-IN', { minimumFractionDigits: 2 })} × 0.12
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Employee State Insurance (ESI):</span>
                    <span>₹{parseFloat(employeeData.salary.esiEmployee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    0.75% of Gross Earnings = ₹{parseFloat(employeeData.salary.gross).toLocaleString('en-IN', { minimumFractionDigits: 2 })} × 0.0075
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Professional Tax:</span>
                    <span>₹{parseFloat(employeeData.salary.professionalTax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Fixed amount = ₹200.00
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Deductions:</span>
                  <span>₹{parseFloat(employeeData.salary.totalDeductions).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* CTC Information */}
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Cost to Company (CTC):</span>
                <span className="font-bold">₹{parseFloat(employeeData.salary.ctc).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Employer PF Contribution (13%):</span>
                  <span>₹{parseFloat(employeeData.salary.pfEmployer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Employer ESI Contribution (3.25%):</span>
                  <span>₹{parseFloat(employeeData.salary.esiEmployer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between font-bold">
                <span>Net Salary:</span>
                <span>₹{parseFloat(employeeData.salary.net).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Amount credited to your bank account
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attendance</h3>
              <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-700 dark:text-gray-300">Attendance:</span>
                <span>{parseFloat(employeeData.attendance).toFixed(2)} days</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <p>This is the exact attendance value from the Excel sheet, preserved as a float for accurate salary calculations.</p>
                <p>Decimal values represent partial days worked (e.g., 23.5 means 23 full days and a half day).</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Payslips</h3>
              <FileText size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span>April 2023</span>
                  <span className="text-blue-600 dark:text-blue-400">Download</span>
                </div>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span>March 2023</span>
                  <span className="text-blue-600 dark:text-blue-400">Download</span>
                </div>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span>February 2023</span>
                  <span className="text-blue-600 dark:text-blue-400">Download</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Coming Soon</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            More features for employees will be added soon, including:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-400">
            <li>Leave application and tracking</li>
            <li>Performance reviews</li>
            <li>Document uploads</li>
            <li>Communication with HR</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
