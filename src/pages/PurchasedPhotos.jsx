import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const API_BASE_URL = 'http://localhost:5001/api';

const PurchasedPhotos = () => {
  const { user, token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (user && token) {
      fetchPurchasedPhotos();
    }
  }, [user, token]);

  const fetchPurchasedPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/photos/purchased`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPurchases(result.data.purchases);
      } else {
        throw new Error('Failed to fetch purchased photos');
      }
    } catch (error) {
      console.error('Error fetching purchased photos:', error);
      toast.error('Failed to load purchased photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photoId, title) => {
    setDownloading(prev => ({ ...prev, [photoId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = `${title}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Photo downloaded successfully!');
        
        // Refresh purchased photos to update download count
        fetchPurchasedPhotos();
      } else {
        toast.error(data.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [photoId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading purchased photos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Purchased Photos</h1>
          <p className="mt-2 text-gray-600">
            Download and manage your purchased photos
          </p>
        </div>

        {/* Purchases */}
        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by browsing the marketplace and purchasing photos.
            </p>
            <div className="mt-6">
              <Link to="/marketplace" className="btn-primary">
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={purchase.photo.imageUrl}
                    alt={purchase.photo.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {purchase.photo.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    by {purchase.photo.photographer}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      {purchase.downloadCount} downloads
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      ${purchase.amount}
                    </span>
                    <button
                      onClick={() => handleDownload(purchase.photo.id, purchase.photo.title)}
                      disabled={downloading[purchase.photo.id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>
                        {downloading[purchase.photo.id] ? 'Downloading...' : 'Download'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Link
                      to={`/photo/${purchase.photo.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedPhotos;
