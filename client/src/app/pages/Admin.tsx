import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Package, Shield, Search, MoreVertical, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { authAPI, productsAPI } from '../services/api';

const TabButton = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm transition-all relative ${
      active ? 'text-[#1E3A8A]' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeAdminTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]"
      />
    )}
  </button>
);

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [liveResources, setLiveResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([authAPI.getUsers(), productsAPI.getAll()])
      .then(([usersRes, productsRes]) => {
        setLiveUsers(usersRes.data);
        setLiveResources(productsRes.data);
      })
      .catch(err => {
        console.error('Admin Fetch Error:', err);
        setError(err.response?.data?.msg || 'Failed to fetch administrative data. You may not have sufficient permissions.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = liveUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = liveResources.filter(resource =>
    (resource.label || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low Stock
          </span>
        );
      case 'Critical':
        return (
          <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users and resources</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl text-gray-900">{liveUsers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#1E3A8A]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resource Items</p>
                <p className="text-3xl text-gray-900">{liveResources.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#14B8A6]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin Users</p>
                <p className="text-3xl text-gray-900">
                  {liveUsers.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#F97316]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4 flex gap-4">
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              User Management
            </TabButton>
            <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')}>
              Resource Inventory
            </TabButton>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'users' ? 'Search users...' : 'Search resources...'}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">User</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Role</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Joined</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A] mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Fetching live data...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 font-bold uppercase tracking-widest">{error}</p>
                        <p className="text-xs text-gray-500 mt-2">Try logging out and back in to refresh your permissions.</p>
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-md text-[10px] font-black uppercase tracking-widest">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.active ? 'Active' : 'Inactive')}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{user.tasksCompleted || 0}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Item</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Category</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#14B8A6] mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Reading inventory...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 font-bold uppercase tracking-widest">Resource Access Error</p>
                        <p className="text-xs text-gray-500 mt-2">{error}</p>
                      </td>
                    </tr>
                  ) : filteredResources.map((resource) => (
                    <motion.tr
                      key={resource._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{resource.label || resource.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-md text-[10px] font-black uppercase tracking-widest">
                          {resource.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {resource.quantity || 'N/A'} {resource.unit || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStockBadge(resource.status || (resource.quantity > 50 ? 'In Stock' : 'Low Stock'))}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {resource.updatedAt ? new Date(resource.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
