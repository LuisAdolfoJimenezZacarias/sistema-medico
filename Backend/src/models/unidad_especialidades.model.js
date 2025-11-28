import db from '../models/index.js';
const { Unidad, unidad_especialidades, sequelize } = db;

export const getUnidadesByEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'id especialidad requerido' });

    // Si existe el modelo unidad_especialidades y la asociación a Unidad
    if (unidad_especialidades && Unidad) {
      const rows = await unidad_especialidades.findAll({
        where: { id_especialidad: id, activo: 1 },
        include: [{ model: Unidad, as: 'unidad', attributes: ['id_unidad', 'nombre', 'direccion'] }]
      });
      const unidades = rows.map(r => r.unidad).filter(Boolean);
      return res.status(200).json(unidades);
    }

    // fallback SQL directo
    const [result] = await sequelize.query(
      `SELECT u.id_unidad, u.nombre, u.direccion
       FROM unidades u
       JOIN unidad_especialidades ue ON ue.id_unidad = u.id_unidad
       WHERE ue.id_especialidad = ? AND ue.activo = 1`,
      { replacements: [id] }
    );
    return res.status(200).json(result || []);
  } catch (err) {
    console.error('getUnidadesByEspecialidad error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};