#!/usr/bin/env node

// Script to check verification codes in database
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'photobazaar',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'kamlesh@123',
  logging: false,
});

const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(4),
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

async function checkVerificationCodes() {
  try {
    await sequelize.authenticate();
    console.log('🔍 Checking verification codes...\n');
    
    const verifications = await EmailVerification.findAll({
      where: {
        isUsed: false
      },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    if (verifications.length === 0) {
      console.log('No pending verification codes found.');
    } else {
      console.log('Pending verification codes:');
      verifications.forEach((v, index) => {
        console.log(`${index + 1}. Email: ${v.email}`);
        console.log(`   Code: ${v.code}`);
        console.log(`   Name: ${v.firstName} ${v.lastName}`);
        console.log(`   Expires: ${v.expiresAt}`);
        console.log(`   Created: ${v.createdAt}\n`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkVerificationCodes();
