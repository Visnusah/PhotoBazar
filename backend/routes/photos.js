import express from 'express';
import { Op } from 'sequelize';
import { Photo, User, Category, Like, Purchase } from '../models/index.js';
import { authenticateToken, optionalAuth, requireOwnership } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validatePhotoUpload, validatePhotoUpdate } from '../middleware/validation.js';

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
      where.photographerId = photographer;
    }

    // Featured filter
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Sorting
    let order = [];
    switch (sortBy) {
      case 'newest':
        order = [['uploadedAt', 'DESC']];
        break;
      case 'oldest':
        order = [['uploadedAt', 'ASC']];
        break;
      case 'price-low':
        order = [['price', 'ASC']];
        break;
      case 'price-high':
        order = [['price', 'DESC']];
        break;
      case 'popular':
        order = [['downloads', 'DESC']];
        break;
      case 'views':
        order = [['views', 'DESC']];
        break;
      default:
        order = [['uploadedAt', 'DESC']];
    }

    const { count, rows: photos } = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'photographer',
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

    // Add like status for authenticated users
    if (req.user) {
      const photoIds = photos.map(photo => photo.id);
      const userLikes = await Like.findAll({
        where: {
          userId: req.user.id,
          photoId: { [Op.in]: photoIds },
        },
      });
      const likedPhotoIds = new Set(userLikes.map(like => like.photoId));

      photos.forEach(photo => {
        photo.dataValues.isLiked = likedPhotoIds.has(photo.id);
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
    console.error('Get photos error:', error);
    res.status(500).json({
      error: 'Failed to fetch photos',
      message: 'Internal server error',
    });
  }
});

// Get photo by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'photographer',
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
        message: 'The requested photo does not exist or is not available',
      });
    }

    // Increment view count
    await photo.incrementView();

    // Check if user has liked this photo
    if (req.user) {
      const like = await Like.findOne({
        where: {
          userId: req.user.id,
          photoId: photo.id,
        },
      });
      photo.dataValues.isLiked = !!like;

      // Check if user has purchased this photo
      const purchase = await Purchase.findOne({
        where: {
          buyerId: req.user.id,
          photoId: photo.id,
          status: 'completed',
        },
      });
      photo.dataValues.isPurchased = !!purchase;
    }

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({
      error: 'Failed to fetch photo',
      message: 'Internal server error',
    });
  }
});

// Upload new photo
router.post('/', authenticateToken, uploadSingle, validatePhotoUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Upload failed',
        message: 'No image file provided',
      });
    }

    const { title, description, price, categoryId, tags, isExclusive } = req.body;

    // In production, you would upload to Cloudinary or similar service
    const imageUrl = `/uploads/${req.file.filename}`;
    const thumbnailUrl = imageUrl; // In production, generate thumbnail
    const fullImageUrl = imageUrl;

    const photo = await Photo.create({
      title,
      description,
      price: parseFloat(price),
      categoryId,
      photographerId: req.user.id,
      imageUrl,
      thumbnailUrl,
      fullImageUrl,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      isExclusive: isExclusive === 'true',
      width: req.file.width || null,
      height: req.file.height || null,
      fileSize: req.file.size,
      format: req.file.mimetype.split('/')[1],
    });

    const createdPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'photographer',
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
      message: 'Internal server error',
    });
  }
});

// Update photo
router.put('/:id', authenticateToken, validatePhotoUpdate, async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo does not exist',
      });
    }

    // Check ownership
    if (photo.photographerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own photos',
      });
    }

    const { title, description, price, categoryId, tags, isExclusive, isActive } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (categoryId) updateData.categoryId = categoryId;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (isExclusive !== undefined) updateData.isExclusive = isExclusive;
    if (isActive !== undefined) updateData.isActive = isActive;

    await photo.update(updateData);

    const updatedPhoto = await Photo.findByPk(photo.id, {
      include: [
        {
          model: User,
          as: 'photographer',
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
      message: 'Internal server error',
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
    if (photo.photographerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own photos',
      });
    }

    await photo.destroy();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Internal server error',
    });
  }
});

// Like/unlike photo
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
      where: {
        userId: req.user.id,
        photoId: photo.id,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await photo.update({ likesCount: photo.likesCount - 1 });
      
      res.json({
        success: true,
        message: 'Photo unliked',
        data: { isLiked: false, likesCount: photo.likesCount - 1 },
      });
    } else {
      // Like
      await Like.create({
        userId: req.user.id,
        photoId: photo.id,
      });
      await photo.update({ likesCount: photo.likesCount + 1 });

      res.json({
        success: true,
        message: 'Photo liked',
        data: { isLiked: true, likesCount: photo.likesCount + 1 },
      });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({
      error: 'Like action failed',
      message: 'Internal server error',
    });
  }
});

export default router;
