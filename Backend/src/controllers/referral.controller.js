import db from '../models/index.js';
import { Op } from 'sequelize'; // <-- agregado
const { Referral, Medico, Paciente, Unidad, Especialidad, Director, sequelize } = db;

/**
 * Devuelve todas las referencias (con datos mínimos de paciente / médico / unidades)
 */
export const getAllReferrals = async (req, res) => {
  try {
    const { id_unidad_origen, unidad_origen, estado } = req.query; // <-- agregado estado

    const where = {};
    if (id_unidad_origen) {
      where.id_unidad_origen = id_unidad_origen;
    } else if (unidad_origen) {
      const unidad = await Unidad.findOne({
        where: {
          [Op.or]: [
            { nombre: unidad_origen },
            { clues: unidad_origen }
          ]
        }
      });

      if (!unidad) return res.json([]);
      where.id_unidad_origen = unidad.id_unidad;
    }

    // aplicar filtro por estado si se pasa
    if (typeof estado !== 'undefined' && String(estado).trim() !== '') {
      where.estado = String(estado).trim();
    }

    const referrals = await Referral.findAll({
      where,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno', 'domicilio', 'telefono', 'fecha_nacimiento', 'familiar_responsable', 'genero', 'curp', 'edad'] },
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Especialidad, as: 'especialidad_ref', attributes: ['id_especialidad', 'nombre'], required: false },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre', 'clues'], required: false },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre', 'clues'], required: false }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });

    const plain = referrals.map(r => (r && typeof r.get === 'function') ? r.get({ plain: true }) : r);
    res.set('Cache-Control', 'no-store');
    return res.status(200).json(plain);
  } catch (err) {
    console.error('getAllReferrals error:', err);
    return res.status(500).json({ message: err.message || 'Error al obtener referencias' });
  }
};

/**
 * Obtener una referencia por id_referencia
 */
