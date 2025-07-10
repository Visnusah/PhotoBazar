import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { id: 1, name: 'Landscape', slug: 'landscape' },
          { id: 2, name: 'Portrait', slug: 'portrait' },
          { id: 3, name: 'Architecture', slug: 'architecture' },
          { id: 4, name: 'Nature', slug: 'nature' },
          { id: 5, name: 'Lifestyle', slug: 'lifestyle' },
          { id: 6, name: 'Abstract', slug: 'abstract' },
          { id: 7, name: 'Street Photography', slug: 'street' },
          { id: 8, name: 'Food & Drink', slug: 'food' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to upload photos');
      navigate('/auth');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('price', formData.price);
      uploadData.append('categoryId', formData.category); // Use categoryId
      uploadData.append('tags', formData.tags || '');
      uploadData.append('photo', imageFile);

      // Get auth token
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Photo uploaded successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          category: '',
          tags: ''
        });
        setImageFile(null);
        setImagePreview(null);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Photo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your stunning photography with the world. Set your price and start earning from your creative work.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo Upload</h2>
            
            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
              >
                <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your photo
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>Choose Photo</span>
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supports: JPG, PNG, WebP (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Image Ready</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Photo Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling title for your photo"
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your photo, including details about the location, technique, or story behind it"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: $15-50 for standard photos
                </p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="landscape, sunset, mountains, nature (comma separated)"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant tags to help customers find your photo
                </p>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              type="submit"
              disabled={isUploading}
              className={`btn-primary text-lg px-8 py-4 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Photo'
              )}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              By uploading, you agree to our Terms of Service and confirm that you own the rights to this image.
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Sell;