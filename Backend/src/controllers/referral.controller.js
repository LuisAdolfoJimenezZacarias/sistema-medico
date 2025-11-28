import db from '../models/index.js';
const { Referral, Paciente, Unidad, Especialidad, Medico } = db;

/**
 * Devuelve todas las referencias (con datos mínimos de paciente / médico / unidades)
 */
export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.findAll({
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp'] },
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre'] },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre'] },
        { model: Director, as: 'director_autoriza', attributes: ['id_director', 'nombre', 'apellido_paterno', 'apellido_materno'] }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });
    return res.status(200).json(referrals);
  } catch (err) {
    console.error('getAllReferrals error', err);
    return res.status(500).json({ message: 'Server error' });
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
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'telefono'] },
        { model: Medico, as: 'medico_remitente', attributes: ['id_medico', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre'] },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre'] },
        { model: Director, as: 'director_autoriza', attributes: ['id_director', 'nombre', 'apellido_paterno', 'apellido_materno'] }
      ]
    });
    if (!referral) return res.status(404).json({ message: 'Referencia no encontrada' });
    return res.status(200).json(referral);
  } catch (err) {
    console.error('getReferralById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createReferral = async (req, res) => {
  try {
    console.log('createReferral payload (req.body):', req.body);

    const {
      id_paciente,
      id_especialidad_solicitada,
      id_unidad_origen,
      id_unidad_destino,
      id_medico_remitente,
      no_folio,
      no_expediente,
      tipo_solicitud,
      tipo_paciente,
      prioridad,
      motivo_envio,
      procedimiento,
      servicio,
      resumen_clinico,
      peso,
      talla,
      fc,
      fr,
      temp,
      ta,
      spo2,
      dextrostix,
      id_director_autoriza
    } = req.body;

    const createPayload = {
      id_paciente: id_paciente ?? null,
      id_especialidad_solicitada: id_especialidad_solicitada ?? null,
      id_unidad_origen: id_unidad_origen ?? null,
      id_unidad_destino: id_unidad_destino ?? null,
      id_medico_remitente: id_medico_remitente ?? null,
      folio: no_folio ?? req.body.folio ?? null,
      no_expediente: no_expediente ?? null,
      tipo_solicitud: tipo_solicitud ?? null,
      tipo_paciente: tipo_paciente ?? null,
      prioridad: prioridad ?? null,
      motivo_envio: motivo_envio ?? null,
      procedimiento: procedimiento ?? null,
      servicio: servicio ?? null,
      resumen_clinico: resumen_clinico ?? null,
      peso: peso ?? null,
      talla: talla ?? null,
      fc: fc ?? null,
      fr: fr ?? null,
      temp: temp ?? null,
      ta: ta ?? null,
      spo2: spo2 ?? null,
      dextrostix: dextrostix ?? null,
      id_director_autoriza: id_director_autoriza ?? null
    };

    // Si no se envió id_medico_remitente, intentar rellenarlo desde el usuario autenticado
    if (!createPayload.id_medico_remitente && req.userId) {
      const medico = await Medico.findOne({ where: { id_usuario: req.userId } });
      if (medico) {
        createPayload.id_medico_remitente = medico.id_medico;
        console.log('createReferral: asignado id_medico_remitente desde req.userId ->', medico.id_medico);
      } else {
        console.warn('createReferral: no se encontró Medico para req.userId', req.userId);
      }
    }

    console.log('createReferral payload (createPayload):', createPayload);

    // validaciones mínimas
    if (!createPayload.id_unidad_origen || !createPayload.id_unidad_destino) {
      console.warn('createReferral missing unidades', {
        id_unidad_origen: createPayload.id_unidad_origen,
        id_unidad_destino: createPayload.id_unidad_destino
      });
      return res.status(400).json({ message: 'id_unidad_origen e id_unidad_destino son requeridos' });
    }
    // opcional: si tu modelo sigue requiriendo id_medico_remitente, validar aquí
    if (!createPayload.id_medico_remitente) {
      return res.status(400).json({ message: 'id_medico_remitente requerido (no se encontró médico autenticado)' });
    }
    
    const newReferral = await Referral.create(createPayload);

    // mostrar lo que Sequelize guardó
    const plain = newReferral.get ? newReferral.get({ plain: true }) : newReferral;
    console.log('createReferral saved:', plain);

    return res.status(201).json(plain);
  } catch (err) {
    console.error('createReferral error:', err.stack || err);
    return res.status(500).json({ message: err.message ?? 'Server error' });
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
    // req.userId debe ser el id_usuario (User). Buscar su registro en Medico para obtener id_medico
    const medico = await Medico.findOne({ where: { id_usuario: req.userId } });
    if (!medico) return res.status(200).json([]); // no es médico -> no hay referencias

    // <-- arreglo: usar una condición válida en where (aquí solo por id_medico_remitente)
    const referrals = await Referral.findAll({
      where: {
        id_medico_remitente: medico.id_medico
      },
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre', 'apellido_paterno', 'apellido_materno'] },
        { model: Unidad, as: 'unidad_origen', attributes: ['id_unidad', 'nombre'] },
        { model: Unidad, as: 'unidad_destino', attributes: ['id_unidad', 'nombre'] }
      ],
      order: [['fecha_solicitud', 'DESC']]
    });

    return res.status(200).json(referrals);
  } catch (err) {
    console.error('getReferralsByDoctor error', err);
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
