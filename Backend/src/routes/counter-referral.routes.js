import express from 'express';
import { verifyToken, isDoctor, isDoctorOrDirector } from '../middlewares/auth.middleware.js';
import {
  getAllCounterReferrals,
  getCounterReferralById,
  createCounterReferral,
  updateCounterReferralStatus,
  getCounterReferralsByDoctor
} from '../controllers/counter-referral.controller.js';

const router = express.Router();

// Get all counter-referrals
router.get('/', [verifyToken, isDoctorOrDirector], getAllCounterReferrals);

// Get counter-referral by ID
router.get('/:id', [verifyToken, isDoctorOrDirector], getCounterReferralById);

// Create new counter-referral
router.post('/', [verifyToken, isDoctor], createCounterReferral);

// Update counter-referral status
router.put('/:id/status', [verifyToken, isDoctor], updateCounterReferralStatus);

// Get counter-referrals by doctor
router.get('/doctor/me', [verifyToken, isDoctor], getCounterReferralsByDoctor);

export default router;
