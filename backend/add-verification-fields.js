import sequelize from './config/database.js';
import { User } from './models/index.js';

async function checkAndAddVerificationFields() {
  try {
    console.log('🔍 Checking for verification fields in User table...');
    
    // Check current table structure
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('verification_token', 'verification_token_expires', 'password_reset_token', 'password_reset_expires', 'is_verified')
    `);
    
    const existingColumns = results.map(row => row.column_name);
    console.log('📋 Existing verification columns:', existingColumns);
    
    const requiredColumns = [
      'is_verified',
      'verification_token', 
      'verification_token_expires',
      'password_reset_token',
      'password_reset_expires'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All verification fields already exist!');
      return;
    }
    
    console.log('➕ Adding missing columns:', missingColumns);
    
    // Add missing columns
    const alterQueries = [];
    
    if (!existingColumns.includes('is_verified')) {
      alterQueries.push('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false');
    }
    
    if (!existingColumns.includes('verification_token')) {
      alterQueries.push('ALTER TABLE users ADD COLUMN verification_token VARCHAR(255)');
    }
    
    if (!existingColumns.includes('verification_token_expires')) {
      alterQueries.push('ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP');
    }
    
    if (!existingColumns.includes('password_reset_token')) {
      alterQueries.push('ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255)');
    }
    
    if (!existingColumns.includes('password_reset_expires')) {
      alterQueries.push('ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP');
    }
    
    // Execute all alter queries
    for (const query of alterQueries) {
      console.log(`🔧 Executing: ${query}`);
      await sequelize.query(query);
    }
    
    console.log('✅ Database schema updated successfully!');
    
    // Test model sync
    console.log('🔄 Syncing User model...');
    await User.sync({ alter: true });
    
    console.log('🎉 All verification fields added and model synced!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndAddVerificationFields();
