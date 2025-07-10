import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="card p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              If an account with that email exists, we've sent you a password reset link.
            </p>

            <p className="text-xs text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="btn-secondary w-full"
              >
                Try Different Email
              </button>
              
              <Link
                to="/auth"
                className="btn-primary w-full"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4"
          >
            <EnvelopeIcon className="h-6 w-6 text-primary-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't worry, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input-field"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the email address associated with your account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
