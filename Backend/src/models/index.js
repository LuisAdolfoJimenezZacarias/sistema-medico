import { sequelize } from '../config/database.js';
import { Model } from 'sequelize';
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
import Especialidad from './especialidad.model.js';

// Inicializar modelos soportando dos estilos:
// - export default (sequelize) => Model  (factory)
// - export default class Xxx extends Model  (clase ya inicializada)
const initModel = (M) => {
  if (!M) return null;
  // Si es una clase que extiende Sequelize.Model -> devolverla tal cual
  if (M.prototype instanceof Model) return M;
  // Si es una factory (función que recibe sequelize) -> invocarla
  if (typeof M === 'function') return M(sequelize);
  return M;
};

const UserModel = initModel(User);
const PacienteModel = initModel(Paciente);
const MedicoModel = initModel(Medico);
const UnidadModel = initModel(Unidad);
const RoleModel = initModel(Role);
const ReferralModel = initModel(Referral);
const CounterReferralModel = initModel(CounterReferral);
const AppointmentModel = initModel(Appointment);
const AdministrativoModel = initModel(Administrativo);
const DirectorModel = initModel(Director);
const EspecialidadModel = initModel(Especialidad);
/*
// asociaciones (usar las instancias inicializadas)
if (UserModel && RoleModel) {
  UserModel.belongsTo(RoleModel, { foreignKey: 'id_rol' });
  RoleModel.hasMany(UserModel, { foreignKey: 'id_rol' });
}

if (PacienteModel && UserModel) {
  PacienteModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(PacienteModel, { foreignKey: 'id_usuario' });
}

if (MedicoModel && UserModel) {
  MedicoModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(MedicoModel, { foreignKey: 'id_usuario' });
}

if (MedicoModel && UnidadModel) {
  MedicoModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(MedicoModel, { foreignKey: 'id_unidad', as: 'medicos' });
}

if (AdministrativoModel && UserModel) {
  AdministrativoModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(AdministrativoModel, { foreignKey: 'id_usuario' });

  AdministrativoModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(AdministrativoModel, { foreignKey: 'id_unidad', as: 'administrativos' });
}

if (DirectorModel && UserModel) {
  DirectorModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(DirectorModel, { foreignKey: 'id_usuario' });
  DirectorModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(DirectorModel, { foreignKey: 'id_unidad', as: 'directores' });
}

// asociaciones para Referral (usar alias únicos)
if (ReferralModel && PacienteModel) {
  ReferralModel.belongsTo(PacienteModel, { foreignKey: 'id_paciente', as: 'paciente_ref' });
  PacienteModel.hasMany(ReferralModel, { foreignKey: 'id_paciente', as: 'referencias' });
}

if (ReferralModel && MedicoModel) {
  ReferralModel.belongsTo(MedicoModel, { foreignKey: 'id_medico_remitente', as: 'medico_remitente_ref' });
  ReferralModel.belongsTo(MedicoModel, { foreignKey: 'id_medico_destino', as: 'medico_destino_ref' });
  MedicoModel.hasMany(ReferralModel, { foreignKey: 'id_medico_remitente', as: 'referencias_emitidas' });
  MedicoModel.hasMany(ReferralModel, { foreignKey: 'id_medico_destino', as: 'referencias_recibidas' });
}

if (ReferralModel && UnidadModel) {
  ReferralModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad_origen', as: 'unidad_origen_ref' });
  ReferralModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad_destino', as: 'unidad_destino_ref' });
  UnidadModel.hasMany(ReferralModel, { foreignKey: 'id_unidad_origen', as: 'referencias_origen' });
  UnidadModel.hasMany(ReferralModel, { foreignKey: 'id_unidad_destino', as: 'referencias_destino' });
}

if (ReferralModel && EspecialidadModel) {
  ReferralModel.belongsTo(EspecialidadModel, { foreignKey: 'id_especialidad_solicitada', as: 'especialidad_ref' });
  EspecialidadModel.hasMany(ReferralModel, { foreignKey: 'id_especialidad_solicitada', as: 'referencias_por_especialidad' });
}

// después de inicializar todos los modelos, añade asociaciones seguras:

// Evitar error si ya existen
if (db.Referral) {
  const Referral = db.Referral;
  const Paciente = db.Paciente;
  const Especialidad = db.Especialidad;
  const Unidad = db.Unidad;
  const Medico = db.Medico;
  // Paciente
  if (Paciente && !Referral.associations?.paciente_ref) {
    Referral.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente_ref' });
  }
  // Especialidad solicitada
  if (Especialidad && !Referral.associations?.especialidad_ref) {
    Referral.belongsTo(Especialidad, { foreignKey: 'id_especialidad_solicitada', as: 'especialidad_ref' });
  }
  // Unidades origen/destino
  if (Unidad && !Referral.associations?.unidad_origen_ref) {
    Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_origen', as: 'unidad_origen_ref' });
  }
  if (Unidad && !Referral.associations?.unidad_destino_ref) {
    Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_destino', as: 'unidad_destino_ref' });
  }
  // Médico remitente
  if (Medico && !Referral.associations?.medico_remitente_ref) {
    Referral.belongsTo(Medico, { foreignKey: 'id_medico_remitente', as: 'medico_remitente_ref' });
  }
}

// después de inicializar modelos (db.ModelName = ...), añade:

const { Referral, Paciente, Especialidad, Unidad, Medico } = db;

if (Referral) {
  if (Paciente && !Referral.associations?.paciente_ref) {
    Referral.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente_ref' });
  }
  if (Especialidad && !Referral.associations?.especialidad_ref) {
    Referral.belongsTo(Especialidad, { foreignKey: 'id_especialidad_solicitada', as: 'especialidad_ref' });
  }
  if (Unidad && !Referral.associations?.unidad_origen_ref) {
    Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_origen', as: 'unidad_origen_ref' });
  }
  if (Unidad && !Referral.associations?.unidad_destino_ref) {
    Referral.belongsTo(Unidad, { foreignKey: 'id_unidad_destino', as: 'unidad_destino_ref' });
  }
  if (Medico && !Referral.associations?.medico_remitente_ref) {
    Referral.belongsTo(Medico, { foreignKey: 'id_medico_remitente', as: 'medico_remitente_ref' });
  }
}

// exportar las instancias en db
const db = {
  sequelize,
  User: UserModel,
  Paciente: PacienteModel,
  Medico: MedicoModel,
  Unidad: UnidadModel,
  Role: RoleModel,
  Referral: ReferralModel,
  CounterReferral: CounterReferralModel,
  Appointment: AppointmentModel,
  Administrativo: AdministrativoModel,
  Director: DirectorModel,
  Especialidad: EspecialidadModel
};
export default db;
*/
// asociaciones (usar las instancias inicializadas)
if (UserModel && RoleModel) {
  UserModel.belongsTo(RoleModel, { foreignKey: 'id_rol' });
  RoleModel.hasMany(UserModel, { foreignKey: 'id_rol' });
}

