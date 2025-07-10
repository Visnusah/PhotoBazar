import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LockClosedIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Animated Lock Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
          className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-8"
        >
          <LockClosedIcon className="h-12 w-12 text-red-600" />
        </motion.div>

        {/* Error Code */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold text-gray-900 mb-4"
        >
          401
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-gray-800 mb-4"
        >
          Access Denied
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          You don't have permission to access this page. Please login with the appropriate credentials.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Link
            to="/auth"
            className="btn-primary w-full"
          >
            <LockClosedIcon className="h-5 w-5 mr-2" />
            Login
          </Link>

          <div className="flex space-x-4">
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex-1"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>

            <Link
              to="/"
              className="btn-secondary flex-1"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Home
            </Link>
          </div>
        </motion.div>

        {/* Floating Animation */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="absolute top-20 left-10 w-16 h-16 bg-red-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -1, 1, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            delay: 1
          }}
          className="absolute bottom-20 right-10 w-12 h-12 bg-orange-200 rounded-full opacity-20"
        />
      </motion.div>
    </div>
  );
};

export default Unauthorized;
