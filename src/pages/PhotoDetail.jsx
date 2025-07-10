import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShareIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  UserIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import PhotoCard from '../components/ui/PhotoCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrlWithToken } from '../utils/imageAuth';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      try {
        const headers = {};
        if (user && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5001/api/photos/${id}`, { headers });
        const data = await response.json();
        
        if (data.success) {
          setPhoto(data.data.photo);
          setIsLiked(data.data.photo.isLiked || false);
          setLikesCount(data.data.photo.likes || 0);
          
          // Set purchase status from photo data if available
          if (data.data.photo.isPurchased) {
            setPurchaseStatus({
              purchased: data.data.photo.isPurchased,
              purchase: data.data.photo.purchaseInfo
            });
          } else if (user && token) {
            // Fallback: Check purchase status separately
            const purchaseResponse = await fetch(`http://localhost:5001/api/photos/${id}/purchase-status`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            });
            const purchaseData = await purchaseResponse.json();
            if (purchaseData.success) {
              setPurchaseStatus(purchaseData.data);
            }
          }
          
          // Fetch related photos
          const relatedResponse = await fetch(`http://localhost:5001/api/photos?category=${data.data.photo.category?.slug || 'all'}&limit=4`);
          const relatedData = await relatedResponse.json();
          
          if (relatedData.success) {
            // Filter out current photo from related photos
            const related = relatedData.data.photos.filter(p => p.id !== parseInt(id));
            setRelatedPhotos(related);
          }
        } else {
          toast.error('Photo not found');
          navigate('/marketplace');
        }
      } catch (error) {
        console.error('Error fetching photo:', error);
        toast.error('Failed to load photo');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id, navigate, user, token]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase photos');
      navigate('/auth');
      return;
    }

    if (purchaseStatus?.purchased) {
      toast.info('You have already purchased this photo');
      return;
    }

    setPurchasing(true);
    try {
      const response = await fetch(`http://localhost:5001/api/photos/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Photo purchased successfully!');
        // Update purchase status
        setPurchaseStatus({
          purchased: true,
          purchase: data.data.purchase
        });
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error('Please login to download photos');
      navigate('/auth');
      return;
    }

    if (!purchaseStatus?.purchased) {
      toast.error('Please purchase this photo first');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/photos/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Use the direct download endpoint for actual file download
        const downloadResponse = await fetch(`http://localhost:5001/api/photos/${id}/download-file`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (downloadResponse.ok) {
          // Create blob and download
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.data.filename;
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
          
          toast.success(`Photo downloaded! ${data.data.remainingDownloads} downloads remaining.`);
        } else {
          toast.error('Failed to download file');
        }
        
        // Update purchase status with new download count
        setPurchaseStatus(prev => ({
          ...prev,
          purchase: {
            ...prev.purchase,
            downloadCount: data.data.downloadCount
          }
        }));
      } else {
        toast.error(data.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like photos');
      navigate('/auth');
      return;
    }

    if (photo.isOwner) {
      toast.error('You cannot like your own photo');
      return;
    }

    if (liking) return; // Prevent double clicks

    setLiking(true);
    
    try {
      const response = await fetch(`http://localhost:5001/api/photos/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLiked(data.data.isLiked);
        setLikesCount(data.data.likesCount);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to like photo');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like photo');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: photo.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading photo..." />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo not found</h2>
          <Link to="/marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={getImageUrlWithToken(photo.fullImage)}
                  alt={photo.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Photo Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Actions */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {photo.title}
              </h1>
              <div className="flex items-center space-x-4">
                {!photo.isOwner && (
                  <button
                    onClick={handleLike}
                    disabled={liking}
                    className={`p-2 rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLiked 
                        ? 'border-red-300 bg-red-50 text-red-500' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                    }`}
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="h-6 w-6" />
                    ) : (
                      <HeartIcon className="h-6 w-6" />
                    )}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full border border-gray-300 hover:border-gray-400 text-gray-600 transition-all"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Photographer Info */}
            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{photo.photographer}</h3>
                  <p className="text-sm text-gray-600">Professional Photographer</p>
                </div>
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="card p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  ${photo.price}
                </div>
                <p className="text-sm text-gray-600">High-resolution digital download</p>
              </div>
              
              {photo.isOwner ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Your Photo</span>
                  </div>
                  <p className="text-center text-xs text-gray-500">
                    This is your uploaded photo. You have full access to the original file.
                  </p>
                </div>
              ) : purchaseStatus?.purchased ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Already Purchased</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading || (purchaseStatus.purchase && purchaseStatus.purchase.downloadCount >= purchaseStatus.purchase.maxDownloads)}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>
                      {downloading ? 'Downloading...' : 
                       (purchaseStatus.purchase && purchaseStatus.purchase.downloadCount >= purchaseStatus.purchase.maxDownloads) ? 
                       'Download Limit Reached' : 'Download Photo'}
                    </span>
                  </button>
                  <div className="text-center text-xs text-gray-500">
                    {purchaseStatus.purchase?.downloadCount || 0} of {purchaseStatus.purchase?.maxDownloads || 6} downloads used
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{purchasing ? 'Purchasing...' : 'Buy Now'}</span>
                </button>
              )}
            </div>

            {/* Photo Stats */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Photo Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Likes</span>
                  </div>
                  <span className="text-sm font-medium">{likesCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Views</span>
                  </div>
                  <span className="text-sm font-medium">{photo.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowDownTrayIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Downloads</span>
                  </div>
                  <span className="text-sm font-medium">{photo.downloads}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {photo.description}
              </p>
            </div>

            {/* Tags */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/marketplace?search=${tag}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Photos */}
        {relatedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPhotos.map((relatedPhoto) => (
                <PhotoCard key={relatedPhoto.id} photo={relatedPhoto} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-6 right-6 z-50"
      >
        {purchaseStatus?.purchased ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="font-medium">{downloading ? 'Downloading...' : 'Download'}</span>
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="font-medium">{purchasing ? 'Purchasing...' : `$${photo.price}`}</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default PhotoDetail;