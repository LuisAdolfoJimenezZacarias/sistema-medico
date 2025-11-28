import express from 'express';
import { signup, login, profile, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, profile);
router.post('/change-password', verifyToken, changePassword);

export default router;
