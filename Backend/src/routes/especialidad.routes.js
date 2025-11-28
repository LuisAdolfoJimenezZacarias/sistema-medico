import express from 'express';
import { getAllEspecialidades } from '../controllers/especialidad.controller.js';
const router = express.Router();

router.get('/', getAllEspecialidades);

export default router;