import db from '../models/index.js';

const { Medico } = db;

export const getMedicoByUsuario = async (req, res) => {
  try {
    const userId = Number(req.params.userId || req.params.id);
    if (!userId) return res.status(400).json({ message: 'userId requerido' });

    const medico = await Medico.findOne({ where: { id_usuario: userId } });
    if (!medico) return res.status(404).json({ message: 'Médico no encontrado' });

    return res.status(200).json(medico);
  } catch (err) {
    console.error('getMedicoByUsuario error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getMedicoByUsuario };