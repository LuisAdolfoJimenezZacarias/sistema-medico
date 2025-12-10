import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Card, CardBody, Tabs, Tab, Chip, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';
import { resolveAdminUnit } from '../../../utils/resolveAdminUnit';
import ReferralDetailModal from '../../medicos/components/ReferralDetailModal'; // <-- agregado

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export interface Referral {
  id: string;
  rawId?: number | string;
  paciente?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  specialty?: string;
  prioridad?: string;
  status?: string;
  fecha?: string;
  no_folio?: string;
  domicilio?: string; // <-- nuevo campo
  destino?: string; // <-- nuevo campo
  _raw?: any;
}

// Mapper copiado / adaptado de ReferenciasEmitidas
const mapReferral = (r: any): Referral => ({
  rawId: r.id_referencia ?? r.id ?? null,
  _raw: r,
  id: r.folio ?? String(r.id_referencia ?? r.id ?? (r.referralId ?? '')),
  no_folio: r.no_folio ?? r.folio ?? r.no_solicitud ?? '',
  // preferir 'paciente' (alias usado en models) y fallback a 'paciente_ref'
  paciente: (r.paciente ?? r.paciente_ref)
    ? [
        (r.paciente ?? r.paciente_ref).nombre,
        (r.paciente ?? r.paciente_ref).apellido_paterno,
        (r.paciente ?? r.paciente_ref).apellido_materno
      ].filter(Boolean).join(' ')
    : (r.nombre_paciente ?? r.patientName ?? r.nombre ?? ''),
  apellido_paterno: (r.paciente ?? r.paciente_ref)?.apellido_paterno ?? r.apellido_paterno ?? r.app_paterno ?? '',
  apellido_materno: (r.paciente ?? r.paciente_ref)?.apellido_materno ?? r.apellido_materno ?? r.app_materno ?? '',
  specialty: r.especialidad_ref?.nombre ?? r.especialidad?.nombre ?? r.servicio ?? r.specialty ?? '',
  prioridad: r.prioridad ?? r.prioridad_solicitud ?? r.prioridad ?? '',
  status: r.estado ?? r.status ?? r.estado_solicitud ?? '',
  fecha: r.fecha_solicitud ?? r.createdAt ?? r.created_at ?? r.fecha ?? '',
  domicilio: r.domicilio ?? r.paciente?.domicilio ?? r.patient?.address ?? r.direccion ?? '', // <-- mapeo de domicilio
  destino: r.unidad_destino_nombre ?? r.destino ?? '', // <-- mapeo de destino
  curp: (r.paciente ?? r.paciente_ref)?.curp ??  r.curp ?? r.patient?.curp ?? '', // <-- mapeo de curp
});

export const GestionDocumentos: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  const [items, setItems] = React.useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedTab, setSelectedTab] = React.useState('all');

  // Actions state (detalle / edición / responder)
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchReferralsForUnit = async () => {
      setIsLoading(true);
      setLoadError(null);

      const { unidadId, unidadName } = resolveAdminUnit(user);
      if (!unidadId && !unidadName) {
        setItems([]);
        setIsLoading(false);
        setLoadError('No se pudo determinar la unidad del administrador.');
        return;
      }

      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (unidadId) params.set('id_unidad_origen', unidadId);
      else params.set('unidad_origen', unidadName!);

      // FILTRO: solo las referencias enviadas al director (ajusta la key según tu backend)
      // Opción A: si backend filtra por estado
      params.set('estado', 'Enviada');
      // Opción B (si tu API soporta flag): params.set('sent_to_director', '1');

      try {
        const res = await fetch(`${API_BASE}/referrals?${params.toString()}`, {
          method: 'GET',
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal
        });

        if (!mounted) return;

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text ? `Server error ${res.status}: ${text}` : `HTTP ${res.status}`);
        }

        const json = await res.json().catch(() => []);
        const arr = Array.isArray(json) ? json : (json.rows ?? json.data ?? []);

        const mapped = arr.map(mapReferral);

        setItems(mapped);
        setLoadError(mapped.length ? null : 'No se encontraron referencias para la unidad del administrador.');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setLoadError(err.message ?? 'Error cargando referencias');
          setItems([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // llamada inicial
    fetchReferralsForUnit();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user]);

  const rowsPerPage = 8;

  const filtered = React.useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    let base = items;

    // aplicar filtro por estado según pestaña
    if (selectedTab !== 'all') {
      base = base.filter(i => {
        const s = (i.status ?? '').toString().toLowerCase();
        if (selectedTab === 'pending') return s.includes('pend') || s.includes('env'); // <-- aceptar 'enviada' como pendiente/en proceso
        if (selectedTab === 'accepted') return s.includes('acept') || s.includes('accept');
        if (selectedTab === 'completed') return s.includes('comp');
        if (selectedTab === 'rejected') return s.includes('rech') || s.includes('reject');
        return true;
      });
    }

    if (!q) return base;

    const isNumeric = /^\d+$/.test(q);
    if (isNumeric) {
      const exact = base.filter (i => String(i.no_folio ?? i.id).toLowerCase() === q);
      if (exact.length) return exact;
    }

    return base.filter(i => {
      return (
        (i.paciente ?? '').toLowerCase().includes(q) ||
        (i.apellidoPaterno ?? '').toLowerCase().includes(q) ||
        (i.apellidoMaterno ?? '').toLowerCase().includes(q) ||
        (i.no_folio ?? '').toLowerCase().includes(q) ||
        (i.id ?? '').toLowerCase().includes(q)
      );
    });
  }, [items, searchTerm, selectedTab]);

  const pages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // función para enviar referencia al director
  const sendToDirector = async (refId: string | number) => {
    if (!window.confirm('Enviar esta referencia al director de la unidad para autorización?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/referrals/${refId}/send-to-director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Server ${res.status}`);
      }

      // intentar leer respuesta: backend normalmente devuelve { message, referral }
      const json = await res.json().catch(() => null);
      const newEstado = (json?.referral?.estado ?? json?.estado) ?? 'Enviada';

      addToast({ title: 'Enviado', description: 'Referencia enviada al director', color: 'success' });

      // actualizar el item en lugar de quitarlo para que la tabla muestre el nuevo estado
      setItems(prev => prev.map(i => {
        if (String(i.rawId ?? i.id) !== String(refId)) return i;
        return {
          ...i,
          status: newEstado,
          _raw: { ...(i._raw ?? {}), estado: newEstado }
        };
      }));
    } catch (err: any) {
      addToast({ title: 'Error', description: err?.message ?? 'Error enviando referencia', color: 'danger' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Referencias Emitidas</h1>
        <div className="flex gap-2">
          <Button color="primary" onPress={() => navigate('/administrativo/referral/nueva')} startContent={<Icon icon="lucide:plus" />}>
            New
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="border border-default-200">
              <CardBody>
                 <Tabs aria-label="Referral status tabs" selectedKey={selectedTab} onSelectionChange={setSelectedTab as any} className="mb-4">
                   <Tab key="all" title="Todas las Referencias" />
                   <Tab key="pending" title="Pendientes" />
                   <Tab key="accepted" title="Aceptadas" />
                   <Tab key="completed" title="Completadas" />
                   <Tab key="rejected" title="Rechazadas" />
                 </Tabs>

                 <div className="mb-4">
                   <Input
                     placeholder="Buscar por paciente, folio o ID..."
                     value={searchTerm}
                     onValueChange={setSearchTerm}
                     startContent={<Icon icon="lucide:search" className="text-default-400" />}
                     className="w-full sm:max-w-xs"
                   />
                 </div>

                 <Table
                   aria-label="Referrals table"
                   removeWrapper
                   bottomContent={
                     <div className="flex w-full justify-center">
                       <Pagination isCompact showControls showShadow color="primary" page={page} total={pages} onChange={setPage} />
                     </div>
                   }
                 >
                   <TableHeader>
                     <TableColumn>NO.SOLICITUD / FOLIO</TableColumn>
                     <TableColumn>PACIENTE</TableColumn>
                     <TableColumn>SPECIALTY</TableColumn>
                     <TableColumn>PRIORIDAD</TableColumn>
                     <TableColumn>STATUS</TableColumn>
                     <TableColumn>FECHA</TableColumn>
                     <TableColumn>ACCIONES</TableColumn>
                   </TableHeader>

                   <TableBody
                     isLoading={isLoading}
                     loadingContent={<div className="py-8">Cargando referencias...</div>}
                     emptyContent={<div className="py-8">{loadError ? loadError : 'No se encontraron referencias'}</div>}
                   >
                     {paginated.map((r) => (
                       <TableRow key={r.id}>
                         <TableCell>{r.no_folio || r.id}</TableCell>
                         <TableCell>
                           <div>
                             <div className="font-medium">{[r.paciente, r.apellido_paterno, r.apellidoMaterno].filter(Boolean).join(' ')}</div>
                           </div>
                         </TableCell>
                         <TableCell>{r.specialty}</TableCell>
                         <TableCell>
                           <Chip size="sm" color={String(r.prioridad ?? '').toLowerCase().includes('alta') ? 'danger' : String(r.prioridad ?? '').toLowerCase().includes('baja') ? 'success' : 'warning'} variant="flat">
                             {r.prioridad}
                           </Chip>
                         </TableCell>
                         <TableCell>
                           <Chip size="sm" color={String(r.status ?? '').toLowerCase().includes('pend') ? 'warning' : String(r.status ?? '').toLowerCase().includes('acept') ? 'primary' : String(r.status ?? '').toLowerCase().includes('comp') ? 'success' : 'danger'} variant="flat">
                             {r.status}
                           </Chip>
                         </TableCell>
                         <TableCell>{r.fecha ? new Date(r.fecha).toLocaleString() : '-'}</TableCell>
                         <TableCell>
                           <div className="flex gap-2">
                             <Button isIconOnly size="sm" variant="light" onPress={() => {
                               const realId = (r as any).rawId ?? r.id;
                               setDetailId(String(realId));
                               setDetailOpen(true);
                             }}>
                               <Icon icon="lucide:eye" className="text-default-500" />
                             </Button>
                             <Button isIconOnly size="sm" variant="light" onPress={() => {
                               // usar la misma navegación que el listado del médico para evitar diferencias de ruta
                               navigate('/doctor/referrals/NuevaReferencia', { state: { edit: true, referral: (r as any)._raw ?? r } });
                             }}>
                               <Icon icon="lucide:edit" className="text-default-500" />
                             </Button>
                             <Button isIconOnly size="sm" variant="light" onPress={() => {
                               // enviar directamente al director de la unidad
                               const realId = (r as any).rawId ?? r.id;
                               sendToDirector(realId);
                             }}>
                               <Icon icon="lucide:reply" className="text-primary" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
              </CardBody>
            </Card>
          </div>
        </div>
      </motion.div>

       {/* Modal de detalle (reusar componente del médico) */}
       <ReferralDetailModal
         referralId={detailId}
         isOpen={detailOpen}
         onClose={() => { setDetailOpen(false); setDetailId(null); }}
       />
     </div>
   );
 };