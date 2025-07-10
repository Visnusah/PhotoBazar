import pg from 'pg';
import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { User, Category, Photo, Purchase, Like } from '../models/index.js';

dotenv.config();

const { Client } = pg;

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Test connection with pg client first
    console.log('📡 Testing database connection...');
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    });
    
    await pgClient.connect();
    const result = await pgClient.query('SELECT version()');
    console.log('✅ Database connected:', result.rows[0].version.split(',')[0]);
    await pgClient.end();
    
    // Force sync all models (this will drop and recreate tables)
    console.log('🔄 Synchronizing database schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized');
    
    // Create default categories
    console.log('📦 Creating default categories...');
    const defaultCategories = [
      { name: 'Nature', description: 'Beautiful landscapes and nature photography' },
      { name: 'Portrait', description: 'Professional portrait photography' },
      { name: 'Street', description: 'Urban and street photography' },
      { name: 'Wildlife', description: 'Animal and wildlife photography' },
      { name: 'Architecture', description: 'Buildings and architectural photography' },
      { name: 'Abstract', description: 'Abstract and artistic photography' },
      { name: 'Sports', description: 'Sports and action photography' },
      { name: 'Food', description: 'Food and culinary photography' },
    ];
    
    await Category.bulkCreate(defaultCategories);
    console.log('✅ Default categories created');
    
    // Create a test user
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@photobazaar.com',
      password: 'password123',
      role: 'photographer',
      isVerified: true,
      bio: 'Test photographer account for PhotoBazaar'
    });
    console.log('✅ Test user created with ID:', testUser.id);
    
    // Verify all tables exist
    console.log('🔍 Verifying database tables...');
    const tables = ['Users', 'Categories', 'Photos', 'Purchases', 'Likes'];
    
    for (const table of tables) {
      try {
        await sequelize.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`✅ Table "${table}" exists and is accessible`);
      } catch (error) {
        console.error(`❌ Table "${table}" error:`, error.message);
      }
    }
    
    // Show database statistics
    console.log('\n📊 Database Statistics:');
    const userCount = await User.count();
    const categoryCount = await Category.count();
    const photoCount = await Photo.count();
    const purchaseCount = await Purchase.count();
    const likeCount = await Like.count();
    
    console.log(`- Users: ${userCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Photos: ${photoCount}`);
    console.log(`- Purchases: ${purchaseCount}`);
    console.log(`- Likes: ${likeCount}`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    
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
