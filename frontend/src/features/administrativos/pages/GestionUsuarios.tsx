import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'admin' | 'director' | 'patient';
  facility: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export const GestionUsuarios: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [users, setUsers] = React.useState<User[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<User>>({
    name: '',
    email: '',
    role: 'doctor',
    facility: '',
    status: 'active'
  });
  
  // Mock user data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUsers: User[] = [
        { id: 'U001', name: 'Dr. Jane Smith', email: 'doctor@example.com', role: 'doctor', facility: 'Community Health Center', status: 'active', lastLogin: '2023-09-15 08:30' },
        { id: 'U002', name: 'Alex Johnson', email: 'admin@example.com', role: 'admin', facility: 'Central Hospital Administration', status: 'active', lastLogin: '2023-09-15 09:15' },
        { id: 'U003', name: 'Dr. Robert Williams', email: 'director@example.com', role: 'director', facility: 'Community Health Center', status: 'active', lastLogin: '2023-09-14 14:20' },
        { id: 'U004', name: 'Maria Garcia', email: 'patient@example.com', role: 'patient', facility: 'N/A', status: 'active', lastLogin: '2023-09-13 10:45' },
        { id: 'U005', name: 'Dr. Michael Chen', email: 'mchen@example.com', role: 'doctor', facility: 'Neurology Institute', status: 'active', lastLogin: '2023-09-12 11:30' },
        { id: 'U006', name: 'Sarah Lee', email: 'slee@example.com', role: 'doctor', facility: 'Skin Care Center', status: 'active', lastLogin: '2023-09-11 15:20' },
        { id: 'U007', name: 'James Wilson', email: 'jwilson@example.com', role: 'doctor', facility: 'Orthopedic Specialists', status: 'inactive', lastLogin: '2023-08-25 09:10' },
        { id: 'U008', name: 'Emily Rodriguez', email: 'erodriguez@example.com', role: 'doctor', facility: 'Diabetes Care Center', status: 'active', lastLogin: '2023-09-10 08:45' },
      ];
      
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleAddUser = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.facility) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }
    
    // Generate ID
    const newId = `U${String(users.length + 1).padStart(3, '0')}`;
    
    // Add new user
    const newUser: User = {
      id: newId,
      name: formData.name || '',
      email: formData.email || '',
      role: formData.role as 'doctor' | 'admin' | 'director' | 'patient' || 'doctor',
      facility: formData.facility || '',
      status: formData.status as 'active' | 'inactive' || 'active',
    };
    
    setUsers([newUser, ...users]);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      role: 'doctor',
      facility: '',
      status: 'active'
    });
    
    addToast({
      title: "User Added",
      description: `${newUser.name} has been added successfully`,
      color: "success"
    });
    
    onOpenChange(false);
  };
  
  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (selectedRole === 'all') return matchesSearch;
    return matchesSearch && user.role === selectedRole;
  });
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'primary';
      case 'admin': return 'warning';
      case 'director': return 'secondary';
      case 'patient': return 'success';
      default: return 'default';
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'admin': return 'Admin';
      case 'director': return 'Director';
      case 'patient': return 'Patient';
      default: return role;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <Button color="primary" onPress={onOpen} startContent={<Icon icon="lucide:user-plus" />}>
          Add User
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="w-full sm:max-w-xs"
              />
              
              <div className="flex gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      {selectedRole === 'all' ? 'All Roles' : getRoleLabel(selectedRole)}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="Role filter options"
                    selectedKeys={[selectedRole]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setSelectedRole(selected);
                    }}
                    selectionMode="single"
                  >
                    <DropdownItem key="all">All Roles</DropdownItem>
                    <DropdownItem key="doctor">Doctors</DropdownItem>
                    <DropdownItem key="admin">Administrators</DropdownItem>
                    <DropdownItem key="director">Directors</DropdownItem>
                    <DropdownItem key="patient">Patients</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
                  Export
                </Button>
              </div>
            </div>
            
            <Table 
              aria-label="Users table"
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
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>FACILITY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LAST LOGIN</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading users...</div>}
                emptyContent={<div className="py-8">No users found</div>}
              >
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={getRoleColor(user.role)}
                        variant="flat"
                      >
                        {getRoleLabel(user.role)}
                      </Chip>
                    </TableCell>
                    <TableCell>{user.facility}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={user.status === 'active' ? 'success' : 'danger'}
                        variant="flat"
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Chip>
                    </TableCell>
                    <TableCell>{user.lastLogin || 'Never'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:edit" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:key" className="text-warning" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:trash-2" className="text-danger" />
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
      
      {/* Add User Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add New User</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onValueChange={(value) => handleInputChange('name', value)}
                    isRequired
                  />
                  <Input
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    value={formData.email}
                    onValueChange={(value) => handleInputChange('email', value)}
                    isRequired
                  />
                  <div className="md:col-span-2">
                    <label className="block text-small font-medium mb-1.5">Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['doctor', 'admin', 'director', 'patient'].map((role) => (
                        <div 
                          key={role}
                          className={`p-3 rounded-medium cursor-pointer transition-colors border ${
                            formData.role === role 
                              ? `bg-${getRoleColor(role)}-100 border-${getRoleColor(role)}-200` 
                              : 'hover:bg-default-100 border-default-200'
                          }`}
                          onClick={() => handleInputChange('role', role)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon 
                              icon={
                                role === 'doctor' ? 'lucide:stethoscope' :
                                role === 'admin' ? 'lucide:settings' :
                                role === 'director' ? 'lucide:briefcase' :
                                'lucide:user'
                              } 
                              className={`text-${getRoleColor(role)}`} 
                            />
                            <span>{getRoleLabel(role)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Facility"
                    placeholder="Enter facility or hospital"
                    value={formData.facility}
                    onValueChange={(value) => handleInputChange('facility', value)}
                    isRequired
                  />
                  <div>
                    <label className="block text-small font-medium mb-1.5">Status</label>
                    <div className="flex gap-4">
                      <div 
                        className={`flex-1 p-3 rounded-medium cursor-pointer transition-colors border ${
                          formData.status === 'active' 
                            ? 'bg-success-100 border-success-200' 
                            : 'hover:bg-default-100 border-default-200'
                        }`}
                        onClick={() => handleInputChange('status', 'active')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon icon="lucide:check-circle" className="text-success" />
                          <span>Active</span>
                        </div>
                      </div>
                      <div 
                        className={`flex-1 p-3 rounded-medium cursor-pointer transition-colors border ${
                          formData.status === 'inactive' 
                            ? 'bg-danger-100 border-danger-200' 
                            : 'hover:bg-default-100 border-default-200'
                        }`}
                        onClick={() => handleInputChange('status', 'inactive')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon icon="lucide:x-circle" className="text-danger" />
                          <span>Inactive</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddUser}>
                  Add User
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