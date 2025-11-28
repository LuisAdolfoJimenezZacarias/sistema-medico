import express from 'express';
import { getUnidadesByEspecialidad } from '../controllers/unidad-especialidades.controller.js';
const router = express.Router();

router.get('/por_especialidad/:id', getUnidadesByEspecialidad);

export default router;