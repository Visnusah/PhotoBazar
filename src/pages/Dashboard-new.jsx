import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhotoIcon, 
  EyeIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const API_BASE_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalViews: 0,
    totalEarnings: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserPhotos();
  }, [user, navigate]);

  const fetchUserPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/photos/my-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPhotos(result.data.photos);
        setStats(result.data.stats);
      } else {
        throw new Error('Failed to fetch photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load your photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Photo deleted successfully');
        fetchUserPhotos(); // Refresh the list
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleEditPhoto = async (photoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${photoData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      });

      if (response.ok) {
        toast.success('Photo updated successfully');
        setEditingPhoto(null);
        fetchUserPhotos(); // Refresh the list
      } else {
        throw new Error('Failed to update photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.firstName}! Manage your photos and track your performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Photos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Photos</h2>
          <Link
            to="/sell"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload New Photo
          </Link>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first photo.</p>
            <div className="mt-6">
              <Link to="/sell" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Upload Photo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{photo.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">${photo.price}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
                    <span className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {photo.views}
                    </span>
                    <span className="flex items-center">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      {photo.likes || 0}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="flex-1 btn-secondary text-xs py-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs py-1 px-2 rounded-md transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={handleEditPhoto}
        />
      )}
    </div>
  );
};

// Edit Photo Modal Component
const EditPhotoModal = ({ photo, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: photo.title,
    description: photo.description || '',
    price: photo.price,
    tags: photo.tags?.join(', ') || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: photo.id,
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Photo</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="nature, landscape, sunset"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
