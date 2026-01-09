import db from '../models/index.js';
const { Director } = db;

export const getDirectorByUnidad = async (req, res) => {
  try {
    const unidadId = Number(req.params.unidadId);
    if (!unidadId) return res.status(400).json({ message: 'unidadId requerido' });

    // no solicitar 'clave' si la columna no existe en la tabla
    const director = await Director.findOne({
      where: { id_unidad: unidadId },
      attributes: ['id_director','id_usuario','id_unidad','nombre','apellido_paterno','apellido_materno']
    });

    if (!director) return res.status(404).json({ message: 'Director no encontrado' });
    return res.status(200).json(director.get ? director.get({ plain: true }) : director);
  } catch (err) {
    console.error('getDirectorByUnidad error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};