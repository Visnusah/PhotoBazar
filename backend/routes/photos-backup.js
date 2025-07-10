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
