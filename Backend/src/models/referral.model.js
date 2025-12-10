import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Paciente from './patient.model.js';
import Medico from './medico.model.js';
import Unidad from './unidad.model.js';
import Director from './director.model.js';

const Referral = sequelize.define('Referral', {
  id_referencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_referencia'
  },
  folio: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: 'folio'
  },
  no_expediente: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'no_expediente'
  },
  tipo_solicitud: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'tipo_solicitud'
  },
  tipo_paciente: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'tipo_paciente'
  },
  prioridad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Media', // usa el valor por defecto que tu frontend envía
    field: 'prioridad'
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_solicitud'
  },

  /* Foreign keys stored as integers in the table */
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_paciente'
  },
  id_medico_remitente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_medico_remitente'
  },
  id_unidad_origen: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_unidad_origen'
  },
  id_unidad_destino: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_unidad_destino'
  },
  id_especialidad_solicitada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_especialidad_solicitada'
  },

  motivo_envio: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'motivo_envio'
  },
  resumen_clinico: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'resumen_clinico'
  },
  procedimiento: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'procedimiento'
  },

  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'peso'
  },
  talla: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'talla'
  },
  fc: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'fc'
  },
  fr: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'fr'
  },
  temp: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
    field: 'temp'
  },
  ta: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'ta'
  },
  spo2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'spo2'
  },
  dextrostix: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'dextrostix'
  },

  estado: {
    type: DataTypes.ENUM('Pendiente', 'Enviada', 'Aceptada', 'Rechazada', 'Contrarreferida'),
    allowNull: false,
    defaultValue: 'Pendiente',
    field: 'estado'
  },

  id_director_autoriza: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_director_autoriza'
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'referencias',
  timestamps: false
});

/* Associations — ajusta los alias según como uses los includes en controllers/index.js */
Referral.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });
Referral.belongsTo(Medico, { foreignKey: 'id_medico_remitente', as: 'medico_remitente' });
Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_origen', as: 'unidad_origen' });
Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_destino', as: 'unidad_destino' });
Referral.belongsTo(Director, { foreignKey: 'id_director_autoriza', as: 'director_autoriza' });

export default Referral;
