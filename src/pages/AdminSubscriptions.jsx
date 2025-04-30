import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Edit, AlertTriangle, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminSubscriptions = () => {
  const { user, getAllCompanies, getAllUsers, updateSubscription, deleteAccount, loading } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAccount = () => {
    if (userToDelete && deleteAccount(userToDelete.id)) {
      // Update local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
      setCompanies(prevCompanies => prevCompanies.filter(c => c.id !== userToDelete.companyId));
      setIsDeleteModalOpen(false);
      alert('Account deleted successfully');
    } else {
      alert('Failed to delete account');
    }
    setUserToDelete(null);
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expiresAt) => {
    if (!expiresAt) return null;

    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} min-h-screen`}>
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <CreditCard size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        Subscription Management
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Subscriptions</p>
              <h2 className="text-3xl font-bold dark:text-white">{users.length}</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full shadow-sm">
              <CreditCard className="text-blue-600 dark:text-blue-400" size={26} />
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Expiring Soon</p>
              <h2 className="text-3xl font-bold dark:text-white">
                {users.filter(u => {
                  const daysLeft = getDaysUntilExpiration(u.subscription?.expiresAt);
                  return daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
                }).length}
              </h2>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3.5 rounded-full shadow-sm">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700 overflow-hidden`}>
        <div className="px-6 py-5 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <CreditCard size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
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
                  Days Left
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
                  const daysLeft = getDaysUntilExpiration(user.subscription?.expiresAt);

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
                            : user.subscription?.plan === 'enterprise'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {daysLeft !== null ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            daysLeft <= 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : daysLeft <= 7
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                              : daysLeft <= 30
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleEditSubscription(company)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            title="Edit subscription"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete account"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">No subscriptions found</p>
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

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <h3 className="text-lg font-medium mb-4">Delete Account</h3>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4 text-red-500">
                <Trash2 size={48} />
              </div>
              <p className="mb-2">Are you sure you want to delete the following account?</p>
              <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                <p><strong>Company:</strong> {userToDelete.name}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
              </div>
              <p className="text-red-500 font-medium">This action cannot be undone. All data associated with this account will be permanently deleted.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
