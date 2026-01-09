import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Referral from './referral.model.js';
import Medico from './medico.model.js';
import User from './user.model.js';

const CounterReferral = sequelize.define('CounterReferral', {
  id_contrarreferencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_contrarreferencia'
  },
  id_referencia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_referencia'
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_ingreso'
  },
  fecha_egreso: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_egreso'
  },
  dias_estancia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'dias_estancia'
  },
  diagnostico_egreso: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'diagnostico_egreso'
  },
  diagnostico_complicaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'diagnostico_complicaciones'
  },
  resumen_clinico: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'resumen_clinico'
  },
  id_medico_tratante: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_medico_tratante'
  },
  id_director_unidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_director_unidad'
  },
  id_servicio_tratante: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_servicio_tratante'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'contrarreferencias', // ajuste si tu tabla se llama 'contrarreferencias' cámbialo
  timestamps: false
});

// Asociaciones mínimas para includes en controller
CounterReferral.belongsTo(Referral, { foreignKey: 'id_referencia', as: 'referral' });
// si quieres ligar medico/director a Medico/User puedes añadir associations adicionales
CounterReferral.belongsTo(Medico, { foreignKey: 'id_medico_tratante', as: 'medico_tratante' });
CounterReferral.belongsTo(User, { foreignKey: 'id_director_unidad', as: 'director_unidad' });

export default CounterReferral;
