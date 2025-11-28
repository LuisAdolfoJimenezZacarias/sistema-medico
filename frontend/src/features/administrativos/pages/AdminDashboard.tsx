import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock statistics
  const stats = [
    { title: 'Total Users', value: 124, icon: 'lucide:users', color: 'primary' },
    { title: 'Pending Appointments', value: 28, icon: 'lucide:calendar', color: 'warning' },
    { title: 'Documents Processed', value: 356, icon: 'lucide:file-text', color: 'success' },
    { title: 'Units Connected', value: 8, icon: 'lucide:network', color: 'secondary' },
  ];
  
  // Mock recent activities
  const recentActivities = [
    { id: 'ACT-001', action: 'User Created', target: 'Dr. Michael Chen', user: 'Alex Johnson', date: '2023-09-15', status: 'Completed' },
    { id: 'ACT-002', action: 'Appointment Scheduled', target: 'Maria Garcia with Cardiology', user: 'Alex Johnson', date: '2023-09-14', status: 'Completed' },
    { id: 'ACT-003', action: 'Document Processed', target: 'REF-2023-003 Counter-Referral', user: 'System', date: '2023-09-12', status: 'Completed' },
    { id: 'ACT-004', action: 'User Modified', target: 'Dr. Sarah Lee', user: 'Alex Johnson', date: '2023-09-10', status: 'Completed' },
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
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-foreground-500">{user?.facility} • Administrator</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:plus" />}>
            New User
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
              <h2 className="text-lg font-semibold">Recent Activities</h2>
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
                      <th className="pb-2 font-medium">Action</th>
                      <th className="pb-2 font-medium">Target</th>
                      <th className="pb-2 font-medium">User</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{activity.id}</td>
                        <td className="py-3 text-small">{activity.action}</td>
                        <td className="py-3 text-small">{activity.target}</td>
                        <td className="py-3 text-small">{activity.user}</td>
                        <td className="py-3 text-small">{activity.date}</td>
                        <td className="py-3 text-small">
                          <Chip 
                            size="sm" 
                            color="success"
                            variant="flat"
                          >
                            {activity.status}
                          </Chip>
                        </td>
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
                Create New User
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:calendar-plus" />}
                className="justify-start"
              >
                Schedule Appointment
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:file-plus" />}
                className="justify-start"
              >
                Process Document
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:bar-chart" />}
                className="justify-start"
              >
                Generate Reports
              </Button>
              <Button 
                fullWidth 
                variant="flat" 
                color="primary" 
                startContent={<Icon icon="lucide:settings" />}
                className="justify-start"
              >
                System Settings
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};