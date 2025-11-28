import express from 'express';
import { getMedicoByUsuario } from '../controllers/medico.controller.js';
const router = express.Router();

// GET /api/medicos/por_usuario/:userId
router.get('/por_usuario/:userId', getMedicoByUsuario);

// opcional: GET /api/medicos/:id para obtener por id de medico
router.get('/:id', async (req, res) => { res.status(501).json({ message: 'No implementado' }); });

export default router;