import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'photo_id'],
    },
  ],
});

export default Like;
