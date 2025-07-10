import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrlWithToken } from '../../utils/imageAuth';

const PhotoCard = ({ photo, showStats = true }) => {
  const { user, token } = useAuth();
  const [isLiked, setIsLiked] = useState(photo.isLiked || false);
  const [likesCount, setLikesCount] = useState(photo.likes || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liking, setLiking] = useState(false);

  // Update state when photo prop changes
  useEffect(() => {
    setIsLiked(photo.isLiked || false);
    setLikesCount(photo.likes || 0);
  }, [photo.isLiked, photo.likes]);

  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to like photos');
      return;
    }

    if (photo.isOwner) {
      toast.error('You cannot like your own photo');
      return;
    }

    if (liking) return; // Prevent double clicks

    setLiking(true);
    
    try {
      const response = await fetch(`http://localhost:5001/api/photos/${photo.id}/like`, {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card overflow-hidden group"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Link to={`/photo/${photo.id}`}>
          <img
            src={getImageUrlWithToken(photo.imageUrl || photo.image)}
            alt={photo.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </Link>

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {!photo.isOwner && (
              <button
                onClick={handleLike}
                disabled={liking}
                className={`p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-white border border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {photo.isOwner ? (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Your Photo
              </span>
            ) : (
              <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-md">
                ${photo.price}
              </span>
            )}
          </div>

          {/* Purchase/Download Status */}
          {!photo.isOwner && photo.isPurchased && (
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                Purchased
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/photo/${photo.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-primary-600 transition-colors">
            {photo.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {photo.description}
        </p>

        {/* Photographer Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {photo.photographer ? `${photo.photographer.firstName} ${photo.photographer.lastName}` : 
               photo.User ? `${photo.User.firstName} ${photo.User.lastName}` : 
               'Unknown photographer'}
            </span>
          </div>
          
          {showStats && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <HeartIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <EyeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">{photo.views || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {photo.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{photo.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PhotoCard;