import db from '../models/index.js';

const { Especialidad, sequelize } = db;

export const getAllEspecialidades = async (req, res) => {
  try {
    if (Especialidad && typeof Especialidad.findAll === 'function') {
      const rows = await Especialidad.findAll({
        attributes: ['id_especialidad', 'nombre'],
        order: [['nombre', 'ASC']]
      });
      return res.status(200).json(rows);
    }

    // Fallback: consulta directa si no hay modelo Sequelize definido
    const [rows] = await sequelize.query(
      'SELECT id_especialidad, nombre FROM especialidades ORDER BY nombre'
    );
    return res.status(200).json(rows || []);
  } catch (err) {
    console.error('getAllEspecialidades error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getAllEspecialidades };