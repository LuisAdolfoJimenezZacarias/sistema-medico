import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';

export const DirectorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock statistics
  const stats = [
    { title: 'Total Referrals', value: 248, icon: 'lucide:send', color: 'primary' },
    { title: 'Avg. Response Time', value: '2.3 days', icon: 'lucide:clock', color: 'warning' },
    { title: 'Completion Rate', value: '87%', icon: 'lucide:check-circle', color: 'success' },
    { title: 'Pending Authorizations', value: 12, icon: 'lucide:clipboard-check', color: 'secondary' },
  ];
  
  // Mock performance by specialty
  const specialtyPerformance = [
    { specialty: 'Cardiology', referrals: 56, responseTime: '1.8 days', completion: '92%', trend: 'up' },
    { specialty: 'Neurology', referrals: 42, responseTime: '2.1 days', completion: '88%', trend: 'up' },
    { specialty: 'Dermatology', referrals: 38, responseTime: '1.5 days', completion: '95%', trend: 'up' },
    { specialty: 'Orthopedics', referrals: 45, responseTime: '3.2 days', completion: '78%', trend: 'down' },
    { specialty: 'Ophthalmology', referrals: 32, responseTime: '2.4 days', completion: '85%', trend: 'stable' },
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
          <p className="text-foreground-500">{user?.facility} • Unit Director</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:bar-chart-2" />}>
            Full Reports
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
              <h2 className="text-lg font-semibold">Performance by Specialty</h2>
              <Button variant="light" size="sm" endContent={<Icon icon="lucide:arrow-right" />}>
                View Details
              </Button>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-foreground-500 text-small border-b border-divider">
                      <th className="pb-2 font-medium">Specialty</th>
                      <th className="pb-2 font-medium">Referrals</th>
                      <th className="pb-2 font-medium">Avg. Response</th>
                      <th className="pb-2 font-medium">Completion</th>
                      <th className="pb-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialtyPerformance.map((specialty) => (
                      <tr key={specialty.specialty} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{specialty.specialty}</td>
                        <td className="py-3 text-small">{specialty.referrals}</td>
                        <td className="py-3 text-small">{specialty.responseTime}</td>
                        <td className="py-3 text-small">{specialty.completion}</td>
                        <td className="py-3 text-small">
                          {specialty.trend === 'up' && (
                            <div className="flex items-center gap-1 text-success">
                              <Icon icon="lucide:trending-up" />
                              <span>Improving</span>
                            </div>
                          )}
                          {specialty.trend === 'down' && (
                            <div className="flex items-center gap-1 text-danger">
                              <Icon icon="lucide:trending-down" />
                              <span>Declining</span>
                            </div>
                          )}
                          {specialty.trend === 'stable' && (
                            <div className="flex items-center gap-1 text-warning">
                              <Icon icon="lucide:minus" />
                              <span>Stable</span>
                            </div>
                          )}
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
              <h2 className="text-lg font-semibold">Pending Authorizations</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-3">
                <div className="border border-default-200 rounded-medium p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Special Procedure</p>
                      <p className="text-small text-foreground-500">Patient: Maria Garcia</p>
                      <p className="text-small text-foreground-500">Requested by: Dr. Michael Chen</p>
                    </div>
                    <Chip size="sm" color="danger" variant="flat">Urgent</Chip>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" color="success" variant="flat">Approve</Button>
                    <Button size="sm" color="danger" variant="flat">Deny</Button>
                    <Button size="sm" variant="light">Details</Button>
                  </div>
                </div>
                
                <div className="border border-default-200 rounded-medium p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">External Referral</p>
                      <p className="text-small text-foreground-500">Patient: John Smith</p>
                      <p className="text-small text-foreground-500">Requested by: Dr. Sarah Lee</p>
                    </div>
                    <Chip size="sm" color="warning" variant="flat">Medium</Chip>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" color="success" variant="flat">Approve</Button>
                    <Button size="sm" color="danger" variant="flat">Deny</Button>
                    <Button size="sm" variant="light">Details</Button>
                  </div>
                </div>
                
                <div className="border border-default-200 rounded-medium p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Equipment Request</p>
                      <p className="text-small text-foreground-500">Department: Cardiology</p>
                      <p className="text-small text-foreground-500">Requested by: Dr. James Wilson</p>
                    </div>
                    <Chip size="sm" color="primary" variant="flat">Standard</Chip>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" color="success" variant="flat">Approve</Button>
                    <Button size="sm" color="danger" variant="flat">Deny</Button>
                    <Button size="sm" variant="light">Details</Button>
                  </div>
                </div>
              </div>
              
              <Button 
                fullWidth 
                variant="light" 
                color="primary" 
                endContent={<Icon icon="lucide:arrow-right" />}
              >
                View All Authorizations
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};