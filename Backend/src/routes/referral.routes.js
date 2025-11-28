import express from 'express';
import { verifyToken, isDoctor, isDoctorOrDirector } from '../middlewares/auth.middleware.js';
import {
  getAllReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
  getReferralsByDoctor,
  getReferralsByPatient
} from '../controllers/referral.controller.js';


const router = express.Router();

// Get all referrals
router.get('/', [verifyToken, isDoctorOrDirector], getAllReferrals);

// Get referral by ID
router.get('/:id', [verifyToken, isDoctorOrDirector], getReferralById);

// Create new referral
router.post('/', [verifyToken, isDoctor], createReferral);

// Update referral status
router.put('/:id/status', [verifyToken, isDoctor], updateReferralStatus);

// Get referrals by doctor
router.get('/doctor/me', [verifyToken, isDoctor], getReferralsByDoctor);

// Get referrals by patient
router.get('/patient/:patientId', [verifyToken, isDoctorOrDirector], getReferralsByPatient);

export default router;
