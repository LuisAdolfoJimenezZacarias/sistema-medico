import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/auth-context";
import ReferralDetailModal from '../components/ReferralDetailModal';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  specialty: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
  referringDoctor?: string;
  referringFacility?: string;
  referredDoctor?: string;
  referredFacility?: string;
  dateCreated?: string;
  dateCompleted?: string;
  notes?: string;
}

// simple mapper (ajusta según shape real del backend)
const mapReferral = (r: any): Referral & { rawId?: number | string; _raw?: any } => ({
  // rawId es el id numérico real de la referencia en la BD
  rawId: r.id_referencia ?? r.id ?? null,
  _raw: r, // <-- conservar objeto original para edición/navegación
  id: r.folio ?? String(r.id_referencia ?? r.id ?? (r.referralId ?? '')),
  patientId: String(r.id_paciente ?? r.paciente?.id_paciente ?? r.patientId ?? r.patient_id ?? ''),
  patientName: r.paciente_ref
    ? [r.paciente_ref.nombre, r.paciente_ref.apellido_paterno, r.paciente_ref.apellido_materno].filter(Boolean).join(' ')
    : (r.nombre_paciente ?? r.patientName ?? ''),

  // usar el include que devuelve el backend (especialidad_ref)
  specialty: r.especialidad_ref?.nombre ?? r.especialidad?.nombre ?? r.servicio ?? r.specialty ?? '',
  reason: r.motivo_envio ?? r.reason ?? r.resumen_clinico ?? '',
  priority: (r.prioridad ? (String(r.prioridad).toLowerCase().includes('alta') ? 'High' : String(r.prioridad).toLowerCase().includes('baja') ? 'Low' : 'Medium') : 'Medium') as 'High'|'Medium'|'Low',
  status: (r.estado ? (String(r.estado).toLowerCase().includes('pend') ? 'Pending' : String(r.estado).toLowerCase().includes('acept') ? 'Accepted' : String(r.estado).toLowerCase().includes('comp') ? 'Completed' : 'Rejected') : 'Pending') as any,
  referringDoctor: r.medico_solicitante ?? r.referringDoctor ?? '',
  referringFacility: r.unidad_origen_nombre ?? r.referringFacility ?? '',
  referredDoctor: String(r.id_medico_destino ?? r.referredDoctor ?? ''),
  referredFacility: r.unidad_destino_nombre ?? r.referredFacility ?? '',
  dateCreated: r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleString() : (r.dateCreated ?? ''),
  dateCompleted: r.fecha_completado ?? r.dateCompleted ?? '',
  notes: r.resumen_clinico ?? r.notes ?? ''
});

