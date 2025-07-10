import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Sequelize, DataTypes, Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, generateVerificationCode, isValidEmail } from './services/emailService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'photobazaar',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'kamlesh@123',
  logging: console.log,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files with optional token authentication
app.use('/uploads', (req, res, next) => {
  // Check if token is provided in query parameter or header
  const token = req.query.token || req.headers['authorization']?.split(' ')[1];
  
  // If no token is provided, allow public access for marketplace viewing
  if (!token) {
    console.log('Public access to image:', req.path);
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, still allow public access for marketplace
    console.log('Invalid token, allowing public access to image:', req.path);
    next();
  }
}, express.static(join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration with local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExtension}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Auto-verify for demo
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
});

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
  },
}, {
  getterMethods: {
    fullImage() {
      return this.imageUrl;
    },
    photographer() {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : 'Unknown';
    }
  },
  instanceMethods: {
    toJSON() {
      const values = Object.assign({}, this.get());
      // Add virtual getters to JSON output
      values.fullImage = this.fullImage;
      values.photographer = this.photographer;
      return values;
    }
  }
});

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  photoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Photo,
      key: 'id',
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'photoId'],
      name: 'unique_user_photo_like'
    }
  ]
});

// View tracking model (one view per user per photo)
const View = sequelize.define('View', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Allow null for anonymous views
    references: {
      model: User,
      key: 'id',
    },
  },
  photoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Photo,
      key: 'id',
    },
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true, // Track IP for anonymous users
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true, // Track user agent for better analytics
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'photoId'],
      where: {
        userId: {
          [Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['ipAddress', 'photoId'],
      where: {
        userId: null
      }
    }
  ]
});

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  photoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Photo,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 6, // Allow 6 downloads per purchase
  },
});

// Email Verification Model
const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
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

// Define associations
User.hasMany(Photo, { foreignKey: 'userId', as: 'photos' });
Photo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Photo, { foreignKey: 'categoryId', as: 'photos' });
Photo.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Photo.hasMany(Like, { foreignKey: 'photoId', as: 'photoLikes' });
Like.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Photo.hasMany(Purchase, { foreignKey: 'photoId', as: 'photoPurchases' });
Purchase.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

// View associations
User.hasMany(View, { foreignKey: 'userId', as: 'views' });
View.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Photo.hasMany(View, { foreignKey: 'photoId', as: 'photoViews' });
View.belongsTo(Photo, { foreignKey: 'photoId', as: 'photo' });

// JWT Helper
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
};

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied', message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Access denied', message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Access denied', message: 'Invalid token' });
  }
};

// Optional Auth Middleware (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user
    }
  }
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AUTH ROUTES

// Send verification code for registration
app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'All fields are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please enter a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User exists',
        message: 'User with this email already exists'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Remove any existing verification for this email
    await EmailVerification.destroy({ where: { email: email.toLowerCase() } });

    // Create new verification entry (store plain password, User model will hash it)
    await EmailVerification.create({
      email: email.toLowerCase(),
      code: verificationCode,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: password, // Store plain password
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email.toLowerCase(), firstName.trim(), verificationCode);
    
    if (!emailResult.success) {
      return res.status(500).json({
        error: 'Email failed',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: email.toLowerCase(),
        expiresIn: 600 // 10 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      error: 'Send verification failed',
      message: 'Failed to send verification code'
    });
  }
});

// Verify code and complete registration
app.post('/api/auth/verify-and-register', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email and verification code are required'
      });
    }

    // Find verification entry
    const verification = await EmailVerification.findOne({
      where: {
        email: email.toLowerCase(),
        code: code,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!verification) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid or expired verification code'
      });
    }

    // Create user (User model will automatically hash the password)
    const user = await User.create({
      firstName: verification.firstName,
      lastName: verification.lastName,
      email: verification.email,
      password: verification.password, // Plain password - will be hashed by User model
    });

    // Mark verification as used
    await verification.update({ isUsed: true });

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      }
    });

  } catch (error) {
    console.error('Verify and register error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Failed to verify code and create account'
    });
  }
});

