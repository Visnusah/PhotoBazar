import { User, Category, Photo } from '../models/index.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Landscape',
        slug: 'landscape',
        description: 'Beautiful landscape and nature photography',
      },
      {
        name: 'Architecture',
        slug: 'architecture',
        description: 'Modern and historic architecture photography',
      },
      {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Lifestyle and everyday moments',
      },
      {
        name: 'Portrait',
        slug: 'portrait',
        description: 'Professional portrait photography',
      },
      {
        name: 'Street',
        slug: 'street',
        description: 'Street photography and urban scenes',
      },
      {
        name: 'Abstract',
        slug: 'abstract',
        description: 'Abstract and artistic photography',
      },
    ]);

    console.log('✅ Categories created');

    // Create sample users
    const users = await User.bulkCreate([
      {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@example.com',
        password: 'password123',
        role: 'photographer',
        bio: 'Landscape photographer with a passion for capturing the beauty of nature.',
        isVerified: true,
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        password: 'password123',
        role: 'photographer',
        bio: 'Architecture photographer specializing in modern urban photography.',
        isVerified: true,
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.wilson@example.com',
        password: 'password123',
        role: 'photographer',
        bio: 'Lifestyle photographer capturing authentic moments.',
        isVerified: true,
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        password: 'password123',
        role: 'photographer',
        bio: 'Street photographer documenting urban life.',
        isVerified: true,
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'user',
        bio: 'Photography enthusiast and collector.',
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@photobazaar.com',
        password: 'admin123',
        role: 'admin',
        bio: 'Platform administrator.',
        isVerified: true,
      },
    ]);

    console.log('✅ Users created');

    // Create sample photos
    const samplePhotos = [
      {
        title: 'Sunset Mountains',
        description: 'Beautiful mountain landscape during golden hour with dramatic clouds and warm lighting.',
        price: 29.99,
        photographerId: users[0].id, // Sarah Chen
        categoryId: categories[0].id, // Landscape
        imageUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
        fullImageUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600',
        tags: ['sunset', 'mountains', 'nature', 'landscape'],
        views: 1250,
        downloads: 234,
        likesCount: 89,
        isFeatured: true,
      },
      {
        title: 'Urban Architecture',
        description: 'Modern skyscraper with geometric patterns and glass reflections in downtown area.',
        price: 24.99,
        photographerId: users[1].id, // Mike Johnson
        categoryId: categories[1].id, // Architecture
        imageUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=400',
        fullImageUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1600',
        tags: ['urban', 'architecture', 'modern', 'building'],
        views: 892,
        downloads: 189,
        likesCount: 67,
      },
      {
        title: 'Coffee Culture',
        description: 'Artisan coffee preparation with steam and warm ambient lighting in cozy cafe setting.',
        price: 19.99,
        photographerId: users[2].id, // Emma Wilson
        categoryId: categories[2].id, // Lifestyle
        imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
        fullImageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600',
        tags: ['coffee', 'lifestyle', 'food', 'cozy'],
        views: 678,
        downloads: 156,
        likesCount: 45,
        isFeatured: true,
      },
      {
        title: 'Ocean Waves',
        description: 'Powerful ocean waves crashing against rocky coastline during stormy weather.',
        price: 34.99,
        photographerId: users[0].id, // Sarah Chen
        categoryId: categories[0].id, // Landscape
        imageUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
        fullImageUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1600',
        tags: ['ocean', 'waves', 'nature', 'storm'],
        views: 1456,
        downloads: 298,
        likesCount: 112,
        isExclusive: true,
      },
      {
        title: 'City Lights',
        description: 'Vibrant city skyline at night with illuminated buildings and light trails.',
        price: 27.99,
        photographerId: users[3].id, // David Brown
        categoryId: categories[4].id, // Street
        imageUrl: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=400',
        fullImageUrl: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1600',
        tags: ['city', 'night', 'lights', 'urban'],
        views: 987,
        downloads: 167,
        likesCount: 78,
      },
    ];

    await Photo.bulkCreate(samplePhotos);
    console.log('✅ Sample photos created');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default seedData;