export const ReferenciasEmitidas: React.FC = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState('all');
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<Referral>>({
    patientId: '',
    patientName: '',
    specialty: '',
    reason: '',
    priority: 'Medium',
    referringDoctor: 'Dr. Jane Smith',
    referringFacility: 'Community Health Center',
    referredFacility: '',
    notes: ''
  });
  
  // Detail modal state
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  
  // obtener usuario desde el context; Login usa useAuth() y guarda 'user' en localStorage via authService.saveAuth
  const { user } = useAuth();
  
  // helper para determinar si la referencia fue emitida por el medicoId
  const referralIsFromDoctor = (r: any, medicoId: any) => {
    if (!medicoId) return false;
    const candidates = [
      r.medico_solicitante,
      r.id_medico_remitente,
      r.id_medico_solicitante,
      r.id_medico,
      r.medico_id,
      r.medico?.id,
      r.medicoSolicitanteId,
      r.solicitante_id
    ];
    return candidates.some(v => v !== undefined && v !== null && String(v) === String(medicoId));
  };

  React.useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        // Preferir token del context si existe, fallback a localStorage 'auth_token'
        const ctxToken = (window as any).__AUTH_TOKEN__ || null; // opcional: global debug
        const tokenFromContext = (user && (user.token || user.auth_token || user?.tokenString)) ?? null;
        const token = tokenFromContext || localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('token');

        const rawBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000';
        const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api$/i, '');
        const url = `${API_BASE}/api/referrals/doctor/me`;
        const headers: Record<string,string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        console.log('[ReferenciasEmitidas] fetching doctor referrals', { url, hasToken: Boolean(token) });

        const res = await fetch(url, { method: 'GET', headers });

        // NO HACER FALLBACK a /api/referrals: si no está autorizado o hay error, mostrar vacío y avisar
        if (!res.ok) {
          const txt = await res.text().catch(()=> '');
          console.warn('[ReferenciasEmitidas] doctor/me failed', res.status, txt.slice(0,200));
          // mostrar vacío (no mostrar referencias de otros)
          setReferrals([]);
          return;
        }

        const data = await res.json().catch(() => []);
        const rows = Array.isArray(data) ? data : (data.rows ?? data);
        setReferrals(rows.map(mapReferral));
      } catch (err) {
        console.error("ReferenciasEmitidas fetch error:", err);
        setReferrals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [user]);

  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  //bloque de alalerta de agragar paciente
  const handleAddReferral = () => {
    // Validate form
    if (!formData.patientName || !formData.specialty || !formData.reason || !formData.referredFacility) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }
    
    // Generate ID
    const newId = `REF-2023-${String(referrals.length + 1).padStart(3, '0')}`;
    
    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Add new referral
    const newReferral: Referral = {
      id: newId,
      patientId: formData.patientId || 'P000',
      patientName: formData.patientName || '',
      specialty: formData.specialty || '',
      reason: formData.reason || '',
      priority: formData.priority as 'High' | 'Medium' | 'Low' || 'Medium',
      status: 'Pending',
      referringDoctor: formData.referringDoctor || '',
      referringFacility: formData.referringFacility || '',
      referredFacility: formData.referredFacility || '',
      dateCreated: currentDate,
      notes: formData.notes
    };
    
    setReferrals([newReferral, ...referrals]);
    
    // Reset form
    setFormData({
      patientId: '',
      patientName: '',
      specialty: '',
      reason: '',
      priority: 'Medium',
      referringDoctor: 'Dr. Jane Smith',
      referringFacility: 'Community Health Center',
      referredFacility: '',
      notes: ''
    });
    
    addToast({
      title: "Referral Created",
      description: `Referral for ${newReferral.patientName} has been created successfully`,
      color: "success"
    });
    
    onOpenChange(false);
  };
  
  // Filter referrals based on search term and tab
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = 
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'pending') return matchesSearch && referral.status === 'Pending';
    if (selectedTab === 'accepted') return matchesSearch && referral.status === 'Accepted';
    if (selectedTab === 'completed') return matchesSearch && referral.status === 'Completed';
    if (selectedTab === 'rejected') return matchesSearch && referral.status === 'Rejected';
    
    return matchesSearch;
  });
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredReferrals.length / rowsPerPage);
  const paginatedReferrals = filteredReferrals.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
        <Button color="primary" onPress={() => navigate('/doctor/referrals/NuevaReferencia')} startContent={<Icon icon="lucide:plus" />}>
          New Referral
        </Button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-default-200">
          <CardBody>
            <Tabs 
              aria-label="Referral status tabs" 
              selectedKey={selectedTab} 
              onSelectionChange={setSelectedTab as any}
              className="mb-4"
            >
              <Tab key="all" title="Todas las Referencias" />
              <Tab key="pending" title="Pendientes" />
              <Tab key="accepted" title="Aceptadas" />
              <Tab key="completed" title="Completadas" />
              <Tab key="rejected" title="Rechazadas" />
            </Tabs>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Input
                placeholder="Buscar por nombre del paciente o ID..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="w-full sm:max-w-xs"
              />
              
              <div className="flex gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      Filter
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Filter options">
                    <DropdownItem key="all">All Priorities</DropdownItem>
                    <DropdownItem key="high">High Priority</DropdownItem>
                    <DropdownItem key="medium">Medium Priority</DropdownItem>
                    <DropdownItem key="low">Low Priority</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
                  Export
                </Button>
              </div>
            </div>
            
            <Table 
              aria-label="Referrals table"
              removeWrapper
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>NO.SOLICITUD/FOLIO</TableColumn>
                <TableColumn>PACIENTE</TableColumn>
                <TableColumn>SPECIALTY</TableColumn>
                <TableColumn>PRIORIDAD</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>FECHA</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading referrals...</div>}
                emptyContent={<div className="py-8">No referrals found</div>}
              >
                {paginatedReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.id}</TableCell>
                    <TableCell>{referral.patientName}</TableCell>
                    <TableCell>{referral.specialty}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={referral.priority === 'High' ? 'danger' : referral.priority === 'Medium' ? 'warning' : 'success'}
                        variant="flat"
                      >
                        {referral.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={
                          referral.status === 'Pending' ? 'warning' : 
                          referral.status === 'Accepted' ? 'primary' : 
                          referral.status === 'Completed' ? 'success' : 
                          'danger'
                        }
                        variant="flat"
                      >
                        {referral.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{referral.dateCreated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light" onPress={() => { 
                              const realId = (referral as any).rawId ?? referral.id; 
                              setDetailId(String(realId)); 
                              setDetailOpen(true); 
                             }}>
                          <Icon icon="lucide:eye" className="text-default-500" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => {
                            // navegar al formulario de nueva referencia en modo edición,
                            // pasando la referencia original en location.state
                            navigate('/doctor/referrals/NuevaReferencia', { state: { edit: true, referral: (referral as any)._raw ?? referral } });
                          }}
                        >
                          <Icon icon="lucide:edit" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
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
      </motion.div>
      
      <ReferralDetailModal
        referralId={detailId}
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailId(null); }}
      />
    </div>
  );
};

// Helper component to avoid TypeScript errors
const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div className={`bg-content1 rounded-medium shadow-sm ${className || ''}`}>
      {children}
    </div>
  );
};

const CardBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div className={`p-4 ${className || ''}`}>
      {children}
    </div>
  );
};