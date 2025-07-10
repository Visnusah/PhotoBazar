import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Photo from './Photo.js';
import Purchase from './Purchase.js';
import Like from './Like.js';

// Define associations
User.hasMany(Photo, { 
  foreignKey: 'photographerId', 
  as: 'photos',
  onDelete: 'CASCADE' 
});
Photo.belongsTo(User, { 
  foreignKey: 'photographerId', 
  as: 'photographer' 
});

Category.hasMany(Photo, { 
  foreignKey: 'categoryId', 
  as: 'photos',
  onDelete: 'SET NULL' 
});
Photo.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});

// Purchase associations
User.hasMany(Purchase, { 
  foreignKey: 'buyerId', 
  as: 'purchases',
  onDelete: 'CASCADE' 
});
Purchase.belongsTo(User, { 
  foreignKey: 'buyerId', 
  as: 'buyer' 
});

Photo.hasMany(Purchase, { 
  foreignKey: 'photoId', 
  as: 'purchases',
  onDelete: 'CASCADE' 
});
Purchase.belongsTo(Photo, { 
  foreignKey: 'photoId', 
  as: 'photo' 
});

User.hasMany(Purchase, { 
  foreignKey: 'photographerId', 
  as: 'sales',
  onDelete: 'CASCADE' 
});
Purchase.belongsTo(User, { 
  foreignKey: 'photographerId', 
  as: 'photographer' 
});

// Like associations (Many-to-Many through Like model)
User.belongsToMany(Photo, { 
  through: Like, 
  foreignKey: 'userId',
  otherKey: 'photoId',
  as: 'likedPhotos' 
});
Photo.belongsToMany(User, { 
  through: Like, 
  foreignKey: 'photoId',
  otherKey: 'userId',
  as: 'likedByUsers' 
});

// Direct associations for easier querying
User.hasMany(Like, { 
  foreignKey: 'userId', 
  as: 'likes',
  onDelete: 'CASCADE' 
});
Like.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Photo.hasMany(Like, { 
  foreignKey: 'photoId', 
  as: 'photoLikes',
  onDelete: 'CASCADE' 
});
Like.belongsTo(Photo, { 
  foreignKey: 'photoId', 
  as: 'photo' 
});

export {
  sequelize,
  User,
  Category,
  Photo,
  Purchase,
  Like,
};
