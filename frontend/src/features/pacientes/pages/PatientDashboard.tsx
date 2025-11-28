import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock upcoming appointments
  const upcomingAppointments = [
    { id: 'APT-001', doctor: 'Dr. Michael Chen', specialty: 'Neurology', date: '2023-09-25', time: '10:00 AM', location: 'Neurology Institute, Room 305', status: 'Confirmed' },
    { id: 'APT-002', doctor: 'Dr. Sarah Lee', specialty: 'Dermatology', date: '2023-10-03', time: '2:30 PM', location: 'Skin Care Center, Room 112', status: 'Pending' },
  ];
  
  // Mock recent referrals
  const recentReferrals = [
    { id: 'REF-2023-001', specialty: 'Cardiology', reason: 'Chest pain, abnormal ECG', status: 'Pending', date: '2023-09-15', priority: 'High' },
    { id: 'REF-2023-004', specialty: 'Ophthalmology', reason: 'Blurred vision, eye pain', status: 'Accepted', date: '2023-09-10', priority: 'Medium' },
  ];
  
  // Mock notifications
  const notifications = [
    { id: 'NOT-001', message: 'Your appointment with Dr. Michael Chen has been confirmed', date: '2023-09-18', read: false },
    { id: 'NOT-002', message: 'Your referral to Cardiology is pending specialist assignment', date: '2023-09-15', read: true },
    { id: 'NOT-003', message: 'Please complete your pre-appointment questionnaire', date: '2023-09-14', read: false },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-foreground-500">Patient Portal • Medical ID: P001</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:calendar-plus" />}>
            Request Appointment
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border border-default-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
              <Button variant="light" size="sm" endContent={<Icon icon="lucide:arrow-right" />}>
                View All
              </Button>
            </CardHeader>
            <CardBody>
              {upcomingAppointments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-foreground-500">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-default-200 rounded-medium p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{appointment.specialty} Appointment</h3>
                            <Chip 
                              size="sm" 
                              color={appointment.status === 'Confirmed' ? 'success' : 'warning'}
                              variant="flat"
                            >
                              {appointment.status}
                            </Chip>
                          </div>
                          <p className="text-foreground-500">{appointment.doctor}</p>
                          <p className="text-small text-foreground-500">{appointment.location}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:calendar" className="text-primary" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:clock" className="text-primary" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="flat" color="primary">
                          Reschedule
                        </Button>
                        <Button size="sm" variant="flat" color="danger">
                          Cancel
                        </Button>
                        <Button size="sm" variant="light">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          
          <Card className="border border-default-200 mt-6">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Referrals</h2>
              <Button variant="light" size="sm" endContent={<Icon icon="lucide:arrow-right" />}>
                View All
              </Button>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-foreground-500 text-small border-b border-divider">
                      <th className="pb-2 font-medium">ID</th>
                      <th className="pb-2 font-medium">Specialty</th>
                      <th className="pb-2 font-medium">Reason</th>
                      <th className="pb-2 font-medium">Priority</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReferrals.map((referral) => (
                      <tr key={referral.id} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{referral.id}</td>
                        <td className="py-3 text-small">{referral.specialty}</td>
                        <td className="py-3 text-small max-w-[200px] truncate">{referral.reason}</td>
                        <td className="py-3 text-small">
                          <Chip 
                            size="sm" 
                            color={referral.priority === 'High' ? 'danger' : referral.priority === 'Medium' ? 'warning' : 'success'}
                            variant="flat"
                          >
                            {referral.priority}
                          </Chip>
                        </td>
                        <td className="py-3 text-small">
                          <Chip 
                            size="sm" 
                            color={referral.status === 'Pending' ? 'warning' : referral.status === 'Accepted' ? 'primary' : 'success'}
                            variant="flat"
                          >
                            {referral.status}
                          </Chip>
                        </td>
                        <td className="py-3 text-small">{referral.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-default-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Button variant="light" size="sm" isIconOnly>
                <Icon icon="lucide:bell" />
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-divider">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 ${notification.read ? '' : 'bg-primary-50'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 text-${notification.read ? 'default-400' : 'primary'}`}>
                        <Icon icon={notification.read ? "lucide:check-circle" : "lucide:bell"} />
                      </div>
                      <div>
                        <p className={`${notification.read ? 'text-foreground-500' : 'font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-tiny text-foreground-400 mt-1">{notification.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          
          <Card className="border border-default-200 mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:calendar" />}
                className="justify-start"
              >
                View All Appointments
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:file-text" />}
                className="justify-start"
              >
                Medical Records
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:message-square" />}
                className="justify-start"
              >
                Message Doctor
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:pill" />}
                className="justify-start"
              >
                Prescription Refills
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:help-circle" />}
                className="justify-start"
              >
                Help & Support
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};