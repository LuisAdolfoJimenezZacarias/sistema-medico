import db from '../models/index.js';
const { sequelize } = db;

export const getUnidadesByEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'id_especialidad requerido' });

    // Raw SQL usando el nombre real de la tabla en la BD (unidades_medicas)
    const [rows] = await sequelize.query(
      `SELECT u.id_unidad, u.nombre, u.direccion
       FROM unidades_medicas u
       JOIN unidad_especialidades ue ON ue.id_unidad = u.id_unidad
       WHERE ue.id_especialidad = ? AND ue.activo = 1
       ORDER BY u.nombre`,
      { replacements: [id] }
    );

    return res.status(200).json(rows || []);
  } catch (err) {
    console.error('getUnidadesByEspecialidad error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getUnidadesByEspecialidad };