export const getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await Referral.findByPk(id, {
      include: [
        // incluir aquí domicilio, fecha_nacimiento y familiar_responsable para que el frontend los muestre
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'telefono', 'domicilio', 'fecha_nacimiento', 'familiar_responsable', 'genero'] },
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre'] },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre'] },

        // incluir la especialidad solicitada para que el frontend muestre "Servicio que solicita"
        { model: Especialidad, as: 'especialidad_ref', attributes: ['id_especialidad', 'nombre'] },

        { model: Director, as: 'director_autoriza', attributes: ['id_director', 'nombre', 'apellido_paterno', 'apellido_materno'] }
      ]
    });
    if (!referral) {
      return res.status(404).json({ message: 'Referencia no encontrada' });
    }

    // enviar objeto plano para evitar problemas de serialización
    const plain = referral && typeof referral.get === 'function' ? referral.get({ plain: true }) : referral;
    return res.status(200).json(plain);
  } catch (err) {
    console.error('getReferralById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Si necesitas una versión JS local, añade esta en su lugar:
function resolveAdminUnit(user) {
  const raw = (user && (user.id_unidad ?? user.unidadId ?? user.unidad ?? user.facility ?? user.facilityName ?? user.unidad_origen)) ?? null;
  const unidadId = raw != null && !Number.isNaN(Number(raw)) ? String(Number(raw)) : null;
  const unidadName = !unidadId && raw ? String(raw) : null;
  return { unidadId, unidadName };
}

export const createReferral = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // req.userId debe venir de auth.middleware.verifyToken
    const userId = Number(req.userId || (req.user && req.user.id));
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ message: 'Unauthorized: missing user' });
    }

    // buscar medico asociado al usuario autenticado
    const medico = await Medico.findOne({ where: { id_usuario: userId } });
    if (!medico) {
      await t.rollback();
      return res.status(400).json({ message: 'El usuario autenticado no está asociado a un médico' });
    }
    const id_medico_remitente = medico.id_medico ?? medico.id;

    // recibir payload (acepta nombres alternativos)
    const body = req.body || {};
    // Priorizar diagnóstico como procedimiento si el frontend lo envía así
    if ((body.procedimiento === undefined || body.procedimiento === null || body.procedimiento === '') && body.diagnostico_envio) {
      body.procedimiento = body.diagnostico_envio;
    }
    // Robust: aceptar 'servicio' como alias de 'procedimiento' (compatibilidad previa)
    if ((body.procedimiento === undefined || body.procedimiento === null || body.procedimiento === '') && body.servicio) {
      body.procedimiento = body.servicio;
    }
    console.log('createReferral: incoming body=', body);
    const id_paciente = Number(body.id_paciente || body.idPaciente || 0) || null;
    let id_unidad_origen = Number(body.id_unidad_origen || body.id_unidad_origen || body.id_unidad_origen) || null;
    const id_unidad_destino = Number(body.id_unidad_destino || body.id_unidad_destino) || null;
    const id_especialidad_solicitada = Number(body.id_especialidad_solicitada || body.id_especialidad || body.idEspecialidad) || null;

    // si no viene unidad origen, usar la del medico (si existe)
    if (!id_unidad_origen && medico.id_unidad) id_unidad_origen = medico.id_unidad;

    // validaciones mínimas requeridas por el modelo
    const missing = [];
    if (!id_paciente) missing.push('id_paciente');
    if (!id_unidad_origen) missing.push('id_unidad_origen');
    if (!id_unidad_destino) missing.push('id_unidad_destino');
    if (!id_especialidad_solicitada) missing.push('id_especialidad_solicitada');
    if (missing.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Faltan campos requeridos', missing });
    }

    // construir objeto a guardar (mapea sólo los campos que model permite)
    const createObj = {
      folio: body.folio ?? null,
      no_expediente: body.no_expediente ?? body.no_expediente ?? null,
      tipo_solicitud: body.tipo_solicitud ?? body.tipo_solicitud ?? null,
      tipo_paciente: body.tipo_paciente ?? null,
      prioridad: body.prioridad ?? 'Media',
      fecha_solicitud: body.fecha_solicitud ? new Date(body.fecha_solicitud) : new Date(),
      id_paciente,
      id_medico_remitente,
      id_unidad_origen,
      id_unidad_destino,
      id_especialidad_solicitada,
      motivo_envio: body.motivo_envio ?? null,
      resumen_clinico: body.resumen_clinico ?? null,
      procedimiento: (typeof body.procedimiento === 'string' && body.procedimiento.trim() === '') ? null : (body.procedimiento ?? null),
      peso: body.peso ?? null,
      talla: body.talla ?? null,
      fc: body.fc ?? null,
      fr: body.fr ?? null,
      temp: body.temp ?? null,
      ta: body.ta ?? null,
      spo2: body.spo2 ?? null,
      dextrostix: body.dextrostix ?? null,
      id_director_autoriza: body.id_director_autoriza ?? null
    };
    console.log('createReferral: createObj before save=', createObj);

    const newRef = await Referral.create(createObj, { transaction: t });

    await t.commit();
    return res.status(201).json({ message: 'Referencia creada', referral: newRef.get ? newRef.get({ plain: true }) : newRef });
  } catch (err) {
    await t.rollback();
    console.error('createReferral error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error', error: err?.message ?? err });
  }
};

/**
 * Actualizar estado de la referencia (estado)
 * body: { estado: 'Aceptada'|'Rechazada'|'Contrarreferida'|'Pendiente', notas?, id_director_autoriza? }
 */
