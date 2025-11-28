import express from 'express';
import { verifyToken, isDirector, isAdmin } from '../middlewares/auth.middleware.js';
import { sequelize } from '../config/database.js';
import Referral from '../models/referral.model.js';
import CounterReferral from '../models/counter-referral.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';

const router = express.Router();

// Get referral statistics
router.get('/referral-stats', [verifyToken, isDirector], async (req, res) => {
  try {
    const totalReferrals = await Referral.count();
    const pendingReferrals = await Referral.count({ where: { status: 'Pending' } });
    const acceptedReferrals = await Referral.count({ where: { status: 'Accepted' } });
    const rejectedReferrals = await Referral.count({ where: { status: 'Rejected' } });
    const completedReferrals = await Referral.count({ where: { status: 'Completed' } });
    
    // Referrals by specialty
    const referralsBySpecialty = await Referral.findAll({
      attributes: [
        'specialty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['specialty'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    // Referrals by priority
    const referralsByPriority = await Referral.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    // Monthly referral trends
    const monthlyReferrals = await Referral.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('dateCreated')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('dateCreated')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('dateCreated')),
        sequelize.fn('YEAR', sequelize.col('dateCreated'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('dateCreated')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('dateCreated')), 'ASC']
      ]
    });
    
    res.status(200).json({
      totalReferrals,
      pendingReferrals,
      acceptedReferrals,
      rejectedReferrals,
      completedReferrals,
      referralsBySpecialty,
      referralsByPriority,
      monthlyReferrals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get counter-referral statistics
router.get('/counter-referral-stats', [verifyToken, isDirector], async (req, res) => {
  try {
    const totalCounterReferrals = await CounterReferral.count();
    const pendingCounterReferrals = await CounterReferral.count({ where: { status: 'Pending' } });
    const sentCounterReferrals = await CounterReferral.count({ where: { status: 'Sent' } });
    const receivedCounterReferrals = await CounterReferral.count({ where: { status: 'Received' } });
    
    // Counter-referrals with follow-up needed
    const followUpNeeded = await CounterReferral.count({ where: { followUpNeeded: true } });
    
    // Monthly counter-referral trends
    const monthlyCounterReferrals = await CounterReferral.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('dateCreated')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('dateCreated')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('dateCreated')),
        sequelize.fn('YEAR', sequelize.col('dateCreated'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('dateCreated')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('dateCreated')), 'ASC']
      ]
    });
    
    res.status(200).json({
      totalCounterReferrals,
      pendingCounterReferrals,
      sentCounterReferrals,
      receivedCounterReferrals,
      followUpNeeded,
      monthlyCounterReferrals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor performance statistics
router.get('/doctor-performance', [verifyToken, isDirector], async (req, res) => {
  try {
    // Referrals by doctor
    const referralsByDoctor = await Referral.findAll({
      attributes: [
        'referringDoctorId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty']
        }
      ],
      group: ['referringDoctorId'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    // Counter-referrals by doctor
    const counterReferralsByDoctor = await CounterReferral.findAll({
      attributes: [
        'referringDoctorId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'referringDoctor',
          attributes: ['name', 'specialty']
        }
      ],
      group: ['referringDoctorId'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    // Appointments by doctor
    const appointmentsByDoctor = await Appointment.findAll({
      attributes: [
        'doctorId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialty']
        }
      ],
      group: ['doctorId'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    res.status(200).json({
      referralsByDoctor,
      counterReferralsByDoctor,
      appointmentsByDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient statistics
router.get('/patient-stats', [verifyToken, isDirector], async (req, res) => {
  try {
    const totalPatients = await Patient.count();
    const activePatients = await Patient.count({ where: { status: 'Active' } });
    const inactivePatients = await Patient.count({ where: { status: 'Inactive' } });
    
    // Patients by gender
    const patientsByGender = await Patient.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['gender']
    });
    
    // Age distribution
    const ageDistribution = await Patient.findAll({
      attributes: [
        [sequelize.literal('CASE WHEN age < 18 THEN "Under 18" WHEN age BETWEEN 18 AND 30 THEN "18-30" WHEN age BETWEEN 31 AND 45 THEN "31-45" WHEN age BETWEEN 46 AND 60 THEN "46-60" ELSE "Over 60" END'), 'ageGroup'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.literal('ageGroup')],
      order: [[sequelize.literal('ageGroup'), 'ASC']]
    });
    
    // Patients by insurance provider
    const patientsByInsurance = await Patient.findAll({
      attributes: [
        'insuranceProvider',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['insuranceProvider'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    res.status(200).json({
      totalPatients,
      activePatients,
      inactivePatients,
      patientsByGender,
      ageDistribution,
      patientsByInsurance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment statistics
router.get('/appointment-stats', [verifyToken, isDirector], async (req, res) => {
  try {
    const totalAppointments = await Appointment.count();
    const scheduledAppointments = await Appointment.count({ where: { status: 'Scheduled' } });
    const completedAppointments = await Appointment.count({ where: { status: 'Completed' } });
    const cancelledAppointments = await Appointment.count({ where: { status: 'Cancelled' } });
    const noShowAppointments = await Appointment.count({ where: { status: 'No-show' } });
    
    // Appointments by type
    const appointmentsByType = await Appointment.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    // Appointments by department
    const appointmentsByDepartment = await Appointment.findAll({
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['department'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    
    // Monthly appointment trends
    const monthlyAppointments = await Appointment.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('date')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('date')),
        sequelize.fn('YEAR', sequelize.col('date'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('date')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('date')), 'ASC']
      ]
    });
    
    res.status(200).json({
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      appointmentsByType,
      appointmentsByDepartment,
      monthlyAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
