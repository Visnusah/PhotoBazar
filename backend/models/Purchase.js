import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Platform commission amount',
  },
  photographerEarning: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount earned by photographer after commission',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  downloadUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Temporary download URL for purchased photo',
  },
  downloadExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration time for download URL',
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Maximum number of downloads allowed',
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  hooks: {
    beforeCreate: (purchase) => {
      // Calculate photographer earning (assuming 70% goes to photographer, 30% commission)
      const commissionRate = 0.30;
      purchase.commission = (purchase.amount * commissionRate).toFixed(2);
      purchase.photographerEarning = (purchase.amount * (1 - commissionRate)).toFixed(2);
    },
  },
});

// Instance methods
Purchase.prototype.canDownload = function() {
  return this.status === 'completed' && 
         this.downloadCount < this.maxDownloads &&
         (!this.downloadExpiresAt || new Date() < this.downloadExpiresAt);
};

Purchase.prototype.incrementDownload = async function() {
  if (this.canDownload()) {
    this.downloadCount += 1;
    await this.save();
    return true;
  }
  return false;
};

export default Purchase;
