import express from 'express';
const router = express.Router();

import { verifyToken, isDoctorOrDirector } from '../middlewares/auth.middleware.js';
import {
  getAllCounterReferrals,
  getCounterReferralById,
  createCounterReferral,
  updateCounterReferralStatus,
  getCounterReferralsByDoctor
} from '../controllers/counter-referral.controller.js';

// Get all counter-referrals
router.get('/', [verifyToken, isDoctorOrDirector], getAllCounterReferrals);

// Get counter-referral by ID
router.get('/:id', [verifyToken, isDoctorOrDirector], getCounterReferralById);

// Create counter-referral
router.post('/', [verifyToken, isDoctorOrDirector], createCounterReferral);

// Update counter-referral status
router.patch('/:id/status', [verifyToken, isDoctorOrDirector], updateCounterReferralStatus);

// Get counter-referrals by doctor
router.get('/doctor/me', [verifyToken, isDoctorOrDirector], getCounterReferralsByDoctor);

export default router;
