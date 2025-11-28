import express from 'express';
import { verifyToken, isDoctor, isAdmin, isDoctorOrDirector } from '../middlewares/auth.middleware.js';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientByCurp
} from '../controllers/patient.controller.js';

const router = express.Router();

// Get all patients
router.get('/', getAllPatients);
router.get('/curp/:curp', getPatientByCurp); // <-- new
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
