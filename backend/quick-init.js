import sequelize from './config/database.js';
import { User, Category, Photo, Purchase, Like } from './models/index.js';

async function quickInit() {
  try {
    console.log('🚀 Quick database initialization...');
    
    // Test if we can create tables with Sequelize
    console.log('📦 Creating database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // Create default categories
    console.log('📂 Creating default categories...');
    const defaultCategories = [
      { name: 'Nature', description: 'Beautiful landscapes and nature photography' },
      { name: 'Portrait', description: 'Professional portrait photography' },
      { name: 'Street', description: 'Urban and street photography' },
      { name: 'Wildlife', description: 'Animal and wildlife photography' },
      { name: 'Architecture', description: 'Buildings and architectural photography' },
      { name: 'Abstract', description: 'Abstract and artistic photography' }
    ];
    
    await Category.bulkCreate(defaultCategories);
    console.log('✅ Default categories created');
    
    // Create a test user
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'Photographer',
      email: 'test@photobazaar.com',
      password: 'Password123!',
      role: 'photographer',
      isVerified: true,
      bio: 'Test photographer account'
    });
    console.log('✅ Test user created with ID:', testUser.id);
    
    // Verify tables
    const userCount = await User.count();
    const categoryCount = await Category.count();
    
    console.log(`\n📊 Database Summary:`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log('\n🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
    process.exit();
  }
}

quickInit();