// Resend verification code
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find existing verification
    const verification = await EmailVerification.findOne({
      where: {
        email: email.toLowerCase(),
        isUsed: false
      }
    });

    if (!verification) {
      return res.status(404).json({
        error: 'No verification found',
        message: 'No pending verification found for this email'
      });
    }

    // Generate new code
    const newCode = generateVerificationCode();
    
    // Update verification with new code and expiry
    await verification.update({
      code: newCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send new verification email
    const emailResult = await sendVerificationEmail(verification.email, verification.firstName, newCode);
    
    if (!emailResult.success) {
      return res.status(500).json({
        error: 'Email failed',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        expiresIn: 600 // 10 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Resend failed',
      message: 'Failed to resend verification code'
    });
  }
});

// Register (legacy endpoint - now redirects to new flow)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User exists',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
    });

    // This is legacy code - users should use the new verification flow
    res.status(201).json({
      success: true,
      message: 'User created (legacy mode)',
      data: { user: { id: user.id, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          bio: user.bio,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token valid',
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        isVerified: req.user.isVerified,
      },
    },
  });
});

// Update profile
app.put('/api/auth/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    // Handle profile image
    if (req.file) {
      // Use local file path
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.profileImage = `${baseUrl}/uploads/${req.file.filename}`;
    }

    await User.update(updateData, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          bio: updatedUser.bio,
          profileImage: updatedUser.profileImage,
          isVerified: updatedUser.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Failed to update profile'
    });
  }
});

// CATEGORY ROUTES

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch categories'
    });
  }
});

// PHOTO ROUTES

// Get all photos
app.get('/api/photos', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sortBy = 'newest',
      priceMin,
      priceMax,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      // Check if category is a slug or an ID
      if (isNaN(category)) {
        // It's a slug, find the category by slug
        const categoryRecord = await Category.findOne({ where: { slug: category } });
        if (categoryRecord) {
          where.categoryId = categoryRecord.id;
        } else {
          // Invalid category slug, return empty results
          return res.json({
            success: true,
            data: {
              photos: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit),
              },
            },
          });
        }
      } else {
        // It's an ID
        where.categoryId = category;
      }
    }

    // Price filter
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        where.price[Op.gte] = parseFloat(priceMin);
        console.log('Price filter - priceMin:', priceMin, 'parsed:', parseFloat(priceMin));
      }
      if (priceMax) {
        where.price[Op.lte] = parseFloat(priceMax);
        console.log('Price filter - priceMax:', priceMax, 'parsed:', parseFloat(priceMax));
      }
      console.log('Price filter where clause:', JSON.stringify(where.price, null, 2));
    }

    // Sorting
    let order = [];
    switch (sortBy) {
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'popular':
        order = [['likes', 'DESC']];
        break;
      case 'views':
        order = [['views', 'DESC']];
        break;
      case 'price-low':
        order = [['price', 'ASC']];
        break;
      case 'price-high':
        order = [['price', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const { count, rows: photos } = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Check if user has liked photos and get purchase status
    if (req.user) {
      const userLikes = await Like.findAll({
        where: { userId: req.user.id },
        attributes: ['photoId'],
      });
      const likedPhotoIds = new Set(userLikes.map(like => like.photoId));

      // Get user's purchases for these photos
      const photoIds = photos.map(photo => photo.id);
      const userPurchases = await Purchase.findAll({
        where: { 
          userId: req.user.id,
          photoId: { [Op.in]: photoIds }
        },
        attributes: ['photoId', 'downloadCount', 'maxDownloads'],
      });
      const purchasedPhotoIds = new Set(userPurchases.map(purchase => purchase.photoId));
      const purchaseData = {};
      userPurchases.forEach(purchase => {
        purchaseData[purchase.photoId] = {
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads
        };
      });

      photos.forEach(photo => {
        photo.dataValues.isLiked = likedPhotoIds.has(photo.id);
        photo.dataValues.isPurchased = purchasedPhotoIds.has(photo.id);
        photo.dataValues.isOwner = photo.userId === req.user.id;
        photo.dataValues.purchaseInfo = purchaseData[photo.id] || null;
        // Add virtual fields
        photo.dataValues.fullImage = photo.imageUrl;
        photo.dataValues.photographer = photo.user ? `${photo.user.firstName} ${photo.user.lastName}` : 'Unknown';
      });
    } else {
      photos.forEach(photo => {
        photo.dataValues.isPurchased = false;
        photo.dataValues.isOwner = false;
        photo.dataValues.purchaseInfo = null;
        // Add virtual fields
        photo.dataValues.fullImage = photo.imageUrl;
        photo.dataValues.photographer = photo.user ? `${photo.user.firstName} ${photo.user.lastName}` : 'Unknown';
      });
    }

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Photos fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch photos'
    });
  }
});

