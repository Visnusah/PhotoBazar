import express from 'express';
import { User, Photo, Category, Purchase } from '../models/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    // Get user's public stats
    const stats = {
      totalPhotos: await Photo.count({
        where: { photographerId: user.id, isActive: true },
      }),
      totalDownloads: await Photo.sum('downloads', {
        where: { photographerId: user.id, isActive: true },
      }) || 0,
      totalViews: await Photo.sum('views', {
        where: { photographerId: user.id, isActive: true },
      }) || 0,
    };

    res.json({
      success: true,
      data: {
        user: {
          ...user.toJSON(),
          stats,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'Internal server error',
    });
  }
});

// Get user's photos
router.get('/:id/photos', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'newest',
    } = req.query;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
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
      case 'popular':
        order = [['downloads', 'DESC']];
        break;
      case 'views':
        order = [['views', 'DESC']];
        break;
      default:
        order = [['uploadedAt', 'DESC']];
    }

    const offset = (page - 1) * limit;
    const { count, rows: photos } = await Photo.findAndCountAll({
      where: { 
        photographerId: req.params.id,
        isActive: true,
      },
      include: [
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
    console.error('Get user photos error:', error);
    res.status(500).json({
      error: 'Failed to fetch user photos',
      message: 'Internal server error',
    });
  }
});

// Get user's dashboard stats (authenticated user only)
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
  try {
    // Only allow users to see their own dashboard or admins
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own dashboard',
      });
    }

    const userId = req.params.id;

    // Get comprehensive stats
    const [
      totalPhotos,
      totalViews,
      totalDownloads,
      totalLikes,
      totalEarnings,
      recentPurchases,
      topPhotos,
    ] = await Promise.all([
      Photo.count({
        where: { photographerId: userId, isActive: true },
      }),
      Photo.sum('views', {
        where: { photographerId: userId, isActive: true },
      }),
      Photo.sum('downloads', {
        where: { photographerId: userId, isActive: true },
      }),
      Photo.sum('likesCount', {
        where: { photographerId: userId, isActive: true },
      }),
      Purchase.sum('photographerEarning', {
        where: { photographerId: userId, status: 'completed' },
      }),
      Purchase.findAll({
        where: { photographerId: userId },
        include: [
          {
            model: Photo,
            as: 'photo',
            attributes: ['id', 'title', 'imageUrl'],
          },
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['purchasedAt', 'DESC']],
        limit: 5,
      }),
      Photo.findAll({
        where: { photographerId: userId, isActive: true },
        attributes: ['id', 'title', 'imageUrl', 'views', 'downloads', 'likesCount', 'price'],
        order: [['downloads', 'DESC']],
        limit: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalPhotos: totalPhotos || 0,
          totalViews: totalViews || 0,
          totalDownloads: totalDownloads || 0,
          totalLikes: totalLikes || 0,
          totalEarnings: parseFloat(totalEarnings) || 0,
        },
        recentPurchases,
        topPhotos,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'Internal server error',
    });
  }
});

// Get featured photographers
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get photographers with highest earnings or downloads
    const photographers = await User.findAll({
      where: { role: 'photographer' },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'profileImage',
        'bio',
        'totalEarnings',
        'totalSales',
      ],
      include: [
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'imageUrl'],
          where: { isActive: true },
          limit: 3,
          order: [['downloads', 'DESC']],
        },
      ],
      order: [['totalEarnings', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: { photographers },
    });
  } catch (error) {
    console.error('Get featured photographers error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured photographers',
      message: 'Internal server error',
    });
  }
});

export default router;
