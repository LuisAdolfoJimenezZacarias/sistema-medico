import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Administrativo = sequelize.define('Administrativo', {
  id_administrativo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  id_unidad: { type: DataTypes.INTEGER, allowNull: false },

  nombre: { type: DataTypes.STRING(150), allowNull: false },
  apellido_paterno: { type: DataTypes.STRING(100), allowNull: false },
  apellido_materno: { type: DataTypes.STRING(100), allowNull: true },

  area_trabajo: { type: DataTypes.STRING(100), allowNull: true },
  numero_empleado: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'administrativos',
  timestamps: false
});

export default Administrativo;