import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tabs, Tab, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';
import { addToast } from '@heroui/react';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  followUp?: boolean;
}

export const MisCitas: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  
  const { user } = useAuth();
  
  // Mock appointment data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAppointments: Appointment[] = [
        { id: 'APT-2023-001', doctorName: 'Dr. Michael Chen', specialty: 'Neurology', date: '2023-09-25', time: '10:00 AM', location: 'Neurology Institute, Room 305', status: 'Confirmed', notes: 'Please bring previous test results and arrive 15 minutes early to complete paperwork.' },
        { id: 'APT-2023-002', doctorName: 'Dr. Sarah Lee', specialty: 'Dermatology', date: '2023-10-03', time: '2:30 PM', location: 'Skin Care Center, Room 112', status: 'Pending', notes: 'Follow-up for previous treatment.' },
        { id: 'APT-2023-003', doctorName: 'Dr. James Wilson', specialty: 'Orthopedics', date: '2023-08-15', time: '9:15 AM', location: 'Orthopedic Specialists, Room 203', status: 'Completed', notes: 'Knee pain evaluation.', followUp: true },
        { id: 'APT-2023-004', doctorName: 'Dr. Emily Rodriguez', specialty: 'Endocrinology', date: '2023-08-05', time: '11:30 AM', location: 'Diabetes Care Center, Room 118', status: 'Completed', notes: 'Regular diabetes check-up.', followUp: false },
        { id: 'APT-2023-005', doctorName: 'Dr. Robert Kim', specialty: 'Pulmonology', date: '2023-07-22', time: '3:00 PM', location: 'Respiratory Institute, Room 405', status: 'Cancelled', notes: 'Breathing difficulties assessment.' },
        { id: 'APT-2023-006', doctorName: 'Dr. Lisa Chen', specialty: 'Cardiology', date: '2023-10-12', time: '1:45 PM', location: 'Heart Center, Room 210', status: 'Confirmed', notes: 'Annual heart check-up.' },
      ];
      
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter appointments based on tab
  const filteredAppointments = appointments.filter(appointment => {
    const today = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (selectedTab === 'upcoming') {
      return appointmentDate >= today && (appointment.status === 'Confirmed' || appointment.status === 'Pending');
    }
    if (selectedTab === 'past') {
      return appointmentDate < today || appointment.status === 'Completed' || appointment.status === 'Cancelled';
    }
    if (selectedTab === 'all') {
      return true;
    }
    
    return true;
  });
  
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };
  
  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id 
        ? { ...appointment, status: 'Cancelled' as const } 
        : appointment
    ));
    
    if (selectedAppointment?.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: 'Cancelled' as const });
    }
    
    addToast({
      title: "Appointment Cancelled",
      description: `Appointment ${id} has been cancelled successfully`,
      color: "warning"
    });
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Completed': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-foreground-500">Manage your medical appointments</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:calendar-plus" />}>
            Request Appointment
          </Button>
        </div>
      </div>
      
      <Tabs 
        aria-label="Appointment filters" 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab as any}
        className="mb-4"
      >
        <Tab key="upcoming" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar" />
            <span>Upcoming</span>
          </div>
        } />
        <Tab key="past" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar-check" />
            <span>Past</span>
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
        className="space-y-4"
      >
        {isLoading ? (
          <div className="text-center py-12">
            <Spinner />
            <p className="mt-2 text-foreground-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card className="border border-default-200">
            <CardBody className="py-12 text-center">
              <Icon icon="lucide:calendar-x" className="text-5xl text-foreground-300 mx-auto mb-4" />
              <p className="text-xl font-medium">No appointments found</p>
              <p className="text-foreground-500 mt-2">You don't have any {selectedTab} appointments.</p>
              <Button color="primary" className="mt-6" startContent={<Icon icon="lucide:calendar-plus" />}>
                Request New Appointment
              </Button>
            </CardBody>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <motion.div 
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-default-200">
                <CardBody className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{appointment.specialty} Appointment</h3>
                        <Chip 
                          size="sm" 
                          color={getStatusColor(appointment.status)}
                          variant="flat"
                        >
                          {appointment.status}
                        </Chip>
                      </div>
                      <p className="text-foreground-600">{appointment.doctorName}</p>
                      <p className="text-small text-foreground-500 mt-1">{appointment.location}</p>
                      
                      {appointment.notes && (
                        <div className="mt-3 text-small text-foreground-500">
                          <p className="font-medium">Notes:</p>
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end justify-center gap-1">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Icon icon="lucide:calendar" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Icon icon="lucide:clock" />
                        <span>{appointment.time}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="primary"
                          onPress={() => handleViewDetails(appointment)}
                        >
                          Details
                        </Button>
                        
                        {(appointment.status === 'Confirmed' || appointment.status === 'Pending') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="flat"
                            >
                              Reschedule
                            </Button>
                            <Button 
                              size="sm" 
                              variant="flat" 
                              color="danger"
                              onPress={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {appointment.status === 'Completed' && appointment.followUp && (
                          <Button 
                            size="sm" 
                            variant="flat" 
                            color="primary"
                            startContent={<Icon icon="lucide:calendar-plus" />}
                          >
                            Schedule Follow-up
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
      
      {/* Appointment Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => selectedAppointment && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Appointment Details</span>
                  <Chip 
                    size="sm" 
                    color={getStatusColor(selectedAppointment.status)}
                    variant="flat"
                  >
                    {selectedAppointment.status}
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-small text-foreground-500">Appointment ID</p>
                      <p className="font-medium">{selectedAppointment.id}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Specialty</p>
                      <p className="font-medium">{selectedAppointment.specialty}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Doctor</p>
                      <p className="font-medium">{selectedAppointment.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-small text-foreground-500">Date & Time</p>
                      <p className="font-medium">{formatDate(selectedAppointment.date)} at {selectedAppointment.time}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-small text-foreground-500">Location</p>
                      <p className="font-medium">{selectedAppointment.location}</p>
                    </div>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div className="border-t border-divider pt-4">
                      <p className="text-small text-foreground-500">Notes</p>
                      <p className="mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-divider pt-4">
                    <p className="text-small text-foreground-500">Preparation</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside text-foreground-600">
                      <li>Please arrive 15 minutes before your appointment time</li>
                      <li>Bring your insurance card and ID</li>
                      <li>Bring a list of current medications</li>
                      <li>Bring any relevant medical records or test results</li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                {(selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Pending') ? (
                  <>
                    <Button 
                      color="danger" 
                      variant="flat" 
                      onPress={() => {
                        handleCancelAppointment(selectedAppointment.id);
                        onClose();
                      }}
                    >
                      Cancel Appointment
                    </Button>
                    <Button 
                      color="primary" 
                      onPress={onClose}
                    >
                      Close
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
    </div>
  );
};

// Helper component to avoid TypeScript errors
const Spinner: React.FC = () => {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
  );
};