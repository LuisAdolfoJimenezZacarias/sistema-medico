import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context'; // <<-- agregado


const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'; // <<-- agregado

interface Patient {
  id: string;
  name: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  age: number;
  gender: string;
  idNumber: string;
  curp?: string;
  phone: string;
  address: string;
  insuranceProvider: string;
  insuranceNumber: string;
  createdBy?: string | number;
  unidadId?: string | number;
  createdAt?: string;
}

export const GestionPacientes: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate(); 
  const { user } = useAuth() as any;

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  
  // Form state (status eliminado)
  const [formData, setFormData] = React.useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: '',
    idNumber: '',
    phone: '',
    address: '',
    insuranceProvider: '',
    insuranceNumber: ''
  });
  
  // helper -> calcula edad desde YYYY-MM-DD
  const computeAgeFromDob = (dob?: string | null) => {
    if (!dob) return 0;
    try {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return 0;
      const diff = Date.now() - d.getTime();
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      return years;
    } catch {
      return 0;
    }
  };

  // Reemplazamos el mock por fetch desde API filtrando por creador y unidad del médico
  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPatientsOnce = async (params: URLSearchParams) => {
      const url = `${API_BASE}/patients?${params.toString()}`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });
      return res;
    };

    const fetchPatients = async () => {
      setIsLoading(true);
      setLoadError(null);

      // intentar derivar userId y unidad raw desde varias propiedades posibles
      const userId = user?.id_usuario ?? user?.id ?? user?.userId ?? null;
      const rawUnidad = user?.unidadId ?? user?.id_unidad ?? user?.facilityId ?? user?.unidad ?? user?.facility ?? null;

      // si rawUnidad es un número válido, lo usamos como unidadId; si no, enviamos unidadName
      const unidadIdNumeric = rawUnidad != null && !Number.isNaN(Number(rawUnidad)) ? String(Number(rawUnidad)) : null;
      const unidadName = !unidadIdNumeric && rawUnidad ? String(rawUnidad) : null;

      const params = new URLSearchParams();
      if (userId) params.set('createdBy', String(userId));
      if (unidadIdNumeric) params.set('unidadId', unidadIdNumeric);
      else if (unidadName) params.set('unidadName', unidadName);

      // Si no hay filtros, evitar devolver TODO: forzar al menos unidad o creador
      if (!userId && !unidadIdNumeric && !unidadName) {
        setPatients([]);
        setIsLoading(false);
        setLoadError('No se pudo determinar el usuario o la unidad para filtrar pacientes.');
        return;
      }

      try {
        let res = await fetchPatientsOnce(params);

        // Si el servidor devuelve 500 (posible problema con includes/alias), intentar fallback:
        if (res.status === 500) {
          // Intentar sin createdBy (solo por unidad si existe)
          const fallbackParams = new URLSearchParams();
          if (unidadIdNumeric) fallbackParams.set('unidadId', unidadIdNumeric);
          else if (unidadName) fallbackParams.set('unidadName', unidadName);
          // si no hay unidad en fallback, quitamos todos los filtros (ultima opción)
          try {
            res = await fetchPatientsOnce(fallbackParams);
          } catch (err) {
            throw err;
          }
        }

        if (!mounted) return;

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text ? `Server error ${res.status}: ${text}` : `HTTP ${res.status}`);
        }

        const json = await res.json().catch(() => []);
        const arr = Array.isArray(json) ? json : [];

        // Intentar mapear estructura a nuestro tipo Patient (suavizado)
        const mapped: Patient[] = arr.map((p: any) => {
          const dob = p.fecha_nacimiento ?? p.fechaNacimiento ?? p.dob ?? p.birthDate ?? null;
          const computedAge = p.edad ?? p.age ?? computeAgeFromDob(dob);
          return {
            id: p.id_paciente ?? p.id ?? p.patientId ?? p.idPaciente ?? String(Math.random()).slice(2),
            name: p.nombre ?? p.name ?? p.fullName ?? p.nombre_completo ?? '',
            apellido_paterno: p.app_paterno ?? p.apellido_paterno ?? p.apellido_paterno ?? p.lastName ?? '',
            apellido_materno: p.app_materno ?? p.apellido_materno ?? p.apellido_materno ?? p.secondLastName ?? '',
            age: typeof computedAge === 'number' ? computedAge : parseInt(String(computedAge)) || 0,
            gender: p.genero ?? p.sexo ?? p.gender ?? p.sex ?? '',
            idNumber: p.curp ?? p.idNumber ?? p.documento ?? p.documentNumber ?? '',
            curp: p.curp ?? p.curp_paciente ?? '',
            phone: p.telefono ?? p.phone ?? '',
            address: p.domicilio ?? p.address ?? '',
            insuranceProvider: p.aseguradora ?? p.insuranceProvider ?? '',
            insuranceNumber: p.no_seguro ?? p.insuranceNumber ?? '',
            status: p.estado ?? p.status ?? (p.active ? 'Active' : 'Inactive'),
            createdBy: p.createdBy ?? p.id_medico_creador ?? p.created_by ?? null,
            unidadId: p.id_unidad ?? p.unidadId ?? p.unitId ?? null,
            createdAt: p.createdAt ?? p.created_at ?? null
          };
        });

        setPatients(mapped);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setLoadError(err.message ?? 'Error cargando pacientes');
          setPatients([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPatients();

    return () => {
      mounted = false;
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleAddPatient = () => {
    if (!formData.name || !formData.idNumber) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }
    
    const newId = `P${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient: Patient = {
      id: newId,
      name: formData.name || '',
      age: formData.age || 0,
      gender: formData.gender || '',
      idNumber: formData.idNumber || '',
      phone: formData.phone || '',
      address: formData.address || '',
      insuranceProvider: formData.insuranceProvider || '',
      insuranceNumber: formData.insuranceNumber || '',
      createdBy: user?.id_usuario ?? user?.id ?? null,
      unidadId: user?.unidadId ?? user?.id_unidad ?? user?.facility ?? null,
      createdAt: new Date().toISOString()
    };
    
    setPatients([newPatient, ...patients]);
    
    setFormData({
      name: '',
      age: 0,
      gender: '',
      idNumber: '',
      phone: '',
      address: '',
      insuranceProvider: '',
      insuranceNumber: ''
    });
    
    addToast({
      title: "Patient Added",
      description: `${newPatient.name} has been added successfully`,
      color: "success"
    });
    
    onOpenChange(false);
  };
  
  // Filter patients based on search term
  const filteredPatients = React.useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    if (!q) return patients;

    const isNumeric = /^\d+$/.test(q);
    if (isNumeric) {
      const exact = patients.filter(p => String(p.id) === q);
      if (exact.length > 0) return exact;
    }

    return patients.filter(p => {
      const name = (p.name ?? '').toString().toLowerCase();
      const apellidoP = (p.apellido_paterno ?? '').toString().toLowerCase();
      const apellidoM = (p.apellido_materno ?? '').toString().toLowerCase();
      const idNumber = (p.idNumber ?? '').toString().toLowerCase();
      const curp = (p.curp ?? '').toString().toLowerCase();
      const idStr = String(p.id).toLowerCase();
      return (
        name.includes(q) ||
        apellidoP.includes(q) ||
        apellidoM.includes(q) ||
        idNumber.includes(q) ||
        curp.includes(q) ||
        idStr.includes(q)
      );
    });
  }, [patients, searchTerm]);
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredPatients.length / rowsPerPage);
  const paginatedPatients = filteredPatients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        <Button color="primary" onPress={() => navigate('/doctor/referrals/NuevoPaciente')} startContent={<Icon icon="lucide:plus" />}>
          Add Patient
        </Button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-default-200">
          <CardBody>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="w-full sm:max-w-xs"
              />
            </div>
            
            <Table 
              aria-label="Patients table"
              removeWrapper
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={Math.max(1, Math.ceil(patients.length / 5))}
                    onChange={setPage}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>AP PATERNO</TableColumn>
                <TableColumn>AP MATERNO</TableColumn>
                <TableColumn>AGE</TableColumn>
                <TableColumn>GENDER</TableColumn>
                <TableColumn>ID NUMBER</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading patients...</div>}
                emptyContent={<div className="py-8">{loadError ? loadError : 'No patients found'}</div>}
              >
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.apellido_paterno || '-'}</TableCell>
                    <TableCell>{patient.apellido_materno || '-'}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.idNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Add Patient Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add New Patient</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter patient's full name"
                    value={formData.name}
                    onValueChange={(value) => handleInputChange('name', value)}
                    isRequired
                  />
                  <Input
                    label="Age"
                    placeholder="Enter age"
                    type="number"
                    value={formData.age?.toString() || ''}
                    onValueChange={(value) => handleInputChange('age', parseInt(value) || 0)}
                  />
                  <Input
                    label="Gender"
                    placeholder="Enter gender"
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  />
                  <Input
                    label="ID Number"
                    placeholder="Enter national ID number"
                    value={formData.idNumber}
                    onValueChange={(value) => handleInputChange('idNumber', value)}
                    isRequired
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onValueChange={(value) => handleInputChange('phone', value)}
                  />
                  <Input
                    label="Address"
                    placeholder="Enter address"
                    value={formData.address}
                    onValueChange={(value) => handleInputChange('address', value)}
                  />
                  <Input
                    label="Insurance Provider"
                    placeholder="Enter insurance provider"
                    value={formData.insuranceProvider}
                    onValueChange={(value) => handleInputChange('insuranceProvider', value)}
                  />
                  <Input
                    label="Insurance Number"
                    placeholder="Enter insurance number"
                    value={formData.insuranceNumber}
                    onValueChange={(value) => handleInputChange('insuranceNumber', value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddPatient}>
                  Add Patient
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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