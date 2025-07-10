import express from 'express';
import { Category, Photo, User } from '../models/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateCategory } from '../middleware/validation.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { includeCount = false } = req.query;

    let include = [];
    let attributes = ['id', 'name', 'slug', 'description', 'isActive'];

    if (includeCount === 'true') {
      include.push({
        model: Photo,
        as: 'photos',
        attributes: [],
        where: { isActive: true },
        required: false,
      });
      attributes.push([
        Photo.sequelize.fn('COUNT', Photo.sequelize.col('photos.id')),
        'photoCount'
      ]);
    }

    const categories = await Category.findAll({
      attributes,
      include,
      where: { isActive: true },
      group: includeCount === 'true' ? ['Category.id'] : undefined,
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'Internal server error',
    });
  }
});

// Get category by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Check if identifier is UUID (ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    const whereClause = isUUID ? { id: identifier } : { slug: identifier };

    const category = await Category.findOne({
      where: { ...whereClause, isActive: true },
    });

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'The requested category does not exist',
      });
    }

    // Get photos in this category
    const offset = (page - 1) * limit;
    const { count, rows: photos } = await Photo.findAndCountAll({
      where: { categoryId: category.id, isActive: true },
      include: [
        {
          model: User,
          as: 'photographer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
      ],
      order: [['uploadedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        category,
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
    console.error('Get category error:', error);
    res.status(500).json({
      error: 'Failed to fetch category',
      message: 'Internal server error',
    });
  }
});

// Create new category (Admin only)
router.post('/', authenticateToken, requireRole('admin'), validateCategory, async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    const category = await Category.create({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      error: 'Category creation failed',
      message: 'Internal server error',
    });
  }
});

// Update category (Admin only)
router.put('/:id', authenticateToken, requireRole('admin'), validateCategory, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'The requested category does not exist',
      });
    }

    const { name, description, slug, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (isActive !== undefined) updateData.isActive = isActive;

    await category.update(updateData);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      error: 'Category update failed',
      message: 'Internal server error',
    });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'The requested category does not exist',
      });
    }

    // Check if category has photos
    const photoCount = await Photo.count({
      where: { categoryId: category.id },
    });

    if (photoCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete category',
        message: 'Category contains photos. Please move or delete photos first.',
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: 'Category deletion failed',
      message: 'Internal server error',
    });
  }
});

export default router;
