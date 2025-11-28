import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock statistics
  const stats = [
    { title: 'Pending Referrals', value: 12, icon: 'lucide:clock', color: 'warning' },
    { title: 'Completed Referrals', value: 48, icon: 'lucide:check-circle', color: 'success' },
    { title: 'Pending Counter-Referrals', value: 7, icon: 'lucide:refresh-cw', color: 'primary' },
    { title: 'Total Patients', value: 156, icon: 'lucide:users', color: 'secondary' },
  ];
  
  // Mock recent referrals
  const recentReferrals = [
    { id: 'REF-2023-001', patient: 'Maria Garcia', specialty: 'Cardiology', status: 'Pending', date: '2023-09-15', priority: 'High' },
    { id: 'REF-2023-002', patient: 'John Smith', specialty: 'Neurology', status: 'Accepted', date: '2023-09-14', priority: 'Medium' },
    { id: 'REF-2023-003', patient: 'Robert Johnson', specialty: 'Dermatology', status: 'Completed', date: '2023-09-12', priority: 'Low' },
    { id: 'REF-2023-004', patient: 'Sarah Williams', specialty: 'Ophthalmology', status: 'Pending', date: '2023-09-10', priority: 'Medium' },
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenido. {user?.name}</h1>
          <p className="text-foreground-500">{user?.facility} • {user?.role}</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:plus" />}>
            Nueva Referencia
          </Button>
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="border border-default-200">
              <CardBody className="flex justify-between items-center p-4">
                <div>
                  <p className="text-foreground-500 text-small">{stat.title}</p>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon icon={stat.icon} className={`text-2xl text-${stat.color}`} />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border border-default-200">
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
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Specialty</th>
                      <th className="pb-2 font-medium">Priority</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReferrals.map((referral) => (
                      <tr key={referral.id} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{referral.id}</td>
                        <td className="py-3 text-small">{referral.patient}</td>
                        <td className="py-3 text-small">{referral.specialty}</td>
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
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-default-200 h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:user-plus" />}
                className="justify-start"
              >
                Register New Patient
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:send" />}
                className="justify-start"
              >
                Create New Referral
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:reply" />}
                className="justify-start"
              >
                Create Counter-Referral
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:file-text" />}
                className="justify-start"
              >
                Generate Reports
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:search" />}
                className="justify-start"
              >
                Search Referrals
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};