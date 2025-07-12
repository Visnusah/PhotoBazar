import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  PhotoIcon,
  UsersIcon,
  TagIcon,
  EyeIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Ensure only admin can access
  if (user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Simulate API calls - replace with actual API endpoints
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalOrders: 1247,
          totalProducts: 2856,
          totalCustomers: 892,
          loading: false
        });

        setRecentActivity([
          { id: 1, type: 'order', message: 'New order #1248 received', time: '2 minutes ago' },
          { id: 2, type: 'upload', message: 'User uploaded "Sunset Landscape"', time: '5 minutes ago' },
          { id: 3, type: 'sale', message: 'Photo "Ocean Waves" sold for $25', time: '8 minutes ago' },
          { id: 4, type: 'user', message: 'New user John Doe registered', time: '12 minutes ago' },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with PhotoBazaar today.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.loading ? 0 : stats.totalOrders.toLocaleString()}
          icon={ShoppingBagIcon}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        
        <StatCard
          title="Total Products"
          value={stats.loading ? 0 : stats.totalProducts.toLocaleString()}
          icon={PhotoIcon}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        
        <StatCard
          title="Total Customers"
          value={stats.loading ? 0 : stats.totalCustomers.toLocaleString()}
          icon={UsersIcon}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
              <UsersIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats.totalCustomers.toLocaleString()
                  )}
                </p>
                <p className="text-sm text-gray-600">Total Registered Users</p>
              </div>
              <Link 
                to="/admin/customers"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Customers
                <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <EyeIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'upload' ? 'bg-green-500' :
                    activity.type === 'sale' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                to="/admin/activity"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/categories"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="text-center">
              <TagIcon className="w-8 h-8 mx-auto text-gray-400 group-hover:text-green-500 mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">Add Categories</p>
            </div>
          </Link>
          
          <Link
            to="/admin/customers"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="text-center">
              <EyeIcon className="w-8 h-8 mx-auto text-gray-400 group-hover:text-purple-500 mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">View Users Data</p>
            </div>
          </Link>
          
          <Link
            to="/admin/customers"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="text-center">
              <UsersIcon className="w-8 h-8 mx-auto text-gray-400 group-hover:text-blue-500 mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Manage Users</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
