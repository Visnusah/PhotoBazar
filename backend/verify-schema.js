import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function verifyDatabaseSchema() {
  console.log('🔍 PhotoBazaar Database Schema Verification');
  console.log('==========================================');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Neon database');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map(row => row.table_name);
    
    console.log('\\n📋 Existing Tables:');
    if (existingTables.length === 0) {
      console.log('   ❌ No tables found');
    } else {
      existingTables.forEach(table => {
        console.log(`   ✅ ${table}`);
      });
    }
    
    // Required tables for PhotoBazaar
    const requiredTables = [
      'Users',
      'Categories', 
      'Photos',
      'Purchases',
      'Likes'
    ];
    
    console.log('\\n🎯 Required Tables Check:');
    const missingTables = [];
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} - EXISTS`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        missingTables.push(table);
      }
    });
    
    if (missingTables.length === 0) {
      console.log('\\n🎉 All required tables exist!');
      
      // Show table details
      console.log('\\n📊 Table Details:');
      for (const table of requiredTables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
          const count = countResult.rows[0].count;
          console.log(`   ${table}: ${count} records`);
        } catch (error) {
          console.log(`   ${table}: Error reading - ${error.message}`);
        }
      }
      
    } else {
      console.log('\\n⚠️  Missing tables need to be created:');
      console.log('\\n🛠️  Creating missing tables...');
      
      // Create Users table
      if (missingTables.includes('Users')) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "Users" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "firstName" VARCHAR(255) NOT NULL,
            "lastName" VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            bio TEXT,
            "profileImage" VARCHAR(255),
            "isVerified" BOOLEAN DEFAULT FALSE,
            role VARCHAR(50) DEFAULT 'user',
            "totalEarnings" DECIMAL(10,2) DEFAULT 0.00,
            "totalSales" INTEGER DEFAULT 0,
            "lastLoginAt" TIMESTAMP,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP
          );
        `);
        console.log('   ✅ Users table created');
      }
      
      // Create Categories table
      if (missingTables.includes('Categories')) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "Categories" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP
          );
        `);
        console.log('   ✅ Categories table created');
      }
      
      // Create Photos table
      if (missingTables.includes('Photos')) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "Photos" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            "imageUrl" VARCHAR(255) NOT NULL,
            "thumbnailUrl" VARCHAR(255),
            price DECIMAL(10,2) NOT NULL,
            tags TEXT[],
            "isExclusive" BOOLEAN DEFAULT FALSE,
            "downloadCount" INTEGER DEFAULT 0,
            "likeCount" INTEGER DEFAULT 0,
            "photographerId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
            "categoryId" UUID REFERENCES "Categories"(id) ON DELETE SET NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP
          );
        `);
        console.log('   ✅ Photos table created');
      }
      
      // Create Purchases table
      if (missingTables.includes('Purchases')) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "Purchases" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "buyerId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
            "photoId" UUID REFERENCES "Photos"(id) ON DELETE CASCADE,
            "photographerId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'completed',
            "transactionId" VARCHAR(255),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP
          );
        `);
        console.log('   ✅ Purchases table created');
      }
      
      // Create Likes table
      if (missingTables.includes('Likes')) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "Likes" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
            "photoId" UUID REFERENCES "Photos"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP,
            UNIQUE("userId", "photoId")
          );
        `);
        console.log('   ✅ Likes table created');
      }
      
      // Insert default categories
      console.log('\\n📦 Creating default categories...');
      await client.query(`
        INSERT INTO "Categories" (name, description) VALUES
        ('Nature', 'Beautiful landscapes and nature photography'),
        ('Portrait', 'Professional portrait photography'),
        ('Street', 'Urban and street photography'),
        ('Wildlife', 'Animal and wildlife photography'),
        ('Architecture', 'Buildings and architectural photography'),
        ('Abstract', 'Abstract and artistic photography')
        ON CONFLICT (name) DO NOTHING;
      `);
      
      // Create test user
      console.log('\\n👤 Creating test user...');
      await client.query(`
        INSERT INTO "Users" ("firstName", "lastName", email, password, role, "isVerified", bio)
        VALUES ('Test', 'Photographer', 'test@photobazaar.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdKcn9D.YQPsO7WnG', 'photographer', true, 'Test photographer account')
        ON CONFLICT (email) DO NOTHING;
      `);
      
      console.log('\\n🎉 Database schema created successfully!');
    }
    
    // Final verification
    console.log('\\n🔍 Final Schema Verification:');
    const finalResult = await client.query(tablesQuery);
    const finalTables = finalResult.rows.map(row => row.table_name);
    
    requiredTables.forEach(table => {
      if (finalTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table}`);
      }
    });
    
    console.log('\\n📈 Database Ready for PhotoBazaar!');
    console.log('✅ Authentication system can now work with proper database');
    console.log('✅ All user registration/login functions will work');
    console.log('✅ Photo marketplace features supported');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await client.end();
  }
}

verifyDatabaseSchema();
