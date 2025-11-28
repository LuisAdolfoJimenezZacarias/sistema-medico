import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Unidad = sequelize.define('Unidad', {
  id_unidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  clues: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  nivel_atencion: {
    type: DataTypes.ENUM('1','2','3'),
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'unidades_medicas',
  timestamps: false
});

export default Unidad;