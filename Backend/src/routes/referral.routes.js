import express from 'express';
import { createReferral, getAllReferrals, getReferralById, getReferralsByDoctor, getReferralsByPatient, updateReferralStatus } from '../controllers/referral.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.post('/', verifyToken, createReferral);
router.get('/', verifyToken, getAllReferrals);
router.get('/id/:id', verifyToken, getReferralById);
router.get('/doctor/me', verifyToken, getReferralsByDoctor);
router.get('/patient/:patientId', verifyToken, getReferralsByPatient);
router.patch('/:id/status', verifyToken, updateReferralStatus);
export default router;
