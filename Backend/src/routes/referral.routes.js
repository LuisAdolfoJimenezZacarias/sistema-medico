import express from 'express';
import { createReferral, getAllReferrals, getReferralById, getReferralsByDoctor, getReferralsByPatient, updateReferralStatus, updateReferral } from '../controllers/referral.controller.js';
import { verifyToken, isDirector } from '../middlewares/auth.middleware.js';
import * as referralController from '../controllers/referral.controller.js';

const router = express.Router();
router.post('/', verifyToken, createReferral);
router.get('/', verifyToken, getAllReferrals);
router.get('/id/:id', verifyToken, getReferralById);
router.get('/doctor/me', verifyToken, getReferralsByDoctor);
router.get('/patient/:patientId', verifyToken, getReferralsByPatient);
// nuevo: actualizar referencia completa (edición desde frontend)
router.patch('/:id', verifyToken, updateReferral);
router.patch('/:id/status', verifyToken, updateReferralStatus);
// enviar al director
router.post('/:id/send-to-director', verifyToken, referralController.sendReferralToDirector);
// referencias pendientes para director
router.get('/director/pending', verifyToken, isDirector, referralController.getReferralsForDirector);
export default router;
