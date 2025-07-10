import express from 'express';
import { Purchase, Photo, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePurchase } from '../middleware/validation.js';

const router = express.Router();

// Create new purchase
router.post('/', authenticateToken, validatePurchase, async (req, res) => {
  try {
    const { photoId, paymentMethod } = req.body;
    const buyerId = req.user.id;

    // Check if photo exists and is available
    const photo = await Photo.findByPk(photoId, {
      include: [
        {
          model: User,
          as: 'photographer',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The requested photo is not available for purchase',
      });
    }

    // Check if user is trying to buy their own photo
    if (photo.photographerId === buyerId) {
      return res.status(400).json({
        error: 'Invalid purchase',
        message: 'You cannot purchase your own photo',
      });
    }

    // Check if photo is exclusive and already sold
    if (photo.isExclusive && photo.sold) {
      return res.status(400).json({
        error: 'Photo unavailable',
        message: 'This exclusive photo has already been sold',
      });
    }

    // Check if user has already purchased this photo
    const existingPurchase = await Purchase.findOne({
      where: {
        buyerId,
        photoId,
        status: 'completed',
      },
    });

    if (existingPurchase) {
      return res.status(400).json({
        error: 'Already purchased',
        message: 'You have already purchased this photo',
      });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      buyerId,
      photoId,
      photographerId: photo.photographerId,
      amount: photo.price,
      paymentMethod,
      status: 'pending',
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Simulate payment processing
    // In a real application, you would integrate with Stripe, PayPal, etc.
    setTimeout(async () => {
      try {
        // Mark purchase as completed
        await purchase.update({
          status: 'completed',
          downloadUrl: photo.fullImageUrl,
          downloadExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        // Update photo stats
        await photo.incrementDownload();

        // If exclusive, mark as sold
        if (photo.isExclusive) {
          await photo.update({ sold: true });
        }

        // Update photographer earnings
        const photographer = await User.findByPk(photo.photographerId);
        await photographer.update({
          totalEarnings: parseFloat(photographer.totalEarnings) + parseFloat(purchase.photographerEarning),
          totalSales: photographer.totalSales + 1,
        });

        console.log(`Purchase ${purchase.id} completed successfully`);
      } catch (error) {
        console.error('Error completing purchase:', error);
        await purchase.update({ status: 'failed' });
      }
    }, 2000); // 2 second delay to simulate payment processing

    const completePurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: Photo,
          as: 'photo',
          attributes: ['id', 'title', 'imageUrl', 'price'],
        },
        {
          model: User,
          as: 'photographer',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Purchase initiated successfully',
      data: { purchase: completePurchase },
    });
  } catch (error) {
    console.error('Purchase creation error:', error);
    res.status(500).json({
      error: 'Purchase failed',
      message: 'Internal server error',
    });
  }
});

// Get user's purchases
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { buyerId: req.user.id };

    if (status) {
      where.status = status;
    }

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where,
      include: [
        {
          model: Photo,
          as: 'photo',
          attributes: ['id', 'title', 'imageUrl', 'thumbnailUrl'],
          include: [
            {
              model: User,
              as: 'photographer',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['purchasedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      error: 'Failed to fetch purchases',
      message: 'Internal server error',
    });
  }
});

// Get purchase by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: Photo,
          as: 'photo',
          attributes: ['id', 'title', 'imageUrl', 'fullImageUrl'],
          include: [
            {
              model: User,
              as: 'photographer',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!purchase) {
      return res.status(404).json({
        error: 'Purchase not found',
        message: 'The requested purchase does not exist',
      });
    }

    // Check ownership (buyer or photographer can view, or admin)
    const canView = purchase.buyerId === req.user.id || 
                   purchase.photographerId === req.user.id || 
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own purchases',
      });
    }

    res.json({
      success: true,
      data: { purchase },
    });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({
      error: 'Failed to fetch purchase',
      message: 'Internal server error',
    });
  }
});

// Download purchased photo
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: Photo,
          as: 'photo',
          attributes: ['id', 'title', 'fullImageUrl'],
        },
      ],
    });

    if (!purchase) {
      return res.status(404).json({
        error: 'Purchase not found',
        message: 'The requested purchase does not exist',
      });
    }

    // Check ownership
    if (purchase.buyerId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only download your own purchases',
      });
    }

    // Check if download is allowed
    if (!purchase.canDownload()) {
      return res.status(400).json({
        error: 'Download not available',
        message: 'Download limit exceeded or purchase expired',
      });
    }

    // Increment download count
    const success = await purchase.incrementDownload();
    if (!success) {
      return res.status(400).json({
        error: 'Download failed',
        message: 'Unable to process download',
      });
    }

    res.json({
      success: true,
      message: 'Download link generated',
      data: {
        downloadUrl: purchase.photo.fullImageUrl,
        remainingDownloads: purchase.maxDownloads - purchase.downloadCount,
        expiresAt: purchase.downloadExpiresAt,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'Internal server error',
    });
  }
});

// Get sales (for photographers)
router.get('/sales/my-sales', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { photographerId: req.user.id };

    if (status) {
      where.status = status;
    }

    const { count, rows: sales } = await Purchase.findAndCountAll({
      where,
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
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales',
      message: 'Internal server error',
    });
  }
});

export default router;
