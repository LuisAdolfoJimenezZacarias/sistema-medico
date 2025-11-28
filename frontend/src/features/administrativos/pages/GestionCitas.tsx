import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Chip, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  type: 'First Visit' | 'Follow-up' | 'Consultation';
}

export const GestionCitas: React.FC = () => {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Mock appointment data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAppointments: Appointment[] = [
        { id: 'APT-2023-001', patientName: 'Maria Garcia', doctorName: 'Dr. Jane Smith', department: 'Cardiology', date: '2023-09-15', time: '09:00 AM', status: 'Scheduled', type: 'First Visit' },
        { id: 'APT-2023-002', patientName: 'John Smith', doctorName: 'Dr. Michael Chen', department: 'Neurology', date: '2023-09-14', time: '10:30 AM', status: 'Completed', type: 'Follow-up' },
        { id: 'APT-2023-003', patientName: 'Robert Johnson', doctorName: 'Dr. Sarah Lee', department: 'Dermatology', date: '2023-09-12', time: '02:15 PM', status: 'Cancelled', type: 'Consultation' },
        { id: 'APT-2023-004', patientName: 'Sarah Williams', doctorName: 'Dr. James Wilson', department: 'Ophthalmology', date: '2023-09-10', time: '11:45 AM', status: 'Completed', type: 'Follow-up' },
        { id: 'APT-2023-005', patientName: 'Michael Brown', doctorName: 'Dr. Emily Rodriguez', department: 'Orthopedics', date: '2023-09-18', time: '03:30 PM', status: 'Scheduled', type: 'First Visit' },
        { id: 'APT-2023-006', patientName: 'Jennifer Davis', doctorName: 'Dr. Robert Kim', department: 'Endocrinology', date: '2023-09-20', time: '01:00 PM', status: 'Scheduled', type: 'Consultation' },
        { id: 'APT-2023-007', patientName: 'David Miller', doctorName: 'Dr. Lisa Chen', department: 'Pulmonology', date: '2023-09-08', time: '09:15 AM', status: 'No-show', type: 'Follow-up' },
        { id: 'APT-2023-008', patientName: 'Lisa Wilson', doctorName: 'Dr. Thomas Johnson', department: 'Gastroenterology', date: '2023-09-22', time: '10:00 AM', status: 'Scheduled', type: 'First Visit' },
      ];
      
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => 
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredAppointments.length / rowsPerPage);
  const paginatedAppointments = filteredAppointments.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus } 
        : appointment
    ));
    
    addToast({
      title: "Status Updated",
      description: `Appointment ${appointmentId} status changed to ${newStatus}`,
      color: "success"
    });
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      case 'No-show': return 'warning';
      default: return 'default';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Appointments Management</h1>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:calendar-plus" />}>
            Schedule Appointment
          </Button>
          <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
            Export
          </Button>
        </div>
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
                placeholder="Search by patient, doctor or ID..."
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
                    <DropdownItem key="all">All Appointments</DropdownItem>
                    <DropdownItem key="scheduled">Scheduled</DropdownItem>
                    <DropdownItem key="completed">Completed</DropdownItem>
                    <DropdownItem key="cancelled">Cancelled</DropdownItem>
                    <DropdownItem key="no-show">No-show</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            
            <Table 
              aria-label="Appointments table"
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
                <TableColumn>PATIENT</TableColumn>
                <TableColumn>DOCTOR</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>DATE & TIME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading appointments...</div>}
                emptyContent={<div className="py-8">No appointments found</div>}
              >
                {paginatedAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{appointment.department}</TableCell>
                    <TableCell>
                      <div>
                        <div>{appointment.date}</div>
                        <div className="text-tiny text-foreground-500">{appointment.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {appointment.type}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={getStatusColor(appointment.status)}
                        variant="flat"
                      >
                        {appointment.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" className="text-default-500" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            <DropdownItem key="view">View Details</DropdownItem>
                            <DropdownItem key="edit">Edit Appointment</DropdownItem>
                            <DropdownItem key="reschedule">Reschedule</DropdownItem>
                            <DropdownItem 
                              key="complete" 
                              isDisabled={appointment.status !== 'Scheduled'}
                              onPress={() => handleStatusChange(appointment.id, 'Completed')}
                            >
                              Mark as Completed
                            </DropdownItem>
                            <DropdownItem 
                              key="cancel" 
                              className="text-danger"
                              isDisabled={appointment.status !== 'Scheduled'}
                              onPress={() => handleStatusChange(appointment.id, 'Cancelled')}
                            >
                              Cancel Appointment
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
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