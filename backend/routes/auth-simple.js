import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/upload.js';

const router = express.Router();

// Add CORS headers for debugging
router.use((req, res, next) => {
  console.log(`🌐 Auth request: ${req.method} ${req.path} from ${req.get('origin') || 'unknown origin'}`);
  next();
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
};

// Simple registration - no complex validation
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required',
        message: 'Please provide firstName, lastName, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      role: 'user',
      bio: '',
      isVerified: true // Auto-verify
    });

    // Generate token
    const token = generateToken(user.id);

    console.log(`✅ New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profileImage: user.profileImage,
          bio: user.bio
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Registration failed',
      message: 'An internal error occurred. Please try again.'
    });
  }
});

// Simple login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate token
    const token = generateToken(user.id);

    console.log(`✅ User logged in: ${user.email}`);

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
          isVerified: user.isVerified,
          profileImage: user.profileImage,
          bio: user.bio,
          totalEarnings: user.totalEarnings,
          totalSales: user.totalSales,
          lastLoginAt: user.lastLoginAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An internal error occurred. Please try again.'
    });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        profileImage: req.user.profileImage,
        bio: req.user.bio
      }
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Update user profile
router.put('/profile', authenticateToken, uploadProfile, async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    await User.update(updateData, {
      where: { id: req.user.id },
    });

    const updatedUser = await User.findByPk(req.user.id);

    console.log(`✅ Profile updated: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error',
    });
  }
});

export default router;
