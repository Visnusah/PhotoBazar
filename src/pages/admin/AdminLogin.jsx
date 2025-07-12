import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If authenticated but not admin, show unauthorized
  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate admin credentials
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields');
        return;
      }

      // Attempt login
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Check if user is admin
        if (result.user.role !== 'admin') {
          toast.error('Access denied. Admin credentials required.');
          return;
        }
        
        toast.success('Welcome back, Administrator!');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.message || 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <CameraIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            PhotoBazaar Administration
          </h1>
          <p className="text-blue-200">
            Secure Management Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Administrator Access
            </h2>
            <p className="text-gray-600">
              Please verify your administrator credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* <UserIcon className="h-5 w-5 text-gray-400" /> */}
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your admin email address"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Administrator Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field pr-10 pl-4"
                        placeholder="Enter your secure password"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="flex items-center"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-semibold mb-2">Demo Administrator Credentials</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded px-2 py-1">
                    <span className="font-medium">Email:</span> 
                    <span className="font-mono text-blue-800">admin@photobazaar.com</span>
                  </div>
                  <div className="flex items-center justify-between bg-white bg-opacity-50 rounded px-2 py-1">
                    <span className="font-medium">Password:</span> 
                    <span className="font-mono text-blue-800">admin123</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 italic">
                  ⚡ Use these credentials for testing purposes
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full">
              <LockClosedIcon className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600 font-medium">
                Secure Administrative Portal • All Activities Monitored
              </p>
            </div>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-blue-200 hover:text-white text-sm transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to PhotoBazaar Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
