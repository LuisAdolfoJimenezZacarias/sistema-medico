import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tabs, Tab, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';
import { addToast } from '@heroui/react';
import ReferralDetailModal from '../../medicos/components/ReferralDetailModal'; // <-- agregado
import { useNavigate, useLocation } from 'react-router-dom'; // <-- ADD

interface Authorization {
  id: string;
  type: 'Procedure' | 'Referral' | 'Equipment' | 'Medication' | 'Other';
  requestedBy: string;
  department: string;
  patient?: string;
  description: string;
  justification: string;
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'More Info Needed';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  cost?: string;
  serviceRequested?: string; // <- agregado
  raw?: any;       // <-- referencia original (backend)
  rawId?: string | number;
}

export const DirectorAuthorizations: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [authorizations, setAuthorizations] = React.useState<Authorization[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState('pending');
  const [selectedAuth, setSelectedAuth] = React.useState<Authorization | null>(null);

  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // mapeo simple de referencia -> Authorization
  const mapToAuth = (r: any): Authorization => {
    const patientName = r.paciente ? `${r.paciente.nombre} ${r.paciente.apellido_paterno ?? ''} ${r.paciente.apellido_materno ?? ''}`.trim() : (r.nombre_paciente ?? '');
    return {
      id: String(r.folio ?? r.id_referencia ?? r.id ?? ''),
      type: 'Referral',
      requestedBy: r.medico_remitente ? `${r.medico_remitente.nombre} ${r.medico_remitente.apellido_paterno ?? ''}`.trim() : (r.medico_solicitante ?? 'Medico'),
      department: r.unidad_origen?.nombre ?? r.unidad_origen_nombre ?? '',
      patient: patientName || undefined,
      description: r.motivo_envio ?? r.resumen_clinico ?? '',
      justification: r.resumen_clinico ?? '',
      dateRequested: r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleString() : '',
      status: (() => {
        const s = String(r.estado ?? '').toLowerCase();
        if (s.includes('pend') || s.includes('envi')) return 'Pending';
        if (s.includes('acept')) return 'Approved';
        if (s.includes('rech')) return 'Denied';
        if (s.includes('comp')) return 'Approved';
        return 'Pending';
      })(),
      priority: (r.prioridad ? (String(r.prioridad).toLowerCase().includes('alta') ? 'High' : String(r.prioridad).toLowerCase().includes('baja') ? 'Low' : 'Medium') : 'Medium'),
      cost: r.costo ?? undefined,
      serviceRequested: r.especialidad_ref?.nombre ?? r.especialidad?.nombre ?? (typeof r.procedimiento === 'string' ? r.procedimiento : ''),
      raw: r,                    // guardar objeto original
      rawId: r.id_referencia ?? r.id ?? null
    };
  };

  React.useEffect(() => {
    let mounted = true;
    const fetchPending = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string,string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/referrals/director/pending`;
        const res = await fetch(url, { method: 'GET', headers });
        if (!mounted) return;
        if (!res.ok) {
          const txt = await res.text().catch(()=> '');
          console.warn('fetch director pending failed', res.status, txt.slice(0,200));
          setAuthorizations([]);
          return;
        }
        const data = await res.json().catch(() => []);
        const rows = Array.isArray(data) ? data : (data.rows ?? data);
        setAuthorizations(rows.map(mapToAuth));
      } catch (err) {
        console.error('fetchPending error', err);
        setAuthorizations([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPending();
    return () => { mounted = false; };
  }, [user]);
  
  // Filter authorizations based on search term and tab
  const filteredAuthorizations = authorizations.filter(auth => {
    const matchesSearch = 
      auth.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (auth.patient && auth.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      auth.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'pending') return matchesSearch && auth.status === 'Pending';
    if (selectedTab === 'approved') return matchesSearch && auth.status === 'Approved';
    if (selectedTab === 'denied') return matchesSearch && auth.status === 'Denied';
    if (selectedTab === 'info') return matchesSearch && auth.status === 'More Info Needed';
    
    return matchesSearch;
  });
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredAuthorizations.length / rowsPerPage);
  const paginatedAuthorizations = filteredAuthorizations.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handleViewDetails = (auth: Authorization) => {
    setSelectedAuth(auth);
    onOpen();
  };
  
  const handleApprove = (id: string) => {
    setAuthorizations(authorizations.map(auth => 
      auth.id === id 
        ? { ...auth, status: 'Approved' as const } 
        : auth
    ));
    
    if (selectedAuth?.id === id) {
      setSelectedAuth({ ...selectedAuth, status: 'Approved' as const });
    }
    
    addToast({
      title: "Authorization Approved",
      description: `Authorization ${id} has been approved successfully`,
      color: "success"
    });
  };
  
  const handleDeny = (id: string) => {
    setAuthorizations(authorizations.map(auth => 
      auth.id === id 
        ? { ...auth, status: 'Denied' as const } 
        : auth
    ));
    
    if (selectedAuth?.id === id) {
      setSelectedAuth({ ...selectedAuth, status: 'Denied' as const });
    }
    
    addToast({
      title: "Authorization Denied",
      description: `Authorization ${id} has been denied`,
      color: "danger"
    });
  };
  
  // abrir modal con la referencia completa (Request Info ahora muestra la referencia)
  const handleRequestInfo = (auth: Authorization) => {
    // abrir modal de detalle con el id real (rawId) si está disponible
    const realId = auth.rawId ?? auth.id;
    setDetailId(realId ? String(realId) : String(auth.id));
    setDetailOpen(true);
  };
  
  // NEW: navegar a edición (guarda sessionStorage fallback para evitar pérdida al hacer redirect)
  const handleEditReferral = (auth: Authorization) => {
    const referral = (auth as any).raw ?? auth;
    try {
      sessionStorage.setItem('editReferral', JSON.stringify({ edit: true, referral }));
    } catch (e) { /* noop */ }

    const token = localStorage.getItem('token');
    if (!token) {
      // si no logueado, ir a login y el sessionStorage preserva el objeto
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // navegar al formulario de nueva/editar referencia (ajusta ruta si tu app usa otra)
    navigate('/doctor/referrals/new', { state: { edit: true, referral } });
  };

  const getStatusColor = (status: Authorization['status']) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Denied': return 'danger';
      case 'Pending': return 'warning';
      case 'More Info Needed': return 'primary';
      default: return 'default';
    }
  };
  
  const getPriorityColor = (priority: Authorization['priority']) => {
    switch (priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Authorizations</h1>
          <p className="text-foreground-500">{user?.facility} • Unit Director</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:filter" />}>
            Filters
          </Button>
          <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
            Export
          </Button>
        </div>
      </div>
      
      <Tabs 
        aria-label="Authorization status tabs" 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab as any}
        className="mb-4"
      >
        <Tab key="pending" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clock" />
            <span>Pending</span>
          </div>
        } />
        <Tab key="approved" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check-circle" />
            <span>Approved</span>
          </div>
        } />
        <Tab key="denied" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:x-circle" />
            <span>Denied</span>
          </div>
        } />
        <Tab key="info" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:help-circle" />
            <span>Need Info</span>
          </div>
        } />
        <Tab key="all" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:list" />
            <span>All</span>
          </div>
        } />
      </Tabs>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-default-200">
          <CardBody>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Input
                placeholder="Search authorizations..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="w-full sm:max-w-xs"
              />
              
              <div className="flex gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      Type
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Authorization type filter">
                    <DropdownItem key="all">All Types</DropdownItem>
                    <DropdownItem key="procedure">Procedures</DropdownItem>
                    <DropdownItem key="referral">Referrals</DropdownItem>
                    <DropdownItem key="equipment">Equipment</DropdownItem>
                    <DropdownItem key="medication">Medications</DropdownItem>
                    <DropdownItem key="other">Other</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      Priority
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Priority filter">
                    <DropdownItem key="all">All Priorities</DropdownItem>
                    <DropdownItem key="urgent">Urgent</DropdownItem>
                    <DropdownItem key="high">High</DropdownItem>
                    <DropdownItem key="medium">Medium</DropdownItem>
                    <DropdownItem key="low">Low</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            
            <table className="w-full min-w-full">
              <thead>
                <tr className="text-left text-foreground-500 text-small border-b border-divider">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">TYPE</th>
                  <th className="pb-2 font-medium">DESCRIPTION</th>
                  <th className="pb-2 font-medium">REQUESTED BY</th>
                  <th className="pb-2 font-medium">DATE</th>
                  <th className="pb-2 font-medium">PRIORITY</th>
                  <th className="pb-2 font-medium">STATUS</th>
                  <th className="pb-2 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      Loading authorizations...
                    </td>
                  </tr>
                ) : paginatedAuthorizations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      No authorizations found
                    </td>
                  </tr>
                ) : (
                  paginatedAuthorizations.map((auth) => (
                    <tr key={auth.id} className="border-b border-divider last:border-b-0">
                      <td className="py-3 text-small">{auth.id}</td>
                      <td className="py-3 text-small">{auth.type}</td>
                      <td className="py-3 text-small max-w-[200px] truncate">{auth.description}</td>
                      <td className="py-3 text-small">
                        <div>
                          <div>{auth.requestedBy}</div>
                          <div className="text-tiny text-foreground-500">{auth.department}</div>
                        </div>
                      </td>
                      <td className="py-3 text-small">{auth.dateRequested}</td>
                      <td className="py-3 text-small">
                        <Chip 
                          size="sm" 
                          color={getPriorityColor(auth.priority)}
                          variant="flat"
                        >
                          {auth.priority}
                        </Chip>
                      </td>
                      <td className="py-3 text-small">
                        <Chip 
                          size="sm" 
                          color={getStatusColor(auth.status)}
                          variant="flat"
                        >
                          {auth.status}
                        </Chip>
                      </td>
                      <td className="py-3 text-small">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="flat" 
                            onPress={() => handleViewDetails(auth)}
                          >
                            Details
                          </Button>
                          {auth.status === 'Pending' && (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button size="sm" variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                                  Action
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Actions">
                                <DropdownItem 
                                  key="approve" 
                                  description="Approve this authorization"
                                  onPress={() => handleApprove(auth.id)}
                                >
                                  <div className="flex items-center gap-2 text-success">
                                    <Icon icon="lucide:check" />
                                    <span>Approve</span>
                                  </div>
                                </DropdownItem>

                                <DropdownItem 
                                  key="edit"
                                  description="Editar referencia"
                                  onPress={() => handleEditReferral(auth)}
                                >
                                  <div className="flex items-center gap-2 text-primary">
                                    <Icon icon="lucide:edit-2" />
                                    <span>Edit</span>
                                  </div>
                                </DropdownItem>

                                <DropdownItem 
                                  key="deny" 
                                  description="Deny this authorization"
                                  onPress={() => handleDeny(auth.id)}
                                >
                                  <div className="flex items-center gap-2 text-danger">
                                    <Icon icon="lucide:x" />
                                    <span>Deny</span>
                                  </div>
                                </DropdownItem>
                                <DropdownItem 
                                  key="info" 
                                  description="Ver referencia completa"
                                  onPress={() => handleRequestInfo(auth)}
                                >
                                  <div className="flex items-center gap-2 text-primary">
                                    <Icon icon="lucide:help-circle" />
                                    <span>Request Info</span>
                                  </div>
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {pages > 1 && (
              <div className="flex w-full justify-center mt-4">
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
            )}
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Authorization Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => selectedAuth && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Authorization Details</span>
                  <Chip 
                    size="sm" 
                    color={getStatusColor(selectedAuth.status)}
                    variant="flat"
                  >
                    {selectedAuth.status}
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-small text-foreground-500">Authorization ID</p>
                      <p className="font-medium">{selectedAuth.id}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Type</p>
                      <p className="font-medium">{selectedAuth.type}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Requested By</p>
                      <p className="font-medium">{selectedAuth.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Department</p>
                      <p className="font-medium">{selectedAuth.department}</p>
                    </div>
                    {selectedAuth.patient && (
                      <div>
                        <p className="text-small text-foreground-500">Patient</p>
                        <p className="font-medium">{selectedAuth.patient}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-small text-foreground-500">Date Requested</p>
                      <p className="font-medium">{selectedAuth.dateRequested}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Priority</p>
                      <Chip 
                        size="sm" 
                        color={getPriorityColor(selectedAuth.priority)}
                        variant="flat"
                      >
                        {selectedAuth.priority}
                      </Chip>
                    </div>
                    {selectedAuth.cost && (
                      <div>
                        <p className="text-small text-foreground-500">Estimated Cost</p>
                        <p className="font-medium">{selectedAuth.cost}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-small text-foreground-500">Servicio solicitado</p>
                      <p className="font-medium">{selectedAuth?.serviceRequested ?? '—'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-divider pt-4">
                    <p className="text-small text-foreground-500">Description</p>
                    <p className="mt-1">{selectedAuth.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-small text-foreground-500">Justification</p>
                    <p className="mt-1">{selectedAuth.justification}</p>
                  </div>
                  
                  {selectedAuth.status === 'Pending' && (
                    <div className="border-t border-divider pt-4">
                      <p className="font-medium mb-2">Decision</p>
                      <Input
                        label="Comments"
                        placeholder="Add comments about your decision..."
                        className="mb-4"
                      />
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                {selectedAuth.status === 'Pending' ? (
                  <>
                    <Button 
                      color="danger" 
                      variant="flat" 
                      onPress={() => {
                        handleDeny(selectedAuth.id);
                        onClose();
                      }}
                    >
                      Deny
                    </Button>
                    <Button 
                      color="primary" 
                      variant="flat" 
                      onPress={() => {
                        if (selectedAuth) handleRequestInfo(selectedAuth);
                        onClose();
                      }}
                    >
                      Request Info
                    </Button>
                    <Button 
                      color="success" 
                      onPress={() => {
                        handleApprove(selectedAuth.id);
                        onClose();
                      }}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Modal reutilizado para mostrar la referencia completa */}
      <ReferralDetailModal
        referralId={detailId}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailId(null);
          // Si el modal de Authorization no está abierto, reabrirlo
          if (!isOpen) onOpen();
        }}
      />
    </div>
  );
};