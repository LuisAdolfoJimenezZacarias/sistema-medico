import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/pages/Login';
// Layouts
import { DoctorLayout } from '../layouts/DoctorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { DirectorLayout } from '../layouts/DirectorLayout';
import { PatientLayout } from '../layouts/PatientLayout';
import { LegacyLayout } from '../layouts/LegacyLayout';

import NuevaReferencia from '../features/medicos/pages/NuevaReferencia';
//import NuevaContrarreferencia from '../features/medicos/pages/NuevaContrarreferencia';
import NuevaContrarreferencia from '../features/medicos/pages/NuevaContrarreferencia';
import ReferenciasRecibidas from '../features/medicos/pages/ReferenciasRecibidas';

// Doctor pages
import { DoctorDashboard } from '../features/medicos/pages/DoctorDashboard';
import { GestionPacientes } from '../features/medicos/pages/GestionPacientes';
import { ReferenciasEmitidas } from '../features/medicos/pages/ReferenciasEmitidas';
import { ContraReferencias } from '../features/medicos/pages/ContraReferencias';
import  NuevoPaciente  from '../features/medicos/pages/NuevoPaciente';
// Admin pages
import { AdminDashboard } from '../features/administrativos/pages/AdminDashboard';
import { GestionUsuarios } from '../features/administrativos/pages/GestionUsuarios';
import { GestionCitas } from '../features/administrativos/pages/GestionCitas';
import { GestionDocumentos } from '../features/administrativos/pages/GestionDocumentos';

// Director pages
import { DirectorDashboard } from '../features/directores/pages/DirectorDashboard';
import { InformesUnidad } from '../features/directores/pages/InformesUnidad';
import { DirectorAuthorizations } from '../features/directores/pages/Autorizaciones';

// Patient pages
import { PatientDashboard } from '../features/pacientes/pages/PatientDashboard';
import { MisCitas } from '../features/pacientes/pages/MisCitas';

// Auth context
import { AuthProvider, useAuth } from '../context/auth-context';

/* ProtectedRoute para react-router v6 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // o spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/* Redirige según rol (usado dentro del AuthProvider) */
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'doctor': return <Navigate to="/doctor/dashboard" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'director': return <Navigate to="/director/dashboard" replace />;
    case 'patient': return <Navigate to="/patient/dashboard" replace />;
    default: return <Navigate to="/dashboard" replace />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Doctor */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute>
            <DoctorLayout><DoctorDashboard /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute>
            <DoctorLayout><GestionPacientes /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/referrals" element={
          <ProtectedRoute>
            <DoctorLayout><ReferenciasEmitidas /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/counter-referrals" element={
          <ProtectedRoute>
            <DoctorLayout><ContraReferencias /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/referrals/inbox" element={
          <ProtectedRoute>
            <DoctorLayout><ReferenciasRecibidas /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/referrals/NuevaReferencia" element={
          <ProtectedRoute>
            <DoctorLayout><NuevaReferencia /></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/referrals/NuevoPaciente" element={
          <ProtectedRoute>
            <DoctorLayout><NuevoPaciente/></DoctorLayout>
          </ProtectedRoute>
        } />
        <Route path="/doctor/referrals/NuevaContrarreferencia" element={
          <ProtectedRoute>
            <DoctorLayout><NuevaContrarreferencia /></DoctorLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminLayout><GestionUsuarios /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute>
            <AdminLayout><GestionCitas /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/documents" element={
          <ProtectedRoute>
            <AdminLayout><GestionDocumentos /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Director */}
        <Route path="/director/dashboard" element={
          <ProtectedRoute>
            <DirectorLayout><DirectorDashboard /></DirectorLayout>
          </ProtectedRoute>
        } />
        <Route path="/director/reports" element={
          <ProtectedRoute>
            <DirectorLayout><InformesUnidad /></DirectorLayout>
          </ProtectedRoute>
        } />
        <Route path="/director/authorizations" element={
          <ProtectedRoute>
            <DirectorLayout><DirectorAuthorizations /></DirectorLayout>
          </ProtectedRoute>
        } />

        {/* Patient */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute>
            <PatientLayout><PatientDashboard /></PatientLayout>
          </ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute>
            <PatientLayout><MisCitas /></PatientLayout>
          </ProtectedRoute>
        } />

        {/* forzar redirección a /login */}
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}