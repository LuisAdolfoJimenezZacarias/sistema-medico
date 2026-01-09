import { io as ioClient } from 'socket.io-client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context'; // agregado

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const ReferenciasRecibidas: React.FC = () => {
  const { user } = useAuth(); // agregado
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const socketRef = React.useRef<any>(null);

  const fetchReceived = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('medref_token') ?? localStorage.getItem('token');
      const headers: Record<string,string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/referrals/unit/received`, { method: 'GET', headers });
      if (!res.ok) {
        console.warn('fetch received failed', res.status);
        setItems([]);
        return;
      }
      const data = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? data : (data.rows ?? data));
    } catch (err) {
      console.error('fetchReceived error', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchReceived(); }, [fetchReceived]);

  React.useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/api\/?$/, '');
    const socket = ioClient(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // obtener unidad preferiblemente desde el contexto de auth (no tocar login)
    const unidadId = user?.id_unidad ?? user?.unidad_id ?? sessionStorage.getItem('user_unit') ?? null;
    if (unidadId) {
      // usar el mismo nombre de sala que el backend; ejemplo: 'unit:123' o '123' según lo que implemente el servidor
      socket.emit('joinUnit', String(unidadId));
    }

    socket.on('referralReceived', (payload: any) => {
      console.debug('[socket] referralReceived', payload);
      fetchReceived();
    });

    socket.on('referralUpdated', (payload: any) => {
      console.debug('[socket] referralUpdated', payload);
      fetchReceived();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchReceived, user]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Referencias recibidas</h2>
        <div>
          <button onClick={() => fetchReceived()} className="btn btn-sm">Refrescar</button>
        </div>
      </div>

      {loading ? <div>Cargando...</div> : (
        <div className="overflow-auto bg-white rounded shadow-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Folio</th>
                <th className="p-2 text-left">Paciente</th>
                <th className="p-2 text-left">Unidad origen</th>
                <th className="p-2 text-left">Especialidad</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-muted">No hay referencias</td></tr>
              )}
              {items.map((r:any) => (
                <tr key={r.id_referencia ?? r.folio ?? r.id}>
                  <td className="p-2">{r.folio ?? r.id_referencia ?? r.id}</td>
                  <td className="p-2">{r.paciente ? `${r.paciente.nombre} ${r.paciente.apellido_paterno ?? ''}`.trim() : r.nombre_paciente}</td>
                  <td className="p-2">{r.unidad_origen?.nombre ?? r.unidad_origen_nombre}</td>
                  <td className="p-2">{r.especialidad_ref?.nombre ?? r.procedimiento ?? ''}</td>
                  <td className="p-2">{r.estado ?? '-'}</td>
                  <td className="p-2">{r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleString() : ''}</td>
                  <td className="p-2">
                    <Link to={`/admin/referrals/${r.id_referencia ?? r.folio ?? r.id}`} className="text-blue-600">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReferenciasRecibidas;