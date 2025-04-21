import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee } from '../services/attendancePayrollApi';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    basic_rate: 0
  });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await getEmployees();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        setError(err.detail || err.message || 'Failed to fetch employees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(employee => 
        employee.name.toLowerCase().includes(query) || 
        employee.employee_id.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basic_rate' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (isEditing) {
        // Update existing employee
        result = await updateEmployee(formData.employee_id, formData);
        
        // Update employees list
        setEmployees(prev => 
          prev.map(emp => emp.employee_id === result.employee_id ? result : emp)
        );
      } else {
        // Create new employee
        result = await createEmployee(formData);
        
        // Add to employees list
        setEmployees(prev => [...prev, result]);
      }
      
      // Reset form
      setFormData({
        employee_id: '',
        name: '',
        basic_rate: 0
      });
      setIsFormOpen(false);
      setIsEditing(false);
      
    } catch (err) {
      setError(err.detail || err.message || 'Failed to save employee');
    }
  };

  // Handle edit employee
  const handleEdit = (employee) => {
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      basic_rate: employee.basic_rate
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Employee Management</h2>

      {/* Search and Add */}
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <button
          onClick={() => {
            setIsFormOpen(true);
            setIsEditing(false);
            setFormData({
              employee_id: '',
              name: '',
              basic_rate: 0
            });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Employee Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Basic Rate (Daily)</label>
                <input
                  type="number"
                  name="basic_rate"
                  value={formData.basic_rate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
          <p>No employees found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Rate (Daily)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employee_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{employee.basic_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
