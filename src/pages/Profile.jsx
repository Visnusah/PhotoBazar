import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || ''
      }); 
      // Handle both Cloudinary URLs and local URLs
      setImagePreview(user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`) : null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your first and last name');
      return;
    }

    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('firstName', formData.firstName.trim());
      updateData.append('lastName', formData.lastName.trim());
      updateData.append('bio', formData.bio.trim());
      
      if (profileImage) {
        updateData.append('profileImage', profileImage);
      }

      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: updateData,
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setIsEditing(false);
        setProfileImage(null);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || ''
    });
    setImagePreview(user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`) : null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                      <CameraIcon className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {isEditing && (
                  <p className="text-sm text-gray-500">Click the camera icon to upload a new profile photo</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {user.firstName || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {user.lastName || 'Not set'}
                    </div>
                  )}
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {user.email}
                </div>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[100px]">
                    {user.bio || 'No bio added yet'}
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{user.totalSales || 0}</div>
                    <div className="text-sm text-gray-500">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${user.totalEarnings || 0}</div>
                    <div className="text-sm text-gray-500">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-500">Last Login</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.role || 'User'}</div>
                    <div className="text-sm text-gray-500">Account Type</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
