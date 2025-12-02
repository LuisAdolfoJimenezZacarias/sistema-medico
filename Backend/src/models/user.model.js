import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
const isBcryptHash = v => typeof v === 'string' && /^\$2[aby]\$\d{2}\$/.test(v);

import { sequelize } from '../config/database.js';

const User = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    field: 'id_usuario',
    primaryKey: true,
    autoIncrement: true
  },
  // NOTE: removed 'name' attribute because the DB table `usuarios` doesn't have a `name` column.
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {// mapeo a password_hash en la DB
    type: DataTypes.STRING,
    allowNull: false
  },
  id_rol: {               // match DB column
    type: DataTypes.INTEGER,
    allowNull: false
  },

  activo: {
    type: DataTypes.BOOLEAN,
    field: 'activo',
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash && !isBcryptHash(user.password_hash)) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      // user.changed exists en instancias Sequelize; protejo por si no está
      const changed = typeof user.changed === 'function' ? user.changed('password_hash') : true;
      if (changed && user.password_hash && !isBcryptHash(user.password_hash)) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

export default User;
