import express from 'express';
import { getUnidades, getUnidadById } from '../controllers/unidad.controller.js';
const router = express.Router();

router.get('/', getUnidades);           // GET /api/unidades
router.get('/:id', getUnidadById);      // GET /api/unidades/:id

export default router;