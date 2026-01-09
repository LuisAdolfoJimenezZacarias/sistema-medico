import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import { sequelize } from '../config/database.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          as: 'usuario', // <- usar alias correcto definido en las asociaciones
          attributes: ['id_usuario', 'email']
        }
      ]
    });
    
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario', // <- alias corregido
          attributes: ['id_usuario', 'email']
        }
      ]
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient by CURP
export const getPatientByCurp = async (req, res) => {
  try {
    const { curp } = req.params;
    if (!curp) return res.status(400).json({ message: 'curp required' });

    const paciente = await Patient.findOne({
      where: { curp },
      attributes: [
        'id_paciente',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'curp',
        'domicilio',
        'telefono',
        'fecha_nacimiento',
        'familiar_responsable',
        'discapacidad',
        'genero' // <- asegurar que se devuelva
      ]
    });

    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });

    // calcular edad (años) si hay fecha_nacimiento
    let edad = null;
    if (paciente.fecha_nacimiento) {
      const dob = new Date(paciente.fecha_nacimiento);
      edad = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    return res.status(200).json({ ...paciente.toJSON(), edad });
  } catch (err) {
    console.error('getPatientByCurp error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create new patient
export const createPatient = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('createPatient body:', req.body); // <-- agrega esto para depurar

    // aceptar tanto nombres en español como variantes en inglés
    const body = req.body || {};
    const nombre = body.nombre || body.name || body.firstName || null;
    const apellido_paterno = body.apellido_paterno || body.lastName || body.apellidoPaterno || null;
    const apellido_materno = body.apellido_materno || body.middleName || body.apellidoMaterno || '';
    const edad = Number(body.edad ?? body.age ?? 0);
    const curp = body.curp || body.CURP || body.curp_code || null;
    const fecha_nacimiento = body.fecha_nacimiento || body.birthDate || body.fechaNacimiento || null;
    const genero = body.genero || body.gender || null;
    const domicilio = body.domicilio || body.address || null;
    const telefono = body.telefono || body.phone || null;
    const familiar_responsable = body.familiar_responsable || body.responsible || null;
    const discapacidad = body.discapacidad || body.disability || null;
    const nss = body.nss || body.nss_number || null;
    const id_usuario = body.id_usuario ?? body.userId ?? null;

    // validaciones
    if (!nombre || !apellido_paterno || !curp || !fecha_nacimiento) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, apellido_paterno, curp o fecha_nacimiento', received: req.body });
    }

    const exists = await Patient.findOne({ where: { curp } });
    if (exists) {
      await transaction.rollback();
      return res.status(400).json({ message: 'CURP ya registrado' });
    }

    const patient = await Patient.create({
      id_usuario,
      nombre,
      apellido_paterno,
      apellido_materno,
      edad,
      curp,
      fecha_nacimiento,
      genero,
      domicilio,
      telefono,
      familiar_responsable,
      discapacidad,
      nss
    }, { transaction });

    await transaction.commit();
    return res.status(201).json({ message: 'Paciente creado', patient });
  } catch (error) {
    await transaction.rollback();
    console.error('createPatient error', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      gender,
      phone,
      address,
      insuranceProvider,
      insuranceNumber,
      status,
      medicalHistory,
      allergies,
      bloodType
    } = req.body;
    
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update patient
    await patient.update({
      name,
      age,
      gender,
      phone,
      address,
      insuranceProvider,
      insuranceNumber,
      status,
      medicalHistory,
      allergies,
      bloodType
    });
    
    res.status(200).json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const patient = await Patient.findByPk(id);
    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // If patient has a user account, deactivate it instead of deleting
    if (patient.userId) {
      const user = await User.findByPk(patient.userId);
      if (user) {
        await user.update({ active: false }, { transaction });
      }
    }
    
    // Update patient status to Inactive
    await patient.update({ status: 'Inactive' }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({ message: 'Patient deactivated successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};
