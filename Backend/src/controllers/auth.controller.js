import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const { User, Role, Medico, Paciente, Unidad, Administrativo } = db;
import authConfig from '../config/auth.config.js';

const buildUserPayload = async (userInstance, roleName) => {
  let name = userInstance.email;
  let facility = null;
  const role = (roleName || '').toLowerCase();

  // Usar id_usuario si existe (fallback a id)
  const userPk = userInstance.id_usuario ?? userInstance.id;

  // Medico / Doctor
  if (role === 'medico' || role === 'doctor') {
    const medico = await Medico.findOne({
      where: { id_usuario: userPk },
      include: [{ model: Unidad, as: 'unidad', attributes: ['nombre'] }]
    });
    if (medico) {
      name = medico.nombre_completo
        ? medico.nombre_completo
        : [medico.nombre, medico.apellido_paterno, medico.apellido_materno].filter(Boolean).join(' ');
      if (medico.unidad) facility = medico.unidad.nombre;
    }
    return { id: String(userPk), email: userInstance.email, name, role: roleName, facility };
  }

  // Administrativo / Admin
  if (role === 'administrativo' || role === 'admin' || role === 'administrador') {
    const administrativo = await Administrativo.findOne({
      where: { id_usuario: userPk },
      attributes: ['id_administrativo', 'id_usuario', 'id_unidad', 'nombre', 'apellido_paterno', 'apellido_materno', 'area_trabajo', 'numero_empleado']
    });

    if (administrativo) {
      name = [administrativo.nombre, administrativo.apellido_paterno, administrativo.apellido_materno].filter(Boolean).join(' ');
      if (administrativo.id_unidad) {
        const unidad = await Unidad.findByPk(administrativo.id_unidad, { attributes: ['nombre'] });
        if (unidad) facility = unidad.nombre;
      }
      facility = facility || administrativo.area_trabajo || administrativo.numero_empleado || null;
    }

    return { id: String(userPk), email: userInstance.email, name, role: roleName, facility };
  }

  // Paciente / Patient
  if (role === 'paciente' || role === 'patient') {
    const paciente = await Paciente.findOne({ where: { id_usuario: userPk } });
    if (paciente) {
      name = paciente.nombre
        ? [paciente.nombre, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ')
        : (paciente.nombre_completo ?? userInstance.email);
    }
    return { id: String(userPk), email: userInstance.email, name, role: roleName, facility };
  }

  // Director
  if (role === 'director') {
    const director = await db.Director?.findOne({ where: { id_usuario: userPk } });
    if (director) {
      name = [director.nombre, director.apellido_paterno, director.apellido_materno].filter(Boolean).join(' ');
      facility = director.id_unidad ? (await Unidad.findByPk(director.id_unidad))?.nombre : facility;
    }
    return { id: String(userPk), email: userInstance.email, name, role: roleName, facility };
  }

  return { id: String(userPk), email: userInstance.email, name, role: roleName, facility };
};

export const login = async (req, res) => {
  try {
    console.log('[login] RAW body:', req.body);
    const { email, password, selectedRole } = req.body;
    console.log('[login] parsed body:', { email, password: password ? '***' : null, selectedRole });

    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    // No solicitar atributos adicionales: dejar que Sequelize cargue los campos del modelo
    let user;
    try {
      user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['id_rol', 'nombre_rol'] }]
      });
    } catch (dbErr) {
      console.error('User.findOne failed:', dbErr?.message ?? dbErr, dbErr?.sql ? '\nSQL: '+dbErr.sql : '');
      throw dbErr;
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = typeof user.comparePassword === 'function'
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password_hash);
    console.log('[login] password check for', email, ':', match);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    if (selectedRole !== undefined && selectedRole !== null) {
      const sel = Number(selectedRole);
      if (Number.isNaN(sel)) return res.status(400).json({ message: 'selectedRole must be a number' });
      if (Number(user.id_rol) !== sel) {
        console.log('[login] role mismatch: sent=', sel, ' db=', user.id_rol);
        return res.status(403).json({ message: 'Invalid role for this user' });
      }
    }

    const roleName = user.Role?.nombre_rol ?? (await Role.findByPk(user.id_rol))?.nombre_rol ?? null;

    // usar id_usuario si existe, fallback a id
    const userPk = user.id_usuario ?? user.id;
    const secret = (authConfig && authConfig.secret) || process.env.SECRET || process.env.JWT_SECRET || 'secret-key';
    const tokenTtl = process.env.TOKEN_EXPIRES || authConfig.expiresIn || '7d';
    const token = jwt.sign({ id: userPk }, secret, { expiresIn: tokenTtl });

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
