import express from 'express';
import { Op } from 'sequelize';
import { Photo, User, Category, Like, Purchase } from '../models/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Get all photos with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      priceMin,
      priceMax,
      sortBy = 'newest',
      photographer,
      featured,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      const categoryRecord = await Category.findOne({ where: { slug: category } });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Price filter
    if (priceMin) where.price = { [Op.gte]: priceMin };
    if (priceMax) where.price = { ...where.price, [Op.lte]: priceMax };

    // Photographer filter
    if (photographer) {
      const photographerRecord = await User.findOne({ where: { email: photographer } });
      if (photographerRecord) {
        where.userId = photographerRecord.id;
      }
    }

    // Featured filter
    if (featured === 'true') {
      where.isFeatured = true;
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
      case 'price_low':
        order = [['price', 'ASC']];
        break;
      case 'price_high':
        order = [['price', 'DESC']];
        break;
      case 'popular':
        order = [['views', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const photos = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        ...(req.user ? [{
          model: Like,
          as: 'likes',
          where: { userId: req.user.id },
          required: false,
        }] : []),
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        photos: photos.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: photos.count,
          pages: Math.ceil(photos.count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({
      error: 'Failed to fetch photos',
      message: 'An internal error occurred',
    });
  }
});

// Get user's photos (for dashboard)
router.get('/my-photos', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      status = 'all',
      sortBy = 'newest',
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    // Status filter
    if (status !== 'all') {
      where.isActive = status === 'active';
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
      case 'price_low':
        order = [['price', 'ASC']];
        break;
      case 'price_high':
        order = [['price', 'DESC']];
        break;
      case 'popular':
        order = [['views', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const photos = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id'],
        },
        {
          model: Purchase,
          as: 'purchases',
          attributes: ['id', 'createdAt'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    // Calculate stats
    const stats = {
      totalPhotos: photos.count,
      totalViews: photos.rows.reduce((sum, photo) => sum + photo.views, 0),
      totalEarnings: photos.rows.reduce((sum, photo) => sum + (photo.purchases?.length || 0) * photo.price, 0),
      totalLikes: photos.rows.reduce((sum, photo) => sum + (photo.likes?.length || 0), 0),
    };

    res.json({
      success: true,
      data: {
        photos: photos.rows,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: photos.count,
          pages: Math.ceil(photos.count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user photos:', error);
    res.status(500).json({
      error: 'Failed to fetch photos',
      message: 'An internal error occurred',
    });
  }
});

// Upload new photo
router.post('/upload', authenticateToken, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload',
      });
    }

    const {
      title,
      description,
      price,
      categoryId,
      tags,
    } = req.body;

    // Basic validation
    if (!title || !price || !categoryId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide title, price, and category',
      });
    }

    // Validate category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        error: 'Invalid category',
        message: 'Selected category does not exist',
      });
    }

    // Create photo URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const thumbnailUrl = imageUrl; // For now, using same image for thumbnail
    const fullImageUrl = imageUrl;

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    const photo = await Photo.create({
      title: title.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      userId: req.user.id,
      imageUrl,
      thumbnailUrl,
      fullImageUrl,
      tags: parsedTags,
      views: 0,
      likes: 0,
      isActive: true,
      isFeatured: false,
    });

    // Fetch the created photo with associations
    const createdPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    console.log(`✅ Photo uploaded: ${photo.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully!',
      data: {
        photo: createdPhoto,
      },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'An internal error occurred while uploading the photo',
    });
  }
});

// Get single photo
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
        {
          model: Purchase,
          as: 'purchases',
          attributes: ['id', 'createdAt'],
        },
      ],
    });

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo does not exist',
      });
    }

    // Increment views
    await photo.increment('views');

    // Check if user has liked this photo
    if (req.user) {
      const userLike = await Like.findOne({
        where: { userId: req.user.id, photoId: photo.id },
      });
      photo.dataValues.isLiked = !!userLike;
    }

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({
      error: 'Failed to fetch photo',
      message: 'An internal error occurred',
    });
  }
});

// Update photo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo does not exist',
      });
    }

    // Check ownership
    if (photo.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only edit your own photos',
      });
    }

    const {
      title,
      description,
      price,
      categoryId,
      tags,
      isActive,
    } = req.body;

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Selected category does not exist',
        });
      }
    }

    // Parse tags if provided
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

    // Fetch updated photo with associations
    const updatedPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    console.log(`✅ Photo updated: ${photo.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Photo updated successfully!',
      data: {
        photo: updatedPhoto,
      },
    });
  } catch (error) {
    console.error('Photo update error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An internal error occurred while updating the photo',
    });
  }
});

// Delete photo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo does not exist',
      });
    }

    // Check ownership
    if (photo.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only delete your own photos',
      });
    }

    // Soft delete (set isActive to false)
    await photo.update({ isActive: false });

    console.log(`✅ Photo deleted: ${photo.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Photo deleted successfully!',
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'An internal error occurred while deleting the photo',
    });
  }
});

// Like/Unlike photo
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo does not exist',
      });
    }

    const existingLike = await Like.findOne({
      where: { userId: req.user.id, photoId: photo.id },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await photo.decrement('likes');
      
      res.json({
        success: true,
        message: 'Photo unliked',
        data: { isLiked: false },
      });
    } else {
      // Like
      await Like.create({
        userId: req.user.id,
        photoId: photo.id,
      });
      await photo.increment('likes');
      
      res.json({
        success: true,
        message: 'Photo liked',
        data: { isLiked: true },
      });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({
      error: 'Action failed',
      message: 'An internal error occurred',
    });
  }
});

export default router;
