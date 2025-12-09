// backend/src/app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Cargar variables de entorno lo antes posible
dotenv.config(); // ahora dotenv está definido

// Middlewares para parseo de body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importa rutas CON LA NUEVA RUTA RELATIVA
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import directorRoutes from './routes/director.routes.js';
import referralRoutes from './routes/referral.routes.js';
import counterReferralRoutes from './routes/counter-referral.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import reportRoutes from './routes/report.routes.js';
import unidadEspecialidadRoutes from './routes/unidad_especialidad.routes.js';
import especialidadRoutes from './routes/especialidad.routes.js';
import unidadesRoutes from './routes/unidades.routes.js';
import medicosRoutes from './routes/medicos.routes.js';

// Middleware
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
//app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/counter-referrals', counterReferralRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/unidad_especialidad', unidadEspecialidadRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/medicos', medicosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Medical Referral System API' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

export default app; // <-- ¡EXPORTA LA APP!