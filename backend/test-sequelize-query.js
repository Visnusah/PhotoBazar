import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('Creating Sequelize instance...');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: (sql, timing) => {
    console.log('SQL:', sql);
    if (timing) console.log('Timing:', timing);
  },
});

console.log('Sequelize instance created');

// Test with a simple query instead of authenticate
async function testQuery() {
  const timeout = setTimeout(() => {
    console.log('❌ Query timed out after 10 seconds');
    process.exit(1);
  }, 10000);

  try {
    console.log('Testing with simple query...');
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Query successful:', result);
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

testQuery();
