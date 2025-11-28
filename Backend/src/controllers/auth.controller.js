import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const { User, Role, Medico, Paciente, Unidad } = db;
import authConfig from '../config/auth.config.js';

const buildUserPayload = async (userInstance, roleName) => {
  let name = userInstance.email;
  let facility = null;
  const role = (roleName || '').toLowerCase();

  if (role === 'medico' || role === 'doctor' || role === 'director') {
    const medico = await Medico.findOne({
      where: { id_usuario: userInstance.id },
      include: [{ model: Unidad, as: 'unidad', attributes: ['nombre'] }]
    });
    if (medico) {
      // construir nombre desde campos separados (compatibilidad con nombre_completo antiguo)
      name = medico.nombre_completo
        ? medico.nombre_completo
        : [medico.nombre, medico.apellido_paterno, medico.apellido_materno].filter(Boolean).join(' ');
      if (medico.unidad) facility = medico.unidad.nombre;
    }
  } else if (role === 'paciente' || role === 'patient') {
    const paciente = await Paciente.findOne({ where: { id_usuario: userInstance.id } });
    if (paciente) {
      name = paciente.nombre
        ? [paciente.nombre, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ')
        : (paciente.nombre_completo ?? userInstance.email);
    }
  }
  // si necesitas director similar:
  if (role === 'director') {
    const director = await db.Director?.findOne({ where: { id_usuario: userInstance.id } });
    if (director) {
      name = [director.nombre, director.apellido_paterno, director.apellido_materno].filter(Boolean).join(' ');
      facility = director.id_unidad ? (await Unidad.findByPk(director.id_unidad))?.nombre : facility;
    }
  }

  return { id: String(userInstance.id), email: userInstance.email, name, role: roleName, facility };
};

export const login = async (req, res) => {
  try {
    console.log('[login] RAW body:', req.body);
    const { email, password, selectedRole } = req.body;
    console.log('[login] parsed body:', { email, password: password ? '***' : null, selectedRole });

    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    // Buscar usuario solo por email e incluir Role
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['id_rol', 'nombre_rol'] }],
      attributes: ['id', 'email', 'password_hash', 'id_rol', 'activo']
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Verificar contraseña
    const match = typeof user.comparePassword === 'function'
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password_hash);
    console.log('[login] password check for', email, ':', match);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Validar selectedRole numérico contra user.id_rol si se envió
    if (selectedRole !== undefined && selectedRole !== null) {
      const sel = Number(selectedRole);
      if (Number.isNaN(sel)) {
        return res.status(400).json({ message: 'selectedRole must be a number' });
      }
      if (Number(user.id_rol) !== sel) {
        console.log('[login] role mismatch: sent=', sel, ' db=', user.id_rol);
        return res.status(403).json({ message: 'Invalid role for this user' });
      }
    }

    // Obtener rol real y devolver token + payload
    const roleName = user.Role?.nombre_rol ?? (await Role.findByPk(user.id_rol))?.nombre_rol ?? null;
    const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });
    const userPayload = await buildUserPayload(user, roleName);

    return res.status(200).json({ token, user: userPayload });
  } catch (err) {
    console.error('login error', err?.stack ?? err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const profile = async (req, res) => {
  try {
    const id = req.userId || (req.user && req.user.id);
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findByPk(id, { attributes: ['id', 'email', 'id_rol', 'activo'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const roleRecord = await Role.findByPk(user.id_rol);
    const userPayload = await buildUserPayload(user, roleRecord ? roleRecord.nombre_rol : null);

    return res.status(200).json({ user: userPayload });
  } catch (err) {
    console.error('profile error', err?.stack ?? err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const id = req.userId || (req.user && req.user.id);
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findByPk(id, { attributes: ['id', 'password_hash'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error', err?.stack ?? err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'email, password and role required' });

    const roleRecord = await Role.findOne({ where: { nombre_rol: role } });
    if (!roleRecord) return res.status(400).json({ message: 'Invalid role' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash: hashed,
      id_rol: roleRecord.id_rol,
      activo: true
    });

    return res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    console.error('signup error', err?.stack ?? err);
    return res.status(500).json({ message: 'Server error' });
  }
};
