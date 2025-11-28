import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

interface CounterReferral {
  id: string;
  referralId: string;
  patientName: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  followUpNeeded: boolean;
  followUpInstructions?: string;
  referringDoctor: string;
  referredDoctor: string;
  dateCreated: string;
  status: 'Pending' | 'Sent' | 'Received';
}

interface Referral {
  id: string;
  patientName: string;
  specialty: string;
  status: string;
}

export const ContraReferencias: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();
  
  const [counterReferrals, setCounterReferrals] = React.useState<CounterReferral[]>([]);
  const [pendingReferrals, setPendingReferrals] = React.useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedReferral, setSelectedReferral] = React.useState<Referral | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<CounterReferral>>({
    referralId: '',
    patientName: '',
    specialty: '',
    diagnosis: '',
    treatment: '',
    followUpNeeded: false,
    followUpInstructions: '',
    referringDoctor: '',
    referredDoctor: 'Dr. Michael Chen',
  });
  
  // Mock data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCounterReferrals: CounterReferral[] = [
        { id: 'CR-2023-001', referralId: 'REF-2023-003', patientName: 'Robert Johnson', specialty: 'Dermatology', diagnosis: 'Contact dermatitis', treatment: 'Prescribed topical corticosteroids and antihistamines', followUpNeeded: true, followUpInstructions: 'Follow up in 2 weeks if no improvement', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Sarah Lee', dateCreated: '2023-09-20', status: 'Sent' },
        { id: 'CR-2023-002', referralId: 'REF-2023-006', patientName: 'Jennifer Davis', specialty: 'Endocrinology', diagnosis: 'Type 2 Diabetes', treatment: 'Metformin 500mg twice daily, dietary changes', followUpNeeded: true, followUpInstructions: 'Follow up in 1 month with fasting blood glucose results', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Emily Rodriguez', dateCreated: '2023-09-18', status: 'Received' },
        { id: 'CR-2023-003', referralId: 'REF-2023-002', patientName: 'John Smith', specialty: 'Neurology', diagnosis: 'Migraine with aura', treatment: 'Sumatriptan as needed, prophylactic therapy with propranolol', followUpNeeded: true, followUpInstructions: 'Follow up in 4 weeks to assess efficacy', referringDoctor: 'Dr. Jane Smith', referredDoctor: 'Dr. Michael Chen', dateCreated: '2023-09-16', status: 'Pending' },
      ];
      
      const mockPendingReferrals: Referral[] = [
        { id: 'REF-2023-002', patientName: 'John Smith', specialty: 'Neurology', status: 'Accepted' },
        { id: 'REF-2023-007', patientName: 'David Miller', specialty: 'Pulmonology', status: 'Accepted' },
      ];
      
      setCounterReferrals(mockCounterReferrals);
      setPendingReferrals(mockPendingReferrals);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleReferralSelect = (referral: Referral) => {
    setSelectedReferral(referral);
    setFormData({
      ...formData,
      referralId: referral.id,
      patientName: referral.patientName,
      specialty: referral.specialty,
      referringDoctor: 'Dr. Jane Smith',
      referredDoctor: 'Dr. Michael Chen',
    });
  };
  
  const handleAddCounterReferral = () => {
    // Validate form
    if (!formData.referralId || !formData.diagnosis || !formData.treatment) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }
    
    // Generate ID
    const newId = `CR-2023-${String(counterReferrals.length + 1).padStart(3, '0')}`;
    
    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Add new counter-referral
    const newCounterReferral: CounterReferral = {
      id: newId,
      referralId: formData.referralId || '',
      patientName: formData.patientName || '',
      specialty: formData.specialty || '',
      diagnosis: formData.diagnosis || '',
      treatment: formData.treatment || '',
      followUpNeeded: !!formData.followUpNeeded,
      followUpInstructions: formData.followUpInstructions,
      referringDoctor: formData.referringDoctor || '',
      referredDoctor: formData.referredDoctor || '',
      dateCreated: currentDate,
      status: 'Pending'
    };
    
    setCounterReferrals([newCounterReferral, ...counterReferrals]);
    
    // Remove the referral from pending list
    if (selectedReferral) {
      setPendingReferrals(pendingReferrals.filter(ref => ref.id !== selectedReferral.id));
    }
    
    // Reset form
    setFormData({
      referralId: '',
      patientName: '',
      specialty: '',
      diagnosis: '',
      treatment: '',
      followUpNeeded: false,
      followUpInstructions: '',
      referringDoctor: '',
      referredDoctor: 'Dr. Michael Chen',
    });
    
    setSelectedReferral(null);
    
    addToast({
      title: "Counter-Referral Created",
      description: `Counter-referral for ${newCounterReferral.patientName} has been created successfully`,
      color: "success"
    });
    
    onOpenChange(false);
  };
  
  // Filter counter-referrals based on search term
  const filteredCounterReferrals = counterReferrals.filter(cr => 
    cr.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cr.referralId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredCounterReferrals.length / rowsPerPage);
  const paginatedCounterReferrals = filteredCounterReferrals.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Counter-Referrals</h1>
        <Button color="primary" onPress={() => navigate('/doctor/referrals/NuevaContrarreferencia')} startContent={<Icon icon="lucide:plus" />}>
          New Counter-Referral
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
                placeholder="Search by patient name or ID..."
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
                    <DropdownItem key="all">All Status</DropdownItem>
                    <DropdownItem key="pending">Pending</DropdownItem>
                    <DropdownItem key="sent">Sent</DropdownItem>
                    <DropdownItem key="received">Received</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
                  Export
                </Button>
              </div>
            </div>
            
            <Table 
              aria-label="Counter-Referrals table"
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
                <TableColumn>REFERRAL ID</TableColumn>
                <TableColumn>PATIENT</TableColumn>
                <TableColumn>SPECIALTY</TableColumn>
                <TableColumn>DIAGNOSIS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading counter-referrals...</div>}
                emptyContent={<div className="py-8">No counter-referrals found</div>}
              >
                {paginatedCounterReferrals.map((cr) => (
                  <TableRow key={cr.id}>
                    <TableCell>{cr.id}</TableCell>
                    <TableCell>{cr.referralId}</TableCell>
                    <TableCell>{cr.patientName}</TableCell>
                    <TableCell>{cr.specialty}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{cr.diagnosis}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={
                          cr.status === 'Pending' ? 'warning' : 
                          cr.status === 'Sent' ? 'primary' : 
                          'success'
                        }
                        variant="flat"
                      >
                        {cr.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{cr.dateCreated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:eye" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:edit" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:printer" className="text-primary" />
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
      
      {/* New Counter-Referral Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create Counter-Referral</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-small font-medium mb-1.5">Select Referral</label>
                    <div className="border border-default-200 rounded-medium p-2 max-h-[200px] overflow-y-auto">
                      {pendingReferrals.length === 0 ? (
                        <p className="text-center py-4 text-foreground-500">No pending referrals available</p>
                      ) : (
                        <div className="space-y-2">
                          {pendingReferrals.map((referral) => (
                            <div 
                              key={referral.id}
                              className={`p-3 rounded-medium cursor-pointer transition-colors ${
                                selectedReferral?.id === referral.id 
                                  ? 'bg-primary-100 border border-primary-200' 
                                  : 'hover:bg-default-100 border border-transparent'
                              }`}
                              onClick={() => handleReferralSelect(referral)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{referral.patientName}</p>
                                  <p className="text-small text-foreground-500">{referral.id} • {referral.specialty}</p>
                                </div>
                                {selectedReferral?.id === referral.id && (
                                  <Icon icon="lucide:check-circle" className="text-primary" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Input
                    label="Diagnosis"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onValueChange={(value) => handleInputChange('diagnosis', value)}
                    isRequired
                    isDisabled={!selectedReferral}
                  />
                  
                  <Textarea
                    label="Treatment Plan"
                    placeholder="Enter treatment plan"
                    value={formData.treatment}
                    onValueChange={(value) => handleInputChange('treatment', value)}
                    isRequired
                    isDisabled={!selectedReferral}
                  />
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      isSelected={formData.followUpNeeded}
                      onValueChange={(value) => handleInputChange('followUpNeeded', value)}
                      isDisabled={!selectedReferral}
                    >
                      Follow-up needed
                    </Checkbox>
                  </div>
                  
                  {formData.followUpNeeded && (
                    <Textarea
                      label="Follow-up Instructions"
                      placeholder="Enter follow-up instructions"
                      value={formData.followUpInstructions || ''}
                      onValueChange={(value) => handleInputChange('followUpInstructions', value)}
                      isDisabled={!selectedReferral}
                    />
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleAddCounterReferral}
                  isDisabled={!selectedReferral}
                >
                  Create Counter-Referral
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

// Helper components to avoid TypeScript errors
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

const Checkbox: React.FC<{
  isSelected?: boolean;
  onValueChange?: (value: boolean) => void;
  isDisabled?: boolean;
  children: React.ReactNode;
}> = ({ isSelected, onValueChange, isDisabled, children }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={(e) => onValueChange?.(e.target.checked)}
        disabled={isDisabled}
        className="w-4 h-4 text-primary border-default-300 rounded focus:ring-primary"
      />
      <span>{children}</span>
    </label>
  );
};