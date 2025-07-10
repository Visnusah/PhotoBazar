import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationNotice = () => {
  const { user, resendVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    
    try {
      await resendVerification(user.email);
      setEmailSent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

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
            {emailSent ? (
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-16 w-16 text-orange-500" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {emailSent ? 'Email Sent!' : 'Verify Your Email'}
          </h2>

          {emailSent ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We've sent a new verification email to <strong>{user?.email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please verify your email address to access all features of PhotoBazaar.
              </p>
              <p className="text-sm text-gray-600">
                We sent a verification email to <strong>{user?.email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Check your inbox and click the verification link. Don't forget to check your spam folder!
              </p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {!emailSent && (
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
            )}

            <button
              onClick={logout}
              className="btn-secondary w-full"
            >
              Logout
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-500">
              Having trouble? Contact support at{' '}
              <a href="mailto:support@photobazaar.com" className="text-primary-600 hover:text-primary-700">
                support@photobazaar.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationNotice;
