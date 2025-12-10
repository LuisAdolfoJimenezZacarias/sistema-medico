import CounterReferral from '../models/counter-referral.model.js';
import Referral from '../models/referral.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import Medico from '../models/medico.model.js'; // <-- agregar
import db from '../models/index.js';
const { sequelize } = db;

// Get all counter-referrals
export const getAllCounterReferrals = async (req, res) => {
  try {
    const counterReferrals = await CounterReferral.findAll({
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty', 'facility']
        },
        {
          model: User,
          as: 'referredDoctor',
          attributes: ['name', 'specialty', 'facility']
        }
      ]
    });
    
    res.status(200).json(counterReferrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counter-referral by ID
export const getCounterReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const counterReferral = await CounterReferral.findByPk(id, {
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name', 'age', 'gender', 'idNumber']
            }
          ]
        },
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty', 'facility']
        },
        {
          model: User,
          as: 'referredDoctor',
          attributes: ['name', 'specialty', 'facility']
        }
      ]
    });
    
    if (!counterReferral) {
      return res.status(404).json({ message: 'Counter-referral not found' });
    }
    
    res.status(200).json(counterReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new counter-referral
export const createCounterReferral = async (req, res) => {
  try {
    // aceptar tanto id_referencia como referralId desde el cliente
    const {
      id_referencia,
      referralId,
      fecha_ingreso,
      fecha_egreso,
      dias_estancia,
      diagnostico_egreso,
      diagnostico_complicaciones,
      resumen_clinico,
      id_servicio_tratante,
      servicio_recibio,
      institucion_recibio,
      unidad_medica_solicito,
      no_expediente,
      telefono,
      nombre_paciente,
      apellido_paterno,
      apellido_materno,
      curp,
      edad,
      sexo,
      medico_tratante,
      director_unidad,
      id_director_unidad
    } = req.body;

    const refId = Number(id_referencia ?? referralId ?? null);
    if (!refId) {
      return res.status(400).json({ message: 'Missing id_referencia' });
    }

    // buscar referencia por PK (asegúrate que el modelo Referral tiene PK correcto)
    const referral = await Referral.findByPk(refId);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // determinar id_medico_tratante a partir del usuario autenticado (si existe tabla Medico)
    let idMedicoTratante = null;
    try {
      const medico = await Medico.findOne({ where: { id_usuario: req.userId } });
      if (medico) idMedicoTratante = medico.id_medico ?? medico.id;
    } catch (e) { /* noop */ }

    // crear registro usando nombres de columnas que tienes en la BD
    const counter = await CounterReferral.create({
      id_referencia: refId,
      fecha_ingreso: fecha_ingreso ?? null,
      fecha_egreso: fecha_egreso ?? null,
      dias_estancia: dias_estancia != null ? Number(dias_estancia) : null,
      diagnostico_egreso: diagnostico_egreso ?? null,
      diagnostico_complicaciones: diagnostico_complicaciones ?? null,
      resumen_clinico: resumen_clinico ?? null,
      id_medico_tratante: idMedicoTratante,
      id_director_unidad: id_director_unidad ?? null,
      id_servicio_tratante: id_servicio_tratante ?? null,
      fecha_creacion: new Date()
    });

    // intentar actualizar estado de la referencia (si tu tabla Referral tiene esas columnas)
    try {
      await referral.update({ status: 'Completed', dateCompleted: new Date() });
    } catch (e) {
      // noop: si la referencia no tiene esos campos no interrumpe el flujo
      console.debug('Referral status update skipped or failed', e?.message ?? e);
    }

    return res.status(201).json({ message: 'Contrarreferencia creada', counter });
  } catch (error) {
    console.error('createCounterReferral error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update counter-referral status
export const updateCounterReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const counterReferral = await CounterReferral.findByPk(id);
    if (!counterReferral) {
      return res.status(404).json({ message: 'Counter-referral not found' });
    }
    
    // Update counter-referral
    const updateData = { status };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    await counterReferral.update(updateData);
    
    res.status(200).json({
      message: 'Counter-referral status updated successfully',
      counterReferral
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counter-referrals by doctor
export const getCounterReferralsByDoctor = async (req, res) => {
  try {
    const doctorId = req.userId;
    
    const counterReferrals = await CounterReferral.findAll({
      where: {
        [sequelize.Op.or]: [
          { referringDoctorId: doctorId },
          { referredDoctorId: doctorId }
        ]
      },
      include: [
        {
          model: Referral,
          as: 'referral',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['patientId', 'name']
            }
          ]
        }
      ]
    });
    
    res.status(200).json(counterReferrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
