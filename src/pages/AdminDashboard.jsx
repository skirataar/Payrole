import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Calendar, DollarSign, CheckCircle, XCircle, Edit, Trash } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { user, getAllCompanies, getAllUsers, updateSubscription, loading } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'basic',
    status: 'active',
    expiresAt: ''
  });

  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load companies and users
  useEffect(() => {
    if (user && user.role === 'admin') {
      const companyData = getAllCompanies();
      const userData = getAllUsers();

      if (companyData) setCompanies(companyData);
      if (userData) setUsers(userData.filter(u => u.role === 'company'));
    }
  }, [user, getAllCompanies, getAllUsers]);

  const handleEditSubscription = (company) => {
    const companyUser = users.find(u => u.companyId === company.id);
    if (companyUser && companyUser.subscription) {
      setSubscriptionData({
        plan: companyUser.subscription.plan || 'basic',
        status: companyUser.subscription.status || 'active',
        expiresAt: companyUser.subscription.expiresAt || ''
      });
      setSelectedCompany(company);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateSubscription = () => {
    if (selectedCompany && updateSubscription(selectedCompany.id, subscriptionData)) {
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.companyId === selectedCompany.id
            ? { ...user, subscription: { ...subscriptionData } }
            : user
        )
      );
      setIsEditModalOpen(false);
      alert('Subscription updated successfully');
    } else {
      alert('Failed to update subscription');
    }
  };



  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <Users size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Companies</p>
              <h2 className="text-3xl font-bold dark:text-white">{companies.length}</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full shadow-sm">
              <Building className="text-blue-600 dark:text-blue-400" size={26} />
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Subscriptions</p>
              <h2 className="text-3xl font-bold dark:text-white">
                {users.filter(u => u.subscription?.status === 'active').length}
              </h2>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-full shadow-sm">
              <CheckCircle className="text-green-600 dark:text-green-400" size={26} />
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Premium Plans</p>
              <h2 className="text-3xl font-bold dark:text-white">
                {users.filter(u => u.subscription?.plan === 'premium').length}
              </h2>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3.5 rounded-full shadow-sm">
              <DollarSign className="text-purple-600 dark:text-purple-400" size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700 overflow-hidden`}>
        <div className="px-6 py-5 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <Building size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Company Subscriptions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expires
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => {
                  const company = companies.find(c => c.id === user.companyId);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.subscription?.plan === 'premium'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {user.subscription?.plan || 'basic'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.subscription?.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {user.subscription?.status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.subscription?.expiresAt || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <button
                          onClick={() => handleEditSubscription(company)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">No companies found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subscription Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <h3 className="text-lg font-medium mb-4">Edit Subscription</h3>
            <p className="mb-4">Company: {selectedCompany?.name}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subscription Plan</label>
              <select
                value={subscriptionData.plan}
                onChange={(e) => setSubscriptionData({...subscriptionData, plan: e.target.value})}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={subscriptionData.status}
                onChange={(e) => setSubscriptionData({...subscriptionData, status: e.target.value})}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Expiration Date</label>
              <input
                type="date"
                value={subscriptionData.expiresAt}
                onChange={(e) => setSubscriptionData({...subscriptionData, expiresAt: e.target.value})}
                className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubscription}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard;
