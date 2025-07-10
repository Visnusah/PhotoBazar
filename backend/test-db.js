import sequelize from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const timeout = setTimeout(() => {
    console.log('❌ Connection attempt timed out after 15 seconds');
    process.exit(1);
  }, 15000);

  try {
    console.log('Testing database connection...');
    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'Not set');
    
    console.log('\nAttempting connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    console.log('Connected to:', {
      host: sequelize.config.host,
      database: sequelize.config.database,
      username: sequelize.config.username
    });
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

testConnection();
