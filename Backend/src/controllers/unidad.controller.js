import db from '../models/index.js';
const { Unidad, sequelize } = db;

export const getUnidades = async (req, res) => {
  try {
    const exclude = req.query.exclude ? Number(req.query.exclude) : (req.params.id ? Number(req.params.id) : null);

    if (Unidad && typeof Unidad.findAll === 'function') {
      const where = { activo: 1 }; // <-- eliminar la anotación de tipo

      if (exclude && !Number.isNaN(exclude)) where.id_unidad = { [Op.ne]: exclude };
      const rows = await Unidad.findAll({
        where,
        attributes: ['id_unidad', 'nombre', 'clues', 'nivel_atencion', 'telefono'],
        order: [['nombre', 'ASC']]
      });
      return res.status(200).json(rows);
    }

    // fallback raw SQL (ajusta nombre de tabla si es distinto)
    const sql = exclude && !Number.isNaN(exclude)
      ? 'SELECT id_unidad, nombre, clues, nivel_atencion, telefono FROM unidades_medicas WHERE activo=1 AND id_unidad <> ? ORDER BY nombre'
      : 'SELECT id_unidad, nombre, clues, nivel_atencion, telefono FROM unidades_medicas WHERE activo=1 ORDER BY nombre';
    const replacements = exclude && !Number.isNaN(exclude) ? [exclude] : [];
    const [rows] = await sequelize.query(sql, { replacements });
    return res.status(200).json(rows || []);
  } catch (err) {
    console.error('getUnidades error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- NUEVO: obtener unidad por id ---
export const getUnidadById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id_unidad requerido' });

    if (Unidad && typeof Unidad.findByPk === 'function') {
      const unidad = await Unidad.findByPk(id, {
        attributes: ['id_unidad', 'nombre', 'clues', 'direccion', 'nivel_atencion', 'telefono']
      });
      if (!unidad) return res.status(404).json({ message: 'Unidad no encontrada' });
      return res.status(200).json(unidad);
    }

    // fallback raw SQL (ajusta nombre de tabla si es distinto)
    const [rows] = await sequelize.query(
      'SELECT id_unidad, nombre, clues, direccion, nivel_atencion, telefono FROM unidades_medicas WHERE id_unidad = ? LIMIT 1',
      { replacements: [id] }
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Unidad no encontrada' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('getUnidadById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getUnidades, getUnidadById };