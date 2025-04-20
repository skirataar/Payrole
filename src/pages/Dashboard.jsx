import React from 'react';
import { BarChart3, ArrowUp, ArrowDown, Users, DollarSign } from 'lucide-react';

const Dashboard = ({ uploadedData }) => {
  // Calculate summary data
  const totalEmployees = uploadedData?.companies?.reduce((sum, company) => 
    sum + company.employees.length, 0) || 0;
  
  const totalSalary = uploadedData?.companies?.reduce((sum, company) => 
    sum + company.summary.total_salary, 0) || 0;
  
  const recentEmployees = uploadedData?.companies?.flatMap(company => 
    company.employees.slice(0, 5).map(emp => ({...emp, company: company.name}))
  )?.slice(0, 5) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Employees</p>
              <h2 className="text-2xl font-bold">{totalEmployees}</h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-500 font-medium">4%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Salary</p>
              <h2 className="text-2xl font-bold">₹{totalSalary.toLocaleString()}</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-500 font-medium">2.5%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Salary</p>
              <h2 className="text-2xl font-bold">
                ₹{totalEmployees ? Math.round(totalSalary / totalEmployees).toLocaleString() : 0}
              </h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowDown className="text-red-500 mr-1" size={16} />
            <span className="text-red-500 font-medium">1.2%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Companies</p>
              <h2 className="text-2xl font-bold">{uploadedData?.companies?.length || 0}</h2>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-500 font-medium">0%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>
      
      {/* Recent Employees */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Recent Employees</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{employee.net_salary?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No employee data available. Please upload an Excel file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
