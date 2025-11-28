import express from 'express';
import { verifyToken, isDoctor, isAdmin, isDoctorOrDirector } from '../middlewares/auth.middleware.js';
import Appointment from '../models/appointment.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';

const router = express.Router();

// Get all appointments
router.get('/', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patientId', 'name']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialty']
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patientId', 'name', 'age', 'gender', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialty', 'facility']
        }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      type,
      department,
      notes
    } = req.body;
    
    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor exists
    const doctor = await User.findByPk(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Generate appointment ID
    const appointmentCount = await Appointment.count();
    const currentYear = new Date().getFullYear();
    const appointmentId = `APT-${currentYear}-${String(appointmentCount + 1).padStart(3, '0')}`;
    
    // Create appointment
    const appointment = await Appointment.create({
      appointmentId,
      patientId,
      doctorId,
      date,
      time,
      type: type || 'Consultation',
      department,
      notes,
      status: 'Scheduled'
    });
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.put('/:id/status', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update appointment
    const updateData = { status };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    await appointment.update(updateData);
    
    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by doctor
router.get('/doctor/:doctorId', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // If not admin and not the doctor, deny access
    if (req.user.role !== 'admin' && req.userId !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const appointments = await Appointment.findAll({
      where: { doctorId },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patientId', 'name']
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', [verifyToken, isDoctorOrDirector], async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.findAll({
      where: { patientId },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialty']
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
