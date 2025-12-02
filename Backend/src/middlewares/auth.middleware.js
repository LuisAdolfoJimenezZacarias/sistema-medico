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

    // DEBUG: mostrar qué token llega desde el cliente
    console.log('verifyToken: authHeader=', authHeader);
    console.log('verifyToken: token (normalized)=', token);

    if (!token) {
      console.warn('verifyToken: no token provided');
      return res.status(403).json({ message: 'No token provided' });
    }

    const secret = (authConfig && authConfig.secret) || process.env.SECRET || process.env.JWT_SECRET || 'secret-key';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
      console.log('verifyToken: jwt.verify OK, payload=', decoded);
    } catch (err) {
      // Expired token -> informar explícitamente
      if (err && err.name === 'TokenExpiredError') {
        console.warn('verifyToken: token expired');
        return res.status(401).json({ message: 'Token expired' });
      }
      console.error('JWT verify failed:', err && err.message ? err.message : err);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = decoded.id ?? decoded.userId ?? decoded.id_usuario;
    if (!userId) {
      console.warn('verifyToken: no id in token payload');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // buscar usuario (mantener comportamiento existente)
    let user = null;
    try {
      user = await User.findOne({
        where: { [Op.or]: [{ id_usuario: userId }, { id: userId }] },
        attributes: ['id_usuario', 'email', 'password_hash', 'id_rol', 'activo'],
        include: [{ model: Role, attributes: ['nombre_rol'] }]
      });
    } catch (e) {
      console.error('verifyToken: DB lookup error', e);
      try { user = await User.findOne({ where: { id_usuario: userId }, attributes: ['id_usuario','email','id_rol','activo'] }); } catch { user = null; }
    }

    if (!user) {
      console.warn('verifyToken: User not found for id:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

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

// ejemplo de manejo en frontend (ubicación a tu criterio)
async function fetchWithAuth(url, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    const json = await res.json().catch(() => ({}));
    if (json.message === 'Token expired') {
      localStorage.removeItem('token');
      // redirigir a login (si usas react-router)
      window.location.href = '/login';
      return Promise.reject(new Error('Token expired'));
    }
  }
  return res;
}
