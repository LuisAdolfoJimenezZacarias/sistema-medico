import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Paciente from './patient.model.js';
import Medico from './medico.model.js';
import Unidad from './unidad.model.js';
import Role from './role.model.js';
import Referral from './referral.model.js';
import CounterReferral from './counter-referral.model.js';
import Appointment from './appointment.model.js';
import Administrativo from './administrativo.model.js';
import Director from './director.model.js'; // crea si no existe

// asociaciones
if (User && Role) {
  User.belongsTo(Role, { foreignKey: 'id_rol' });
  Role.hasMany(User, { foreignKey: 'id_rol' });
}

if (Paciente && User) {
  Paciente.belongsTo(User, { foreignKey: 'id_usuario' });
  User.hasOne(Paciente, { foreignKey: 'id_usuario' });
}

if (Medico && User) {
  Medico.belongsTo(User, { foreignKey: 'id_usuario' });
  User.hasOne(Medico, { foreignKey: 'id_usuario' });
}

if (Medico && Unidad) {
  Medico.belongsTo(Unidad, { foreignKey: 'id_unidad', as: 'unidad' });
  Unidad.hasMany(Medico, { foreignKey: 'id_unidad', as: 'medicos' });
}

if (Administrativo && User) {
  Administrativo.belongsTo(User, { foreignKey: 'id_usuario' });
  User.hasOne(Administrativo, { foreignKey: 'id_usuario' });

  Administrativo.belongsTo(Unidad, { foreignKey: 'id_unidad', as: 'unidad' });
  Unidad.hasMany(Administrativo, { foreignKey: 'id_unidad', as: 'administrativos' });
}

if (Director && User) {
  Director.belongsTo(User, { foreignKey: 'id_usuario' });
  User.hasOne(Director, { foreignKey: 'id_usuario' });
  Director.belongsTo(Unidad, { foreignKey: 'id_unidad', as: 'unidad' });
  Unidad.hasMany(Director, { foreignKey: 'id_unidad', as: 'directores' });
}

const db = { sequelize, User, Paciente, Medico, Unidad, Role, Referral, CounterReferral, Appointment, Administrativo, Director };
export default db;
