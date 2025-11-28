import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Patient = sequelize.define('Paciente', {
  id_paciente: {
     type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido_paterno: { type: DataTypes.STRING(100), allowNull: false },
  apellido_materno: { type: DataTypes.STRING(100), allowNull: false },
  curp: { type: DataTypes.STRING(18), allowNull: false, unique: true },
  fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
  genero: { type: DataTypes.ENUM('M','F','Otro'), allowNull: true },
  domicilio: { type: DataTypes.STRING(255), allowNull: true },
  telefono: { type: DataTypes.STRING(30), allowNull: true },
  familiar_responsable: { type: DataTypes.STRING(150), allowNull: true },
  discapacidad: { type: DataTypes.STRING(255), allowNull: true },
  nss: { type: DataTypes.STRING(20), allowNull: true }
}, {
  tableName: 'pacientes',
  timestamps: false
});

export default Patient;