// Get user's photos (must be before /:id route)
app.get('/api/photos/my-photos', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 12, search, sortBy = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    const where = { 
      userId: req.user.id,
      isActive: true  // Only show active (non-deleted) photos
    };

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Sorting
    let order = [];
    switch (sortBy) {
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'popular':
        order = [['likes', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const { count, rows: photos } = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Add virtual fields to photos
    photos.forEach(photo => {
      photo.dataValues.fullImage = photo.imageUrl;
      photo.dataValues.photographer = photo.user ? `${photo.user.firstName} ${photo.user.lastName}` : 'Unknown';
    });

    // Calculate stats from actual data
    const totalViews = photos.reduce((sum, photo) => sum + photo.views, 0);
    const totalLikes = photos.reduce((sum, photo) => sum + photo.likes, 0);
    const totalDownloads = photos.reduce((sum, photo) => sum + photo.downloads, 0);
    
    const stats = {
      totalPhotos: count,
      totalViews: totalViews,
      totalLikes: totalLikes,
      totalDownloads: totalDownloads,
      totalEarnings: 0, // For demo
    };

    res.json({
      success: true,
      data: {
        photos,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('My photos fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch your photos'
    });
  }
});

// Get featured photos for landing page - Simple hardcoded URLs
app.get('/api/photos/featured', async (req, res) => {
  try {
    // Get base URL for local file serving
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Get auth token for image URLs
    const authToken = req.headers['authorization']?.split(' ')[1] || 'demo-token';
    
    // Simple hardcoded featured photos with local URLs
    const featuredPhotos = [
      {
        id: 'featured-1',
        title: 'Stunning Landscape',
        description: 'Professional photography showcasing artistic excellence',
        imageUrl: `${baseUrl}/uploads/featured-landscape.svg?token=${authToken}`,
        thumbnailUrl: `${baseUrl}/uploads/featured-landscape.svg?token=${authToken}`,
        fullImage: `${baseUrl}/uploads/featured-landscape.svg?token=${authToken}`,
        photographer: 'PhotoBazaar Featured',
        price: '29.99',
        views: 5420,
        likes: 234,
        downloads: 89,
        tags: ['featured', 'landscape', 'nature'],
      },
      {
        id: 'featured-2',
        title: 'Urban Architecture',
        description: 'Professional photography showcasing artistic excellence',
        imageUrl: `${baseUrl}/uploads/featured-architecture.svg?token=${authToken}`,
        thumbnailUrl: `${baseUrl}/uploads/featured-architecture.svg?token=${authToken}`,
        fullImage: `${baseUrl}/uploads/featured-architecture.svg?token=${authToken}`,
        photographer: 'PhotoBazaar Featured',
        price: '39.99',
        views: 7830,
        likes: 345,
        downloads: 122,
        tags: ['featured', 'architecture', 'urban'],
      },
      {
        id: 'featured-3',
        title: 'Portrait Photography',
        description: 'Professional photography showcasing artistic excellence',
        imageUrl: `${baseUrl}/uploads/featured-portrait.svg?token=${authToken}`,
        thumbnailUrl: `${baseUrl}/uploads/featured-portrait.svg?token=${authToken}`,
        fullImage: `${baseUrl}/uploads/featured-portrait.svg?token=${authToken}`,
        photographer: 'PhotoBazaar Featured',
        price: '24.99',
        views: 3210,
        likes: 189,
        downloads: 67,
        tags: ['featured', 'portrait', 'people'],
      },
      {
        id: 'featured-4',
        title: 'Abstract Art',
        description: 'Professional photography showcasing artistic excellence',
        imageUrl: `${baseUrl}/uploads/featured-abstract.svg?token=${authToken}`,
        thumbnailUrl: `${baseUrl}/uploads/featured-abstract.svg?token=${authToken}`,
        fullImage: `${baseUrl}/uploads/featured-abstract.svg?token=${authToken}`,
        photographer: 'PhotoBazaar Featured',
        price: '34.99',
        views: 6540,
        likes: 278,
        downloads: 103,
        tags: ['featured', 'abstract', 'art'],
      }
    ];

    res.json({
      success: true,
      data: {
        photos: featuredPhotos,
        count: featuredPhotos.length
      }
    });
  } catch (error) {
    console.error('Featured photos error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch featured photos'
    });
  }
});

// Get single photo
app.get('/api/photos/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'bio'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Track unique views (one view per user per photo)
    let viewCounted = false;
    if (req.user) {
      // For authenticated users, check if they've already viewed this photo
      const existingView = await View.findOne({
        where: { userId: req.user.id, photoId: photo.id },
      });
      
      if (!existingView && req.user.id !== photo.userId) {
        // Only count view if it's not the photo owner
        await View.create({
          userId: req.user.id,
          photoId: photo.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        viewCounted = true;
      }
    } else {
      // For anonymous users, track by IP address
      const existingView = await View.findOne({
        where: { 
          userId: null, 
          photoId: photo.id, 
          ipAddress: req.ip 
        },
      });
      
      if (!existingView) {
        await View.create({
          userId: null,
          photoId: photo.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        viewCounted = true;
      }
    }

    // Update view count in photo if a new view was counted
    if (viewCounted) {
      await Photo.update({ views: photo.views + 1 }, { where: { id: photo.id } });
      photo.views = photo.views + 1; // Update the current instance
    }

    // Check if user has liked this photo and get purchase status
    if (req.user) {
      const like = await Like.findOne({
        where: { userId: req.user.id, photoId: photo.id },
      });
      photo.dataValues.isLiked = !!like;

      // Check if user has purchased this photo
      const purchase = await Purchase.findOne({
        where: { userId: req.user.id, photoId: photo.id },
      });
      photo.dataValues.isPurchased = !!purchase;
      photo.dataValues.isOwner = photo.userId === req.user.id;
      photo.dataValues.purchaseInfo = purchase ? {
        downloadCount: purchase.downloadCount,
        maxDownloads: purchase.maxDownloads,
        purchaseDate: purchase.createdAt
      } : null;
    } else {
      photo.dataValues.isPurchased = false;
      photo.dataValues.isOwner = false;
      photo.dataValues.purchaseInfo = null;
    }

    // Add virtual fields
    photo.dataValues.fullImage = photo.imageUrl;
    photo.dataValues.photographer = photo.user ? `${photo.user.firstName} ${photo.user.lastName}` : 'Unknown';

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    console.error('Photo fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch photo'
    });
  }
});

// Upload photo
app.post('/api/photos/upload', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file',
        message: 'No image file provided'
      });
    }

    const { title, description, price, categoryId, tags } = req.body;

    // Validation
    if (!title || !price || !categoryId) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Title, price, and category are required'
      });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        error: 'Invalid category',
        message: 'Category does not exist'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Use local file path
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    const photo = await Photo.create({
      title: title.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      userId: req.user.id,
      imageUrl,
      thumbnailUrl: imageUrl,
      tags: parsedTags,
    });

    // Get photo with associations
    const createdPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photo: createdPhoto },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload photo'
    });
  }
});

