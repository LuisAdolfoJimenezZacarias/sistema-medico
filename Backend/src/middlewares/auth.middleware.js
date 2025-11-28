import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';
import db from '../models/index.js';
const { User, Role } = db;
import { Op } from 'sequelize';

const normalizeRoleName = (r) => {
  if (!r) return '';
  const s = String(r).toLowerCase();
  if (s === 'medico') return 'doctor';
  if (s === 'paciente') return 'patient';
  if (s === 'administrador' || s === 'admin') return 'admin';
  return s;
};

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromAuth = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = tokenFromAuth || req.headers['x-access-token'] || req.headers['token'] || null;

    if (!token) {
      console.warn('verifyToken: no token provided');
      return res.status(403).json({ message: 'No token provided' });
    }

    console.log('verifyToken: token received:', token);

    let decoded;
    try {
      decoded = jwt.verify(token, authConfig.secret);
    } catch (err) {
      console.error('JWT verify failed:', err.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('verifyToken: decoded token:', decoded);

    const userId = decoded.id ?? decoded.userId ?? decoded.id_usuario;
    if (!userId) {
      console.warn('verifyToken: no id in token payload');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Intentar encontrar usuario por id_usuario o por PK
    let user = null;
    try {
      user = await User.findOne({
        where: { [Op.or]: [{ id_usuario: userId }, { id: userId }] },
        attributes: ['id_usuario', 'email', 'password_hash', 'id_rol', 'activo'], // <-- evitar seleccionar campos inexistentes
        include: [{ model: Role, attributes: ['nombre_rol'] }]
      });
    } catch (e) {
      console.error('verifyToken: DB lookup error', e);
      // fallback simple
      try { user = await User.findOne({ where: { id_usuario: userId }, attributes: ['id_usuario','email','id_rol','activo'] }); } catch { user = null; }
    }

    if (!user) {
      console.warn('verifyToken: User not found for id:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // normalizar campos según tu esquema real
    const roleName = user.Role?.nombre_rol ?? (user.id_rol ? (await Role.findByPk(user.id_rol))?.nombre_rol : null);
    req.userId = userId;
    req.user = {
      id: user.id ?? user.id_usuario ?? userId,
      email: user.email,
      name: user.nombre_completo ?? [user.nombre, user.apellido_paterno, user.apellido_materno].filter(Boolean).join(' ') ?? user.email,
      role: normalizeRoleName(roleName),
      active: typeof user.activo !== 'undefined' ? user.activo : user.active
    };

    next();
  } catch (error) {
    console.error('verifyToken error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const isAdmin = (req, res, next) => {
  const r = (req.user?.role ?? '').toLowerCase();
  if (r === 'admin') { next(); return; }
  res.status(403).json({ message: 'Require Admin Role!' });
};

export const isDoctor = (req, res, next) => {
  const r = (req.user?.role ?? '').toLowerCase();
  if (r === 'doctor' || r === 'medico') { next(); return; }
  res.status(403).json({ message: 'Require Doctor Role!' });
};

export const isDirector = (req, res, next) => {
  const r = (req.user?.role ?? '').toLowerCase();
  if (r === 'director') { next(); return; }
  res.status(403).json({ message: 'Require Director Role!' });
};

export const isPatient = (req, res, next) => {
  const r = (req.user?.role ?? '').toLowerCase();
  if (r === 'patient' || r === 'paciente') { next(); return; }
  res.status(403).json({ message: 'Require Patient Role!' });
};

export const isDoctorOrDirector = (req, res, next) => {
  const r = (req.user?.role ?? '').toLowerCase();
  if (r === 'doctor' || r === 'medico' || r === 'director') { next(); return; }
  res.status(403).json({ message: 'Require Doctor or Director Role!' });
};
