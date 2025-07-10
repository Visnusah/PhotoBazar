import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  PhotoIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { getImageUrlWithToken } from '../utils/imageAuth';

const Landing = () => {
  const [featuredPhotos, setFeaturedPhotos] = useState([]);

  useEffect(() => {
    // Fetch featured photos for the hero section
    const fetchFeaturedPhotos = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/photos/featured');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedPhotos(data.data.photos);
        }
      } catch (error) {
        console.error('Error fetching featured photos:', error);
        // Use empty array if API fails
        setFeaturedPhotos([]);
      }
    };

    fetchFeaturedPhotos();
  }, []);

  const features = [
    {
      icon: PhotoIcon,
      title: 'High-Quality Photos',
      description: 'Discover stunning, professional photographs from talented artists worldwide.'
    },
    {
      icon: CameraIcon,
      title: 'Easy Selling',
      description: 'Upload your photos and start earning. Simple tools for photographers of all levels.'
    },
    {
      icon: UserGroupIcon,
      title: 'Global Community',
      description: 'Connect with photographers and photo enthusiasts from around the globe.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'Track your sales, views, and earnings with detailed analytics dashboard.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Professional Photographer',
      content: 'Photo Bazaar has transformed my photography business. The platform is intuitive and my sales have increased by 300%.',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100',
      rating: 5
    },
    {
      name: 'Mike Johnson',
      role: 'Freelance Designer',
      content: 'Amazing quality photos at great prices. Perfect for my design projects. The search functionality is excellent.',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100',
      rating: 5
    },
    {
      name: 'Emma Wilson',
      role: 'Content Creator',
      content: 'The variety and quality of photos available here is unmatched. My go-to source for all visual content.',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100',
      rating: 5
    }
  ];

  const stats = [
    { label: 'Photos Available', value: '50,000+' },
    { label: 'Active Photographers', value: '2,500+' },
    { label: 'Downloads This Month', value: '125,000+' },
    { label: 'Customer Satisfaction', value: '98%' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Buy & Sell{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Stunning Photos
                </span>{' '}
                Easily
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                The premier marketplace connecting photographers with customers worldwide. 
                Discover breathtaking photography or showcase your artistic vision.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/marketplace"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Explore Photos
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/sell"
                  className="btn-outline inline-flex items-center justify-center"
                >
                  Start Selling
                  <CameraIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {featuredPhotos.slice(0, 4).map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className={`${
                      index % 2 === 0 ? 'mt-8' : ''
                    } rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}
                  >
                    <img
                      src={photo.imageUrl || '/placeholder-image.jpg'}
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                  </motion.div>
                ))}
                {featuredPhotos.length === 0 && (
                  // Placeholder images when no photos are available
                  <div className="col-span-2 text-center py-12">
                    <PhotoIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-4 text-gray-500">Featured photos will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Photo Bazaar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the perfect platform for photographers to showcase their work 
              and for customers to find exactly what they need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied photographers and customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join Photo Bazaar today and become part of our growing community of photographers and photo enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign Up Now
              </Link>
              <Link
                to="/marketplace"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-200"
              >
                Browse Photos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;