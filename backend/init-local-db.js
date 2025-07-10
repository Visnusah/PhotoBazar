import pg from 'pg';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { User, Category, Photo, Purchase, Like } from './models/index.js';

dotenv.config();

const { Client } = pg;

async function initializeDatabase() {
  console.log('🚀 Initializing PhotoBazaar Database');
  console.log('===================================');
  
  try {
    // Test connection with pg client first
    console.log('📡 Testing database connection...');
    const pgClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'photobazaar',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });
    
    await pgClient.connect();
    const result = await pgClient.query('SELECT version(), current_database()');
    console.log('✅ Connected to:', result.rows[0].current_database);
    console.log('📊 PostgreSQL:', result.rows[0].version.split(',')[0]);
    await pgClient.end();
    
    // Force sync all models (this will drop and recreate tables)
    console.log('\n🔄 Creating database schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema created successfully');
    
    // Create default categories
    console.log('\n📦 Creating default categories...');
    const defaultCategories = [
      { name: 'Nature', slug: 'nature', description: 'Beautiful landscapes and nature photography' },
      { name: 'Portrait', slug: 'portrait', description: 'Professional portrait and people photography' },
      { name: 'Street', slug: 'street', description: 'Urban and street photography' },
      { name: 'Wildlife', slug: 'wildlife', description: 'Animal and wildlife photography' },
      { name: 'Architecture', slug: 'architecture', description: 'Buildings and architectural photography' },
      { name: 'Abstract', slug: 'abstract', description: 'Abstract and artistic photography' },
      { name: 'Sports', slug: 'sports', description: 'Sports and action photography' },
      { name: 'Food', slug: 'food', description: 'Food and culinary photography' },
      { name: 'Travel', slug: 'travel', description: 'Travel and destination photography' },
      { name: 'Fashion', slug: 'fashion', description: 'Fashion and style photography' }
    ];
    
    await Category.bulkCreate(defaultCategories);
    console.log(`✅ Created ${defaultCategories.length} categories`);
    
    // Create test users
    console.log('\n👥 Creating test users...');
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Photographer',
        email: 'photographer@photobazaar.com',
        password: 'Password123!',
        role: 'photographer',
        isVerified: true,
        bio: 'Professional photographer specializing in nature and wildlife photography'
      },
      {
        firstName: 'Jane',
        lastName: 'Customer',
        email: 'customer@photobazaar.com',
        password: 'Password123!',
        role: 'user',
        isVerified: true,
        bio: 'Photography enthusiast and collector'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@photobazaar.com',
        password: 'Password123!',
        role: 'admin',
        isVerified: true,
        bio: 'PhotoBazaar administrator'
      }
    ];
    
    for (const userData of testUsers) {
      try {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️  User already exists: ${userData.email}`);
        } else {
          throw error;
        }
      }
    }
    
    // Verify all tables exist and show counts
    console.log('\n📊 Database verification:');
    const tables = [
      { name: 'Users', model: User },
      { name: 'Categories', model: Category },
      { name: 'Photos', model: Photo },
      { name: 'Purchases', model: Purchase },
      { name: 'Likes', model: Like }
    ];
    
    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`   ✅ ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`   ❌ ${table.name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 What was created:');
    console.log('   • All necessary tables (Users, Categories, Photos, Purchases, Likes)');
    console.log('   • Default photo categories');
    console.log('   • Test user accounts');
    console.log('\n🔐 Test Login Credentials:');
    console.log('   📧 photographer@photobazaar.com / Password123!');
    console.log('   📧 customer@photobazaar.com / Password123!');
    console.log('   📧 admin@photobazaar.com / Password123!');
    console.log('\n🚀 Ready to start the development server!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initializeDatabase;
