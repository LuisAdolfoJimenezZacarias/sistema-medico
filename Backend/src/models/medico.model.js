import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Medico = sequelize.define('Medico', {
  id_medico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  id_unidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  apellido_paterno: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_materno: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cedula_profesional: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  telefono_contacto: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'medicos',
  timestamps: false
});

export default Medico;
