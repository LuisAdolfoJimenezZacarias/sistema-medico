import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Referral from '../models/referral.model.js';
import CounterReferral from '../models/counter-referral.model.js';
import Appointment from '../models/appointment.model.js';

dotenv.config();

// Initialize database and seed data
const initDB = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    
    // Create default users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);
    
    const users = await User.bulkCreate([
      {
        name: 'Dr. Jane Smith',
        email: 'doctor@example.com',
        password: hashedPassword,
        role: 'doctor',
        facility: 'Community Health Center',
        specialty: 'Primary Care'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        facility: 'Central Hospital'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'director@example.com',
        password: hashedPassword,
        role: 'director',
        facility: 'Central Hospital',
        specialty: 'Neurology'
      },
      {
        name: 'Maria Garcia',
        email: 'patient@example.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        name: 'Dr. Sarah Lee',
        email: 'doctor2@example.com',
        password: hashedPassword,
        role: 'doctor',
        facility: 'Skin Care Center',
        specialty: 'Dermatology'
      }
    ]);
    
    console.log('Default users created');
    
    // Create sample patients
    const patients = await Patient.bulkCreate([
      {
        patientId: 'P001',
        name: 'Maria Garcia',
        age: 45,
        gender: 'Female',
        idNumber: '123456789',
        phone: '555-123-4567',
        address: '123 Main St',
        insuranceProvider: 'MediCare',
        insuranceNumber: 'MC12345',
        status: 'Active',
        userId: users[3].id
      },
      {
        patientId: 'P002',
        name: 'John Smith',
        age: 62,
        gender: 'Male',
        idNumber: '987654321',
        phone: '555-987-6543',
        address: '456 Oak Ave',
        insuranceProvider: 'BlueCross',
        insuranceNumber: 'BC67890',
        status: 'Active'
      },
      {
        patientId: 'P003',
        name: 'Robert Johnson',
        age: 38,
        gender: 'Male',
        idNumber: '456789123',
        phone: '555-456-7890',
        address: '789 Pine Rd',
        insuranceProvider: 'Aetna',
        insuranceNumber: 'AE54321',
        status: 'Active'
      }
    ]);
    
    console.log('Sample patients created');
    
    // Create sample referrals
    const referrals = await Referral.bulkCreate([
      {
        referralId: 'REF-2023-001',
        patientId: patients[0].id,
        specialty: 'Cardiology',
        reason: 'Chest pain, abnormal ECG',
        priority: 'High',
        status: 'Pending',
        referringDoctorId: users[0].id,
        referringFacility: 'Community Health Center',
        referredFacility: 'Central Hospital',
        dateCreated: new Date()
      },
      {
        referralId: 'REF-2023-002',
        patientId: patients[1].id,
        specialty: 'Neurology',
        reason: 'Recurring headaches, dizziness',
        priority: 'Medium',
        status: 'Accepted',
        referringDoctorId: users[0].id,
        referredDoctorId: users[2].id,
        referringFacility: 'Community Health Center',
        referredFacility: 'Neurology Institute',
        dateCreated: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        referralId: 'REF-2023-003',
        patientId: patients[2].id,
        specialty: 'Dermatology',
        reason: 'Unusual skin rash, itching',
        priority: 'Low',
        status: 'Completed',
        referringDoctorId: users[0].id,
        referredDoctorId: users[4].id,
        referringFacility: 'Community Health Center',
        referredFacility: 'Skin Care Center',
        dateCreated: new Date(Date.now() - 172800000), // 2 days ago
        dateCompleted: new Date()
      }
    ]);
    
    console.log('Sample referrals created');
    
    // Create sample counter-referrals
    await CounterReferral.bulkCreate([
      {
        counterReferralId: 'CR-2023-001',
        referralId: referrals[2].id,
        diagnosis: 'Contact dermatitis',
        treatment: 'Prescribed topical corticosteroids and antihistamines',
        followUpNeeded: true,
        followUpInstructions: 'Follow up in 2 weeks if no improvement',
        referringDoctorId: users[4].id,
        referredDoctorId: users[0].id,
        status: 'Sent',
        dateCreated: new Date()
      }
    ]);
    
    console.log('Sample counter-referrals created');
    
    // Create sample appointments
    await Appointment.bulkCreate([
      {
        appointmentId: 'APT-2023-001',
        patientId: patients[0].id,
        doctorId: users[0].id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '09:00:00',
        status: 'Scheduled',
        type: 'Follow-up',
        department: 'Primary Care',
        notes: 'Follow up on medication effectiveness'
      },
      {
        appointmentId: 'APT-2023-002',
        patientId: patients[1].id,
        doctorId: users[2].id,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        time: '10:30:00',
        status: 'Scheduled',
        type: 'Consultation',
        department: 'Neurology',
        notes: 'Initial consultation for headaches'
      },
      {
        appointmentId: 'APT-2023-003',
        patientId: patients[2].id,
        doctorId: users[4].id,
        date: new Date(Date.now() - 86400000), // Yesterday
        time: '14:15:00',
        status: 'Completed',
        type: 'First Visit',
        department: 'Dermatology',
        notes: 'Diagnosed with contact dermatitis'
      }
    ]);
    
    console.log('Sample appointments created');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
};

initDB();
