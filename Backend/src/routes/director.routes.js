import express from 'express';
import { getDirectorByUnidad } from '../controllers/director.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.get('/por_unidad/:unidadId', verifyToken, getDirectorByUnidad);

export default router;