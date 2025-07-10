import sequelize from '../config/database.js';
import '../models/index.js'; // Import all models to ensure associations are set up
import seedData from '../seeds/index.js';

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync all models
    await sequelize.sync({ force: true }); // WARNING: This will drop all tables!
    console.log('✅ Database models synchronized.');

    // Seed initial data
    await seedData();

    console.log('🎉 Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
