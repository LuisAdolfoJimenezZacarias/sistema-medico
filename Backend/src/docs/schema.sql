-- Database schema for Medical Referral System

-- Create database
CREATE DATABASE IF NOT EXISTS medical_referral_system;
USE medical_referral_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('doctor', 'admin', 'director', 'patient') NOT NULL DEFAULT 'doctor',
  facility VARCHAR(255),
  specialty VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  age INT,
  gender ENUM('Male', 'Female', 'Other'),
  idNumber VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  insuranceProvider VARCHAR(255),
  insuranceNumber VARCHAR(100),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  medicalHistory TEXT,
  allergies TEXT,
  bloodType VARCHAR(10),
  userId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

  -- Referrals table
  CHAR(100) NOT NULL,
    reason TEXT NOT NULL,REATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referralId VARCHAR(50) NOT NULL UNIQUE,
    patientId INT NOT NULL,
    specialty VARC
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
    referringDoctorId INT NOT NULL,
    referredDoctorId INT,
    referringFacility VARCHAR(255) NOT NULL,
    referredFacility VARCHAR(255) NOT NULL,
    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    dateCompleted DATETIME,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (referringDoctorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referredDoctorId) REFERENCES users(id) ON DELETE SET NULL
  );

-- Counter-Referrals table
CREATE TABLE IF NOT EXISTS counter_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  counterReferralId VARCHAR(50) NOT NULL UNIQUE,
  referralId INT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  followUpNeeded BOOLEAN DEFAULT FALSE,
  followUpInstructions TEXT,
  referringDoctorId INT NOT NULL,
  referredDoctorId INT NOT NULL,
  status ENUM('Pending', 'Sent', 'Received') DEFAULT 'Pending',
  dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referralId) REFERENCES referrals(id) ON DELETE CASCADE,
  FOREIGN KEY (referringDoctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referredDoctorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointmentId VARCHAR(50) NOT NULL UNIQUE,
  patientId INT NOT NULL,
  doctorId INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('Scheduled', 'Completed', 'Cancelled', 'No-show') DEFAULT 'Scheduled',
  type ENUM('First Visit', 'Follow-up', 'Consultation') DEFAULT 'Consultation',
  department VARCHAR(100) NOT NULL,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_priority ON referrals(priority);
CREATE INDEX idx_counter_referrals_status ON counter_referrals(status);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
