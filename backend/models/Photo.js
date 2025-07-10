import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      max: 9999.99,
    },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  fullImageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  watermarkUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes',
  },
  format: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['jpg', 'jpeg', 'png', 'webp', 'tiff', 'raw']],
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isExclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Exclusive photos can only be sold once',
  },
  sold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'For exclusive photos only',
  },
}, {
  indexes: [
    {
      fields: ['title'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
    {
      fields: ['price'],
    },
    {
      fields: ['downloads'],
    },
    {
      fields: ['views'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// Instance methods
Photo.prototype.incrementView = async function() {
  this.views += 1;
  await this.save();
};

Photo.prototype.incrementDownload = async function() {
  this.downloads += 1;
  await this.save();
};

Photo.prototype.incrementLike = async function() {
  this.likesCount += 1;
  await this.save();
};

export default Photo;
