import db from '../models/index.js';

const { Medico } = db;

export const getMedicoByUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const medico = await Medico.findOne({
      where: { id_usuario: userId }
    });

    if (!medico) return res.status(404).json({ message: 'Medico no encontrado para ese usuario' });

    const plain = (medico && typeof medico.get === 'function') ? medico.get({ plain: true }) : medico;
    return res.status(200).json({ medico: plain });
  } catch (err) {
    console.error('getMedicoByUsuario error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getMedicoByUsuario };