export const updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, id_director_autoriza } = req.body;
    const referral = await Referral.findByPk(id);
    if (!referral) return res.status(404).json({ message: 'Referencia no encontrada' });

    referral.estado = estado ?? referral.estado;
    if (typeof id_director_autoriza !== 'undefined') referral.id_director_autoriza = id_director_autoriza;
    await referral.save();

    return res.status(200).json({ message: 'Estado actualizado', referral });
  } catch (err) {
    console.error('updateReferralStatus error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Obtener referencias relacionadas al médico autenticado (busca su id_medico y filtra)
 */
export const getReferralsByDoctor = async (req, res) => {
  try {
    const userId = Number(req.userId || (req.user && req.user.id));
    if (!userId) return res.status(401).json({ message: 'Unauthorized: missing user id' });

    // buscar medico asociado al usuario autenticado
    const medico = await Medico.findOne({ where: { id_usuario: userId } });
    if (!medico) {
      console.warn('getReferralsByDoctor: no medico found for userId', userId);
      // prevenir cache para respuestas vacías también
      res.set('Cache-Control', 'no-store');
      return res.status(200).json([]);
    }

    const senderId = medico.id_medico;
    console.log('getReferralsByDoctor - userId -> medico.id_medico:', userId, '->', senderId);

    const referrals = await Referral.findAll({
      where: { id_medico_remitente: senderId },
      include: [
        // incluir domicilio y demás campos del paciente para que el frontend los tenga al editar
        { 
          model: Paciente, 
          as: 'paciente_ref', 
          attributes: [
            'id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno',
            'domicilio', 'fecha_nacimiento', 'edad', 'curp', 'genero', 'telefono', 'familiar_responsable'
          ] 
        },
         { model: Especialidad, as: 'especialidad_ref', attributes: ['id_especialidad','nombre'] },
         { model: Unidad, as: 'unidad_origen_ref', attributes: ['id_unidad','nombre'] },
         { model: Unidad, as: 'unidad_destino_ref', attributes: ['id_unidad','nombre'] }
       ],
      order: [['fecha_solicitud', 'DESC']]
    });

    // Evitar que el cliente reciba 304 por ETag/condicionales
    res.set('Cache-Control', 'no-store');

    const plain = referrals.map(r => (r && typeof r.get === 'function') ? r.get({ plain: true }) : r);
    return res.status(200).json(plain);
  } catch (err) {
    console.error('getReferralsByDoctor error:', err && err.message ? err.message : err, err && err.sql ? '\nSQL: '+err.sql : '');
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Obtener referencias por paciente (id_paciente en params)
 */
export const getReferralsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const referrals = await Referral.findAll({
      where: { id_paciente: patientId },
      include: [
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre'] }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });
    return res.status(200).json(referrals);
  } catch (err) {
    console.error('getReferralsByPatient error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mapear referencia a formato utilizado en el frontend (ej. ReferenciasEmitidas.tsx)
 * - Agrega campos calculados o transforma datos según sea necesario
 */
export const mapReferral = (r) => {
  // 1. Construir nombre del paciente
  // El backend ahora envía un objeto 'paciente' gracias al include
  const p = r.paciente; 
  const patientName = p 
    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.trim()
    : (r.nombre_paciente || 'Paciente Desconocido');

  // 2. Obtener nombre de especialidad
  // El backend envía un objeto 'especialidad'
  const specialty = r.especialidad?.nombre || r.specialty || 'Sin especialidad';

  return {
    id: r.folio ?? String(r.id_referencia),
    patientId: String(r.id_paciente),
    patientName: patientName, 
    specialty: specialty,
    reason: r.motivo_envio ?? '',
    priority: r.prioridad ?? 'Media',
    status: r.estado ?? 'Pendiente',
    referringDoctor: '', // Puedes omitirlo si es "Mis Referencias"
    referringFacility: '', 
    referredDoctor: '',
    referredFacility: r.unidad_destino?.nombre ?? '', // Ahora también mostramos el nombre de la unidad destino
    dateCreated: r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString() : '',
    dateCompleted: '',
    notes: r.resumen_clinico ?? ''
  };
};

// REMOVIDO: asociaciones definidas en models/index.js para evitar duplicados

export const updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const referral = await Referral.findByPk(id);
    if (!referral) return res.status(404).json({ message: 'Referencia no encontrada' });

    // aceptar alias comunes y actualizar solo los campos permitidos
    const get = (a, b) => (typeof a !== 'undefined' ? a : (typeof b !== 'undefined' ? b : undefined));

    referral.folio = get(body.folio, body.no_folio) ?? referral.folio;
    referral.no_expediente = get(body.no_expediente, body.expediente) ?? referral.no_expediente;
    referral.tipo_solicitud = get(body.tipo_solicitud, body.tipoSolicitud) ?? referral.tipo_solicitud;
    referral.tipo_paciente = get(body.tipo_paciente, body.tipoPaciente) ?? referral.tipo_paciente;
    referral.prioridad = get(body.prioridad, body.prioridad) ?? referral.prioridad;

    if (typeof get(body.fecha_solicitud, body.fechaSolicitud) !== 'undefined') {
      referral.fecha_solicitud = body.fecha_solicitud ? new Date(body.fecha_solicitud) : referral.fecha_solicitud;
    }

    referral.id_paciente = Number(get(body.id_paciente, body.idPaciente) ?? referral.id_paciente);
    referral.id_medico_remitente = Number(get(body.id_medico_remitente, body.idMedicoRemitente) ?? referral.id_medico_remitente);
    referral.id_unidad_origen = Number(get(body.id_unidad_origen, body.idUnidadOrigen) ?? referral.id_unidad_origen);
    referral.id_unidad_destino = Number(get(body.id_unidad_destino, body.idUnidadDestino) ?? referral.id_unidad_destino);
    referral.id_especialidad_solicitada = Number(get(body.id_especialidad_solicitada, body.idEspecialidad) ?? referral.id_especialidad_solicitada);

    referral.motivo_envio = get(body.motivo_envio, body.motivo) ?? referral.motivo_envio;
    // procedimiento puede llegar bajo varios nombres
    referral.procedimiento = get(body.procedimiento, get(body.diagnostico_envio, body.servicio)) ?? referral.procedimiento;
    referral.resumen_clinico = get(body.resumen_clinico, body.resumen) ?? referral.resumen_clinico;

    // signos vitales
    referral.peso = typeof body.peso !== 'undefined' ? body.peso : referral.peso;
    referral.talla = typeof body.talla !== 'undefined' ? body.talla : referral.talla;
    referral.fc = typeof body.fc !== 'undefined' ? body.fc : referral.fc;
    referral.fr = typeof body.fr !== 'undefined' ? body.fr : referral.fr;
    referral.temp = typeof body.temp !== 'undefined' ? body.temp : referral.temp;
    referral.ta = typeof body.ta !== 'undefined' ? body.ta : referral.ta;
    referral.spo2 = typeof body.spo2 !== 'undefined' ? body.spo2 : referral.spo2;
    referral.dextrostix = typeof body.dextrostix !== 'undefined' ? body.dextrostix : referral.dextrostix;

    // director autorizante
    if (typeof body.id_director_autoriza !== 'undefined') {
      referral.id_director_autoriza = body.id_director_autoriza ?? null;
    }

    await referral.save();
    const plain = referral && typeof referral.get === 'function' ? referral.get({ plain: true }) : referral;
    return res.status(200).json({ message: 'Referencia actualizada', referral: plain });
  } catch (err) {
    console.error('updateReferral error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Enviar referencia a director para autorización
 */
export const sendReferralToDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user ?? null; // si usas verifyToken

    const referral = await Referral.findByPk(id);
    if (!referral) return res.status(404).json({ message: 'Referencia no encontrada' });

    const unidadId = referral.id_unidad_origen;
    if (!unidadId) return res.status(400).json({ message: 'Referencia sin unidad de origen' });

    // buscar director de la unidad
    const director = await Director.findOne({ where: { id_unidad: unidadId } });
    if (!director) return res.status(404).json({ message: 'No se encontró director para la unidad' });

    // persistir estado y asignar director responsable
    referral.id_director_autoriza = director.id_director ?? referral.id_director_autoriza;
    referral.estado = 'Enviada';
    // opcional metadata
    // referral.fecha_procesada = new Date();
    // referral.procesado_por = authUser?.id ?? null;

    await referral.save();

    const plain = (referral && typeof referral.get === 'function') ? referral.get({ plain: true }) : referral;
    return res.status(200).json({ message: 'Referencia enviada al director', referral: plain });
  } catch (err) {
    console.error('sendReferralToDirector error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Obtener referencias para el director autenticado
 */
export const getReferralsForDirector = async (req, res) => {
  try {
    const authUser = req.user ?? null;
    if (!authUser) return res.status(401).json({ message: 'Unauthorized' });

    // buscamos referencias con estado "Enviada" asignadas al director o a la unidad del usuario
    const where = { estado: 'Enviada' };

    // priorizar id_director_autoriza si viene en token, sino id_unidad del usuario
    if (authUser.id_director) {
      where.id_director_autoriza = authUser.id_director;
    } else if (authUser.id_unidad) {
      where.id_unidad_origen = authUser.id_unidad;
    } else {
      // fallback: intentar buscar Director por usuario
      const director = await Director.findOne({ where: { id_usuario: authUser.id } });
      if (director) where.id_director_autoriza = director.id_director;
      else return res.status(400).json({ message: 'No se pudo determinar unidad/director' });
    }

    const referrals = await Referral.findAll({
      where,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Especialidad, as: 'especialidad_ref', attributes: ['id_especialidad', 'nombre'], required: false },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre', 'clues'], required: false },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre', 'clues'], required: false }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });

    const plain = referrals.map(r => (r && typeof r.get === 'function') ? r.get({ plain: true }) : r);
    return res.status(200).json(plain);
  } catch (err) {
    console.error('getReferralsForDirector error:', err);
    return res.status(500).json({ message: err.message || 'Error al obtener referencias para director' });
  }
};
