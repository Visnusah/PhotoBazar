import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await fetch(`http://localhost:5001/api/auth/verify-email/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      } else {
        if (result.message.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
      console.error('Email verification error:', error);
    }
  };

  const resendVerification = async () => {
    const email = prompt('Please enter your email address:');
    if (!email) return;

    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <LoadingSpinner size="lg" />;
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'expired':
        return <ClockIcon className="h-16 w-16 text-orange-500" />;
      case 'error':
      default:
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'expired':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            {getStatusIcon()}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'expired' && 'Link Expired'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          <p className={`text-sm mb-6 ${getStatusColor()}`}>
            {message || 'Please wait while we verify your email address...'}
          </p>

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-600">
                You will be redirected to the login page in a few seconds...
              </p>
              <Link
                to="/auth"
                className="btn-primary w-full"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          {(status === 'expired' || status === 'error') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={resendVerification}
                className="btn-primary w-full"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Resend Verification Email
              </button>
              <Link
                to="/auth"
                className="btn-secondary w-full"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