// Update photo
app.put('/api/photos/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Check ownership
    if (photo.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own photos'
      });
    }

    const { title, description, price, categoryId, tags, isActive } = req.body;

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Category does not exist'
        });
      }
    }

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : photo.tags;

    // Update photo
    await photo.update({
      title: title?.trim() || photo.title,
      description: description?.trim() || photo.description,
      price: price ? parseFloat(price) : photo.price,
      categoryId: categoryId ? parseInt(categoryId) : photo.categoryId,
      tags: parsedTags,
      isActive: isActive !== undefined ? isActive : photo.isActive,
    });

    // Get updated photo with associations
    const updatedPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Photo updated successfully',
      data: { photo: updatedPhoto },
    });
  } catch (error) {
    console.error('Photo update error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Failed to update photo'
    });
  }
});

// Delete photo
app.delete('/api/photos/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Check ownership
    if (photo.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own photos'
      });
    }

    // Delete local file if it exists
    if (photo.imageUrl && photo.imageUrl.includes('/uploads/')) {
      try {
        // Extract filename from URL
        const filename = photo.imageUrl.split('/uploads/').pop();
        const filePath = join(__dirname, 'uploads', filename);
        
        // Check if file exists and delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Local file deleted:', filename);
        }
      } catch (fileError) {
        console.error('Local file deletion error:', fileError);
        // Continue with soft delete even if file deletion fails
      }
    }

    // Soft delete from database
    await photo.update({ isActive: false });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Failed to delete photo'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PhotoBazaar Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Like/Unlike photo
