import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Referral from './referral.model.js';

const CounterReferral = sequelize.define('CounterReferral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  counterReferralId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  followUpNeeded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateCreated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Sent', 'Received'),
    defaultValue: 'Pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Associations
CounterReferral.belongsTo(Referral, { foreignKey: 'referralId', as: 'referral' });
CounterReferral.belongsTo(User, { foreignKey: 'referringDoctorId', as: 'referringDoctor' });
CounterReferral.belongsTo(User, { foreignKey: 'referredDoctorId', as: 'referredDoctor' });

export default CounterReferral;
