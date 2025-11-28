import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

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

export const ReferenciasEmitidas: React.FC = () => {
 /* const { isOpen, onOpen, onOpenChange } = useDisclosure();*/
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
  
  // Mock referral data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockReferrals: Referral[] = [
        { id: 'REF-2023-001', patientId: 'P001', patientName: 'Maria Garcia', specialty: 'Cardiology', reason: 'Chest pain, abnormal ECG', priority: 'High', status: 'Pending', referringDoctor: 'Dr. Jane Smith', referringFacility: 'Community Health Center', referredFacility: 'Central Hospital', dateCreated: '2023-09-15' },
        { id: 'REF-2023-002', patientId: 'P002', patientName: 'John Smith', specialty: 'Neurology', reason: 'Recurring headaches, dizziness', priority: 'Medium', status: 'Accepted', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Michael Chen', referringFacility: 'Community Health Center', referredFacility: 'Neurology Institute', dateCreated: '2023-09-14' },
        { id: 'REF-2023-003', patientId: 'P003', patientName: 'Robert Johnson', specialty: 'Dermatology', reason: 'Unusual skin rash, itching', priority: 'Low', status: 'Completed', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Sarah Lee', referringFacility: 'Community Health Center', referredFacility: 'Skin Care Center', dateCreated: '2023-09-12', dateCompleted: '2023-09-20' },
        { id: 'REF-2023-004', patientId: 'P004', patientName: 'Sarah Williams', specialty: 'Ophthalmology', reason: 'Blurred vision, eye pain', priority: 'Medium', status: 'Pending', referringDoctor: 'Dr. Jane Smith', referringFacility: 'Community Health Center', referredFacility: 'Vision Care Clinic', dateCreated: '2023-09-10' },
        { id: 'REF-2023-005', patientId: 'P005', patientName: 'Michael Brown', specialty: 'Orthopedics', reason: 'Chronic back pain', priority: 'Medium', status: 'Rejected', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. James Wilson', referringFacility: 'Community Health Center', referredFacility: 'Orthopedic Specialists', dateCreated: '2023-09-08', notes: 'Patient should first complete physical therapy' },
        { id: 'REF-2023-006', patientId: 'P006', patientName: 'Jennifer Davis', specialty: 'Endocrinology', reason: 'Suspected diabetes', priority: 'Medium', status: 'Completed', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Emily Rodriguez', referringFacility: 'Community Health Center', referredFacility: 'Diabetes Care Center', dateCreated: '2023-09-05', dateCompleted: '2023-09-18' },
        { id: 'REF-2023-007', patientId: 'P007', patientName: 'David Miller', specialty: 'Pulmonology', reason: 'Chronic cough, shortness of breath', priority: 'High', status: 'Accepted', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Robert Kim', referringFacility: 'Community Health Center', referredFacility: 'Respiratory Institute', dateCreated: '2023-09-03' },
        { id: 'REF-2023-008', patientId: 'P008', patientName: 'Lisa Wilson', specialty: 'Gastroenterology', reason: 'Abdominal pain, nausea', priority: 'Low', status: 'Pending', referringDoctor: 'Dr. Jane Smith', referringFacility: 'Community Health Center', referredFacility: 'Digestive Health Center', dateCreated: '2023-09-01' },
      ];
      
      setReferrals(mockReferrals);
      setIsLoading(false);
    }, 1000);
  }, []);
  
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
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:eye" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
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