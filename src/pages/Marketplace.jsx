import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import PhotoCard from '../components/ui/PhotoCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/categories?includeCount=true');
        const data = await response.json();
        
        if (data.success) {
          const allCategory = { id: 'all', name: 'All Photos', photoCount: 0 };
          setCategories([allCategory, ...data.data.categories]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch photos from backend
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sortBy,
        });

        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        
        // Handle price range
        if (priceRange !== 'all') {
          switch (priceRange) {
            case 'under-20':
              params.append('priceMax', '20');
              break;
            case '20-30':
              params.append('priceMin', '20');
              params.append('priceMax', '30');
              break;
            case '30-50':
              params.append('priceMin', '30');
              params.append('priceMax', '50');
              break;
            case 'over-50':
              params.append('priceMin', '50');
              break;
          }
        }

        const headers = {};
        if (user && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5001/api/photos?${params}&t=${Date.now()}`, { headers });
        const data = await response.json();

        if (data.success) {
          setPhotos(data.data.photos);
          setTotalPages(data.data.pagination.totalPages);
          setTotalItems(data.data.pagination.totalItems);
        } else {
          toast.error('Failed to load photos');
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        toast.error('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [searchTerm, selectedCategory, priceRange, sortBy, currentPage, user, token]);

  const updateSearchParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams('search', searchTerm);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateSearchParams('category', category);
    setCurrentPage(1);
  };

  const handlePriceChange = (price) => {
    setPriceRange(price);
    updateSearchParams('price', price);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateSearchParams('sort', sort);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const getPriceRangeLabel = (range) => {
    switch (range) {
      case 'under-20': return 'Under $20';
      case '20-30': return '$20 - $30';
      case '30-50': return '$30 - $50';
      case 'over-50': return 'Over $50';
      default: return '';
    }
  };

  const getSortLabel = (sort) => {
    switch (sort) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'popular': return 'Most Popular';
      case 'views': return 'Most Viewed';
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      default: return 'Newest First';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Marketplace</h1>
          <p className="text-gray-600">Discover stunning photography from talented artists worldwide</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos, photographers, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary text-sm py-2 px-4"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Toggle (Mobile) */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 btn-outline text-sm"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} {category.photoCount !== undefined && `(${category.photoCount})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-20">Under $20</option>
                    <option value="20-30">$20 - $30</option>
                    <option value="30-50">$30 - $50</option>
                    <option value="over-50">Over $50</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${totalItems} photos found`}
          </p>
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {selectedCategory !== 'all' && `${categories.find(c => c.id === selectedCategory)?.name} • `}
              {priceRange !== 'all' && `${getPriceRangeLabel(priceRange)} • `}
              {getSortLabel(sortBy)}
            </span>
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <LoadingSpinner size="large" text="Loading photos..." />
        ) : photos.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <MagnifyingGlassIcon className="h-full w-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;