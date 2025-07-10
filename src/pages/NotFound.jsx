import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        {/* Animated Search Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
          className="mx-auto h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center mb-8"
        >
          <MagnifyingGlassIcon className="h-12 w-12 text-purple-600" />
        </motion.div>

        {/* Error Code Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="mb-6"
        >
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            404
          </h1>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-semibold text-gray-800 mb-4"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 text-lg"
        >
          Oops! The page you're looking for seems to have vanished into the digital void. 
          Let's get you back on track.
        </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full text-lg py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow hover:from-[#8A37EA] hover:to-blue-700 transition"
            >
              <HomeIcon className="h-6 w-6 mr-2" />
              Back to Home
            </Link>

            <div className="flex space-x-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center flex-1 py-3 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium shadow hover:bg-[#8A37EA] hover:text-white transition"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Go Back
              </button>

              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center flex-1 py-3 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium shadow hover:bg-[#8A37EA] hover:text-white transition"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Browse Photos
              </Link>
            </div>
          </motion.div>
          {/* Floating Animation Elements */}
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="absolute top-32 left-20 w-20 h-20 bg-purple-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            x: [0, -15, 0],
            y: [0, 15, 0],
            rotate: [0, -3, 3, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "loop",
            delay: 2
          }}
          className="absolute bottom-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "loop",
            delay: 1
          }}
          className="absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full opacity-30"
        />
      </motion.div>
    </div>
  );
};

export default NotFound;
