import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50],
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isLowercase: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  hooks: {
    beforeCreate: (category) => {
      if (!category.slug) {
        category.slug = category.name.toLowerCase().replace(/\s+/g, '-');
      }
    },
    beforeUpdate: (category) => {
      if (category.changed('name') && !category.slug) {
        category.slug = category.name.toLowerCase().replace(/\s+/g, '-');
      }
    },
  },
});

export default Category;