app.post('/api/photos/:id/like', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Prevent users from liking their own photos
    if (photo.userId === req.user.id) {
      return res.status(400).json({
        error: 'Cannot like own photo',
        message: 'You cannot like your own photo'
      });
    }

    const existingLike = await Like.findOne({
      where: { userId: req.user.id, photoId: photo.id },
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();
      
      // Update photo likes count (ensure it doesn't go below 0)
      const newLikesCount = Math.max(0, photo.likes - 1);
      await photo.update({ likes: newLikesCount });

      res.json({
        success: true,
        message: 'Photo unliked',
        data: { 
          isLiked: false, 
          likesCount: newLikesCount,
          photoId: photo.id 
        },
      });
    } else {
      // Like - create new like record
      try {
        await Like.create({
          userId: req.user.id,
          photoId: photo.id,
        });
        
        // Update photo likes count
        const newLikesCount = photo.likes + 1;
        await photo.update({ likes: newLikesCount });

        res.json({
          success: true,
          message: 'Photo liked',
          data: { 
            isLiked: true, 
            likesCount: newLikesCount,
            photoId: photo.id 
          },
        });
      } catch (createError) {
        // Handle potential duplicate key constraint violation
        if (createError.name === 'SequelizeUniqueConstraintError') {
          // Like already exists (race condition), just return current state
          const currentLike = await Like.findOne({
            where: { userId: req.user.id, photoId: photo.id },
          });
          
          res.json({
            success: true,
            message: 'Photo already liked',
            data: { 
              isLiked: !!currentLike, 
              likesCount: photo.likes,
              photoId: photo.id 
            },
          });
        } else {
          throw createError;
        }
      }
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({
      error: 'Like failed',
      message: 'Failed to like/unlike photo'
    });
  }
});

// Purchase photo (Simple demo version)
app.post('/api/photos/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Check if user already purchased this photo
    const existingPurchase = await Purchase.findOne({
      where: { userId: req.user.id, photoId: photo.id },
    });

    if (existingPurchase) {
      return res.json({
        success: true,
        message: 'Photo already purchased',
        data: { 
          purchase: {
            id: existingPurchase.id,
            amount: existingPurchase.amount,
            downloadCount: existingPurchase.downloadCount,
            maxDownloads: existingPurchase.maxDownloads,
            purchaseDate: existingPurchase.createdAt
          }
        },
      });
    }

    // Create purchase record (simple demo - no actual payment)
    const purchase = await Purchase.create({
      userId: req.user.id,
      photoId: photo.id,
      amount: photo.price,
      downloadCount: 0,
      maxDownloads: 6, // Allow 6 downloads per purchase
    });

    res.json({
      success: true,
      message: 'Photo purchased successfully! (Demo)',
      data: { 
        purchase: {
          id: purchase.id,
          amount: purchase.amount,
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads,
          purchaseDate: purchase.createdAt
        }
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      error: 'Purchase failed',
      message: 'Failed to purchase photo'
    });
  }
});

// Download photo (Simple demo version)
app.get('/api/photos/:id/download', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Check if user has purchased this photo
    const purchase = await Purchase.findOne({
      where: { userId: req.user.id, photoId: photo.id },
    });

    if (!purchase) {
      return res.status(403).json({
        error: 'Purchase required',
        message: 'You must purchase this photo before downloading'
      });
    }

    // Check download limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(403).json({
        error: 'Download limit exceeded',
        message: `You have reached the maximum number of downloads (${purchase.maxDownloads}) for this photo`
      });
    }

    // Increment download count
    const newDownloadCount = purchase.downloadCount + 1;
    await purchase.update({ downloadCount: newDownloadCount });
    
    // Increment photo downloads count
    await photo.update({ downloads: photo.downloads + 1 });

    // For download endpoint, we'll return a JSON response with download URL
    // The frontend will handle the actual file download
    res.json({
      success: true,
      message: 'Photo download ready',
      data: { 
        downloadUrl: photo.imageUrl,
        filename: `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`,
        remainingDownloads: purchase.maxDownloads - newDownloadCount,
        downloadCount: newDownloadCount,
        maxDownloads: purchase.maxDownloads,
        totalDownloads: photo.downloads + 1
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'Failed to download photo'
    });
  }
});