if (PacienteModel && UserModel) {
  PacienteModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(PacienteModel, { foreignKey: 'id_usuario' });
}

if (MedicoModel && UserModel) {
  MedicoModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(MedicoModel, { foreignKey: 'id_usuario' });
}

if (MedicoModel && UnidadModel) {
  MedicoModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(MedicoModel, { foreignKey: 'id_unidad', as: 'medicos' });
}

if (AdministrativoModel && UserModel) {
  AdministrativoModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(AdministrativoModel, { foreignKey: 'id_usuario' });

  AdministrativoModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(AdministrativoModel, { foreignKey: 'id_unidad', as: 'administrativos' });
}

if (DirectorModel && UserModel) {
  DirectorModel.belongsTo(UserModel, { foreignKey: 'id_usuario' });
  UserModel.hasOne(DirectorModel, { foreignKey: 'id_usuario' });
  DirectorModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad', as: 'unidad' });
  UnidadModel.hasMany(DirectorModel, { foreignKey: 'id_unidad', as: 'directores' });
}

// asociaciones para Referral (único bloque, alias únicos)
if (ReferralModel && PacienteModel) {
  ReferralModel.belongsTo(PacienteModel, { foreignKey: 'id_paciente', as: 'paciente_ref' });
  PacienteModel.hasMany(ReferralModel, { foreignKey: 'id_paciente', as: 'referencias' });
}

