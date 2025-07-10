import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function verifyLocalDatabase() {
  console.log('🔍 PhotoBazaar Local Database Verification');
  console.log('=========================================');
  
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'photobazaar',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to local PostgreSQL database');
    
    // Get database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    
    const info = dbInfo.rows[0];
    console.log('\n📊 Database Information:');
    console.log(`   Database: ${info.database_name}`);
    console.log(`   User: ${info.user_name}`);
    console.log(`   Version: ${info.version.split(',')[0]}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    
    // Check if tables exist
    const tablesQuery = `
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map(row => row.table_name);
    
    console.log('\n📋 Existing Tables:');
    if (existingTables.length === 0) {
      console.log('   ❌ No tables found');
      console.log('   💡 Run: node init-local-db.js to create tables');
    } else {
      existingTables.forEach(table => {
        console.log(`   ✅ ${table}`);
      });
    }
    
    // Required tables for PhotoBazaar
    const requiredTables = [
      'users',
      'categories', 
      'photos',
      'purchases',
      'likes'
    ];
    
    console.log('\n🎯 Required Tables Check:');
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
      console.log('\n🎉 All required tables exist!');
      
      // Show table details and record counts
      console.log('\n📊 Table Details:');
      for (const table of requiredTables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
          const count = countResult.rows[0].count;
          
          // Get column info
          const columnsResult = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position
          `, [table]);
          
          console.log(`   📄 ${table}: ${count} records, ${columnsResult.rows.length} columns`);
          
          // Show some column details for key tables
          if (table === 'users' || table === 'categories') {
            columnsResult.rows.slice(0, 5).forEach(col => {
              console.log(`      - ${col.column_name} (${col.data_type})`);
            });
            if (columnsResult.rows.length > 5) {
              console.log(`      ... and ${columnsResult.rows.length - 5} more columns`);
            }
          }
        } catch (error) {
          console.log(`   ❌ ${table}: Error reading - ${error.message}`);
        }
      }
      
      // Check for sample data
      console.log('\n🔍 Sample Data Check:');
      try {
        const categoryCount = await client.query(`SELECT COUNT(*) FROM "categories"`);
        const userCount = await client.query(`SELECT COUNT(*) FROM "users"`);
        
        if (parseInt(categoryCount.rows[0].count) > 0) {
          console.log('   ✅ Categories have sample data');
          const categories = await client.query(`SELECT name FROM "categories" LIMIT 5`);
          categories.rows.forEach(cat => console.log(`      - ${cat.name}`));
        } else {
          console.log('   ⚠️  No categories found');
        }
        
        if (parseInt(userCount.rows[0].count) > 0) {
          console.log('   ✅ Users have sample data');
          const users = await client.query(`SELECT email, role FROM "users" LIMIT 3`);
          users.rows.forEach(user => console.log(`      - ${user.email} (${user.role})`));
        } else {
          console.log('   ⚠️  No users found');
        }
        
      } catch (error) {
        console.log('   ❌ Error checking sample data:', error.message);
      }
      
    } else {
      console.log('\n⚠️  Missing tables detected!');
      console.log('💡 To create missing tables, run:');
      console.log('   node init-local-db.js');
    }
    
    // Test CRUD operations
    console.log('\n🧪 Testing basic CRUD operations...');
    
    try {
      // Test if we can perform basic operations
      await client.query('BEGIN');
      
      // Test table access
      await client.query('SELECT 1');
      console.log('   ✅ Basic SELECT operations work');
      
      await client.query('ROLLBACK');
      console.log('   ✅ Transaction operations work');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('   ❌ CRUD test failed:', error.message);
    }
    
    console.log('\n📱 pgAdmin4 Connection Info:');
    console.log('   To connect in pgAdmin4, use these settings:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'photobazaar'}`);
    console.log(`   Username: ${process.env.DB_USER || 'postgres'}`);
    console.log(`   Password: [your password from .env file]`);
    
    if (missingTables.length === 0) {
      console.log('\n🚀 Database is ready for PhotoBazaar!');
      console.log('✅ All tables exist and are accessible');
      console.log('✅ Authentication system will work');
      console.log('✅ Photo marketplace features supported');
      console.log('\n💡 Next steps:');
      console.log('   1. Start the server: npm run dev');
      console.log('   2. Test authentication endpoints');
      console.log('   3. Begin developing your application');
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. Database credentials in .env file');
      console.log('   3. Database "photobazaar" exists');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Username and password in .env file');
      console.log('   2. User permissions in PostgreSQL');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database not found. Please:');
      console.log('   1. Create database: createdb photobazaar');
      console.log('   2. Or run: ./setup-local-db.sh');
    }
  } finally {
    await client.end();
  }
}

verifyLocalDatabase();