// Direct file download endpoint (for actual file serving)
app.get('/api/photos/:id/download-file', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Photo does not exist'
      });
    }

    // Check if user has purchased this photo
    const purchase = await Purchase.findOne({
      where: { userId: req.user.id, photoId: photo.id },
    });

    if (!purchase) {
      return res.status(403).json({
        error: 'Purchase required',
        message: 'You must purchase this photo before downloading'
      });
    }

    // Check download limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(403).json({
        error: 'Download limit exceeded',
        message: `You have reached the maximum number of downloads (${purchase.maxDownloads}) for this photo`
      });
    }

    // Extract filename from image URL
    const filename = photo.imageUrl.split('/uploads/').pop();
    const filePath = join(__dirname, 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'Image file not found on server'
      });
    }

    // Don't increment download count here - it's already done in the main download endpoint
    // This endpoint is only for serving the actual file

    // Set proper headers for file download
    const downloadName = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'Failed to download file'
    });
  }
});

// Get user's purchased photos
app.get('/api/photos/purchased', authenticateToken, async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const purchasedPhotos = [];
    
    for (const purchase of purchases) {
      const photo = await Photo.findByPk(purchase.photoId, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      });
      
      if (photo && photo.isActive) {
        purchasedPhotos.push({
          id: purchase.id,
          purchaseDate: purchase.createdAt,
          amount: purchase.amount,
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads,
          photo: {
            id: photo.id,
            title: photo.title,
            description: photo.description,
            imageUrl: photo.imageUrl,
            price: photo.price,
            tags: photo.tags || [],
            photographer: `${photo.user.firstName} ${photo.user.lastName}`,
            category: { name: 'Photo', slug: 'photo' }
          }
        });
      }
    }

    res.json({
      success: true,
      data: { purchases: purchasedPhotos },
    });
  } catch (error) {
    console.error('Purchased photos error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch purchased photos'
    });
  }
});

// Check if user has purchased a photo
app.get('/api/photos/:id/purchase-status', authenticateToken, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      where: { userId: req.user.id, photoId: req.params.id },
    });

    res.json({
      success: true,
      data: { 
        purchased: !!purchase,
        purchase: purchase ? {
          id: purchase.id,
          amount: purchase.amount,
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads,
          purchaseDate: purchase.createdAt
        } : null
      },
    });
  } catch (error) {
    console.error('Purchase status error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: 'Failed to check purchase status'
    });
  }
});

// Get user's liked photos
app.get('/api/photos/liked', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const likes = await Like.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Photo,
          as: 'photo',
          where: { isActive: true },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'profileImage'],
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Format the response
    const likedPhotos = likes.rows.map(like => {
      const photo = like.photo;
      photo.dataValues.fullImage = photo.imageUrl;
      photo.dataValues.photographer = photo.user ? `${photo.user.firstName} ${photo.user.lastName}` : 'Unknown';
      photo.dataValues.isLiked = true; // All photos in this list are liked
      return photo;
    });

    res.json({
      success: true,
      data: {
        photos: likedPhotos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(likes.count / limit),
          totalItems: likes.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Liked photos fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch liked photos'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// Database sync and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Seed categories if none exist
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { name: 'Landscape', slug: 'landscape', description: 'Beautiful landscapes and nature' },
        { name: 'Portrait', slug: 'portrait', description: 'People and portrait photography' },
        { name: 'Street', slug: 'street', description: 'Street photography and urban scenes' },
        { name: 'Wildlife', slug: 'wildlife', description: 'Animals and wildlife photography' },
        { name: 'Architecture', slug: 'architecture', description: 'Buildings and architectural photography' },
        { name: 'Abstract', slug: 'abstract', description: 'Abstract and artistic photography' },
      ]);
      console.log('✅ Default categories created');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PhotoBazaar Backend running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
