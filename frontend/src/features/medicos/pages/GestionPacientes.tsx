import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { useNavigate } from 'react-router-dom';


interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  idNumber: string;
  phone: string;
  address: string;
  insuranceProvider: string;
  insuranceNumber: string;
  status: string;
}

export const GestionPacientes: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate(); 
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: '',
    idNumber: '',
    phone: '',
    address: '',
    insuranceProvider: '',
    insuranceNumber: '',
    status: 'Active'
  });
  
  // Mock patient data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPatients: Patient[] = [
        { id: 'P001', name: 'Maria Garcia', age: 45, gender: 'Female', idNumber: '123456789', phone: '555-123-4567', address: '123 Main St', insuranceProvider: 'MediCare', insuranceNumber: 'MC12345', status: 'Active' },
        { id: 'P002', name: 'John Smith', age: 62, gender: 'Male', idNumber: '987654321', phone: '555-987-6543', address: '456 Oak Ave', insuranceProvider: 'BlueCross', insuranceNumber: 'BC67890', status: 'Active' },
        { id: 'P003', name: 'Robert Johnson', age: 38, gender: 'Male', idNumber: '456789123', phone: '555-456-7890', address: '789 Pine Rd', insuranceProvider: 'Aetna', insuranceNumber: 'AE54321', status: 'Inactive' },
        { id: 'P004', name: 'Sarah Williams', age: 29, gender: 'Female', idNumber: '789123456', phone: '555-789-0123', address: '321 Elm St', insuranceProvider: 'Humana', insuranceNumber: 'HU98765', status: 'Active' },
        { id: 'P005', name: 'Michael Brown', age: 55, gender: 'Male', idNumber: '321654987', phone: '555-321-6549', address: '654 Maple Dr', insuranceProvider: 'Cigna', insuranceNumber: 'CI13579', status: 'Active' },
        { id: 'P006', name: 'Jennifer Davis', age: 41, gender: 'Female', idNumber: '654987321', phone: '555-654-9873', address: '987 Cedar Ln', insuranceProvider: 'MediCare', insuranceNumber: 'MC24680', status: 'Active' },
        { id: 'P007', name: 'David Miller', age: 70, gender: 'Male', idNumber: '258741369', phone: '555-258-7413', address: '369 Birch Ct', insuranceProvider: 'BlueCross', insuranceNumber: 'BC97531', status: 'Inactive' },
        { id: 'P008', name: 'Lisa Wilson', age: 33, gender: 'Female', idNumber: '147258369', phone: '555-147-2583', address: '258 Spruce Way', insuranceProvider: 'Aetna', insuranceNumber: 'AE86420', status: 'Active' },
      ];
      
      setPatients(mockPatients);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleInputChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleAddPatient = () => {
    // Validate form
    if (!formData.name || !formData.idNumber) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }
    
    // Generate ID
    const newId = `P${String(patients.length + 1).padStart(3, '0')}`;
    
    // Add new patient
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
      status: formData.status || 'Active'
    };
    
    setPatients([newPatient, ...patients]);
    
    // Reset form
    setFormData({
      name: '',
      age: 0,
      gender: '',
      idNumber: '',
      phone: '',
      address: '',
      insuranceProvider: '',
      insuranceNumber: '',
      status: 'Active'
    });
    
    addToast({
      title: "Patient Added",
      description: `${newPatient.name} has been added successfully`,
      color: "success"
    });
    
    onOpenChange(false);
  };
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              
              <div className="flex gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      Filter
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Filter options">
                    <DropdownItem key="all">All Patients</DropdownItem>
                    <DropdownItem key="active">Active Patients</DropdownItem>
                    <DropdownItem key="inactive">Inactive Patients</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
                  Export
                </Button>
              </div>
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
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>AGE</TableColumn>
                <TableColumn>GENDER</TableColumn>
                <TableColumn>ID NUMBER</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading patients...</div>}
                emptyContent={<div className="py-8">No patients found</div>}
              >
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.idNumber}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={patient.status === 'Active' ? 'success' : 'danger'}
                        variant="flat"
                      >
                        {patient.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:eye" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:edit" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:send" className="text-primary" />
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