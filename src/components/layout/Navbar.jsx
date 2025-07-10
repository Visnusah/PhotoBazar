import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon, 
  CameraIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Explore', path: '/marketplace', icon: MagnifyingGlassIcon },
    { name: 'Sell', path: '/sell', icon: CameraIcon, requiresAuth: true },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard', icon: UserCircleIcon, requiresAuth: true }] : [])
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
              <CameraIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Photo Bazaar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 hover:text-primary-600">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-gray-700 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500">View Profile</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block btn-primary text-sm text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;