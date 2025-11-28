import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Director = sequelize.define('Director', {
  id_director: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  id_unidad: { type: DataTypes.INTEGER, allowNull: false, unique: true },

  nombre: { type: DataTypes.STRING(80), allowNull: false },
  apellido_paterno: { type: DataTypes.STRING(80), allowNull: false },
  apellido_materno: { type: DataTypes.STRING(80), allowNull: true },

  fecha_inicio_cargo: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'directores',
  timestamps: false
});

export default Director;