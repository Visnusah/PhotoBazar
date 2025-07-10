import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Use connection string for better compatibility
const databaseUrl = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'postgres'}${process.env.DB_PASSWORD ? ':' + process.env.DB_PASSWORD : ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'photobazaar'}`;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true, // Enable soft deletes
  },
});

export default sequelize;
