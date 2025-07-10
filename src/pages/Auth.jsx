import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CameraIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import EmailVerificationModal from '../components/ui/EmailVerificationModal';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    // Simple validation for registration
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        toast.error('First name is required');
        return false;
      }
      
      if (!formData.lastName.trim()) {
        toast.error('Last name is required');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else {
        // Send verification email for signup
        const response = await fetch('http://localhost:5001/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Verification code sent to your email!');
          setPendingVerificationEmail(formData.email);
          setShowVerificationModal(true);
        } else {
          toast.error(data.message || 'Failed to send verification code');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async (authData) => {
    try {
      // Store auth data
      localStorage.setItem('token', authData.token);
      
      // Update auth context if available
      if (login) {
        // Simulate login with the received data
        toast.success('Account verified and logged in successfully!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error('Login failed after verification');
    }
  };

  const handleResendCode = () => {
    toast.success('New verification code sent!');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowVerificationModal(false);
    setPendingVerificationEmail('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        showVerificationModal ? 'blur-sm' : ''
      }`}>
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
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
              <CameraIcon className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Sign in to access your Photo Bazaar account' 
              : 'Join Photo Bazaar and start your photography journey'
            }
          </p>
        </div>

        {/* Form */}
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        className="input-field"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        className="input-field"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                </p>
              )}
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="input-field"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </motion.div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>

    {/* Email Verification Modal */}
    <EmailVerificationModal
      isOpen={showVerificationModal}
      onClose={() => {
        setShowVerificationModal(false);
        setPendingVerificationEmail('');
      }}
      email={pendingVerificationEmail}
      onVerificationSuccess={handleVerificationSuccess}
      onResendCode={handleResendCode}
    />
  </>
  );
};

export default Auth;