if (ReferralModel && MedicoModel) {
  ReferralModel.belongsTo(MedicoModel, { foreignKey: 'id_medico_remitente', as: 'medico_remitente_ref' });
  // comentario: no registrar medico_destino si la columna no existe en la tabla DB
  // ReferralModel.belongsTo(MedicoModel, { foreignKey: 'id_medico_destino', as: 'medico_destino_ref' });
  MedicoModel.hasMany(ReferralModel, { foreignKey: 'id_medico_remitente', as: 'referencias_emitidas' });
  // MedicoModel.hasMany(ReferralModel, { foreignKey: 'id_medico_destino', as: 'referencias_recibidas' });
}

if (ReferralModel && UnidadModel) {
  ReferralModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad_origen', as: 'unidad_origen_ref' });
  ReferralModel.belongsTo(UnidadModel, { foreignKey: 'id_unidad_destino', as: 'unidad_destino_ref' });
  UnidadModel.hasMany(ReferralModel, { foreignKey: 'id_unidad_origen', as: 'referencias_origen' });
  UnidadModel.hasMany(ReferralModel, { foreignKey: 'id_unidad_destino', as: 'referencias_destino' });
}

if (ReferralModel && EspecialidadModel) {
  ReferralModel.belongsTo(EspecialidadModel, { foreignKey: 'id_especialidad_solicitada', as: 'especialidad_ref' });
  EspecialidadModel.hasMany(ReferralModel, { foreignKey: 'id_especialidad_solicitada', as: 'referencias_por_especialidad' });
}

// exportar las instancias en db
const db = {
  sequelize,
  User: UserModel,
  Paciente: PacienteModel,
  Medico: MedicoModel,
  Unidad: UnidadModel,
  Role: RoleModel,
  Referral: ReferralModel,
  CounterReferral: CounterReferralModel,
  Appointment: AppointmentModel,
  Administrativo: AdministrativoModel,
  Director: DirectorModel,
  Especialidad: EspecialidadModel
};
export default db;

export const getReferralsByDoctor = async (req, res) => {
  try {
    const userId = Number(req.userId || (req.user && req.user.id));
    if (!userId) return res.status(401).json({ message: 'Unauthorized: missing user id' });

    // Buscar médico asociado al usuario autenticado
    const medico = await Medico.findOne({ where: { id_usuario: userId } });
    if (!medico) {
      console.warn('getReferralsByDoctor: no medico found for userId', userId);
      return res.status(200).json([]);
    }

    const senderId = medico.id_medico ?? medico.id;
    console.log('getReferralsByDoctor - userId -> medico.id_medico:', userId, '->', senderId);

    // Devolver solo referencias donde el médico remitente sea el doctor autenticado
    const referrals = await Referral.findAll({
      where: { id_medico_remitente: senderId },
      include: [
        { model: Paciente, as: 'paciente_ref', attributes: ['id_paciente','nombre','apellido_paterno','apellido_materno'] },
        { model: Especialidad, as: 'especialidad_ref', attributes: ['id_especialidad','nombre'] },
        { model: Unidad, as: 'unidad_origen_ref', attributes: ['id_unidad','nombre'] },
        { model: Unidad, as: 'unidad_destino_ref', attributes: ['id_unidad','nombre'] },
        { model: Medico, as: 'medico_remitente_ref', attributes: ['id_medico','nombre','apellido_paterno','apellido_materno'] }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });

    const plain = referrals.map(r => (r && typeof r.get === 'function') ? r.get({ plain: true }) : r);
    return res.status(200).json(plain);
  } catch (err) {
    console.error('getReferralsByDoctor error:', err && err.message ? err.message : err, err && err.sql ? '\nSQL: '+err.sql : '');
    return res.status(500).json({ message: 'Server error' });
  }
};
