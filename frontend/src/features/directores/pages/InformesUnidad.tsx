import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/auth-context';

export const InformesUnidad: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState('performance');
  
  // Mock performance data
  const performanceData = [
    { metric: 'Average Response Time', value: '2.3 days', target: '2.0 days', status: 'warning' },
    { metric: 'Referral Completion Rate', value: '87%', target: '90%', status: 'warning' },
    { metric: 'Patient Satisfaction', value: '4.6/5', target: '4.5/5', status: 'success' },
    { metric: 'Specialist Availability', value: '76%', target: '80%', status: 'warning' },
    { metric: 'Documentation Compliance', value: '98%', target: '95%', status: 'success' },
  ];
  
  // Mock referral volume data
  const referralVolumeData = [
    { department: 'Cardiology', incoming: 56, outgoing: 12, completed: 48, pending: 20 },
    { department: 'Neurology', incoming: 42, outgoing: 8, completed: 35, pending: 15 },
    { department: 'Dermatology', incoming: 38, outgoing: 5, completed: 36, pending: 7 },
    { department: 'Orthopedics', incoming: 45, outgoing: 15, completed: 35, pending: 25 },
    { department: 'Ophthalmology', incoming: 32, outgoing: 6, completed: 27, pending: 11 },
  ];
  
  // Mock quality metrics data
  const qualityMetricsData = [
    { metric: 'Referral Appropriateness', score: '92%', previousScore: '88%', change: 'up' },
    { metric: 'Clinical Information Quality', score: '85%', previousScore: '82%', change: 'up' },
    { metric: 'Follow-up Compliance', score: '78%', previousScore: '80%', change: 'down' },
    { metric: 'Specialist Feedback Score', score: '4.2/5', previousScore: '4.0/5', change: 'up' },
    { metric: 'Patient Outcome Tracking', score: '76%', previousScore: '70%', change: 'up' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Reports</h1>
          <p className="text-foreground-500">{user?.facility} • Unit Director</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:download" />}>
            Export Reports
          </Button>
          <Button variant="flat" startContent={<Icon icon="lucide:printer" />}>
            Print
          </Button>
        </div>
      </div>
      
      <Tabs 
        aria-label="Report categories" 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab as any}
        className="mb-4"
      >
        <Tab key="performance" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:bar-chart-2" />
            <span>Performance Metrics</span>
          </div>
        } />
        <Tab key="volume" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:activity" />
            <span>Referral Volume</span>
          </div>
        } />
        <Tab key="quality" title={
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check-circle" />
            <span>Quality Metrics</span>
          </div>
        } />
      </Tabs>
      
      {selectedTab === 'performance' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-default-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Key Performance Indicators</h2>
              <div className="flex items-center gap-2 text-small text-foreground-500">
                <span>Time Period:</span>
                <Button size="sm" variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                  Last 30 Days
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-foreground-500 text-small border-b border-divider">
                      <th className="pb-2 font-medium">Metric</th>
                      <th className="pb-2 font-medium">Current Value</th>
                      <th className="pb-2 font-medium">Target</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((item) => (
                      <tr key={item.metric} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{item.metric}</td>
                        <td className="py-3 text-small font-medium">{item.value}</td>
                        <td className="py-3 text-small">{item.target}</td>
                        <td className="py-3 text-small">
                          <Chip 
                            size="sm" 
                            color={item.status === 'success' ? 'success' : 'warning'}
                            variant="flat"
                          >
                            {item.status === 'success' ? 'Meeting Target' : 'Below Target'}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="border border-default-200">
              <CardHeader>
                <h2 className="text-lg font-semibold">Response Time Trend</h2>
              </CardHeader>
              <CardBody className="h-80 flex items-center justify-center">
                <div className="text-center text-foreground-500">
                  <Icon icon="lucide:bar-chart-2" className="text-5xl mb-2" />
                  <p>Chart visualization would appear here</p>
                  <p className="text-small">Average response time trend over the last 6 months</p>
                </div>
              </CardBody>
            </Card>
            
            <Card className="border border-default-200">
              <CardHeader>
                <h2 className="text-lg font-semibold">Completion Rate Trend</h2>
              </CardHeader>
              <CardBody className="h-80 flex items-center justify-center">
                <div className="text-center text-foreground-500">
                  <Icon icon="lucide:line-chart" className="text-5xl mb-2" />
                  <p>Chart visualization would appear here</p>
                  <p className="text-small">Referral completion rate trend over the last 6 months</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>
      )}
      
      {selectedTab === 'volume' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-default-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Referral Volume by Department</h2>
              <div className="flex items-center gap-2 text-small text-foreground-500">
                <span>Time Period:</span>
                <Button size="sm" variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                  Last Quarter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-foreground-500 text-small border-b border-divider">
                      <th className="pb-2 font-medium">Department</th>
                      <th className="pb-2 font-medium">Incoming</th>
                      <th className="pb-2 font-medium">Outgoing</th>
                      <th className="pb-2 font-medium">Completed</th>
                      <th className="pb-2 font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralVolumeData.map((item) => (
                      <tr key={item.department} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{item.department}</td>
                        <td className="py-3 text-small font-medium">{item.incoming}</td>
                        <td className="py-3 text-small">{item.outgoing}</td>
                        <td className="py-3 text-small">{item.completed}</td>
                        <td className="py-3 text-small">
                          <Chip 
                            size="sm" 
                            color={item.pending > 20 ? 'warning' : 'primary'}
                            variant="flat"
                          >
                            {item.pending}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="border border-default-200">
              <CardHeader>
                <h2 className="text-lg font-semibold">Monthly Referral Volume</h2>
              </CardHeader>
              <CardBody className="h-80 flex items-center justify-center">
                <div className="text-center text-foreground-500">
                  <Icon icon="lucide:bar-chart" className="text-5xl mb-2" />
                  <p>Chart visualization would appear here</p>
                  <p className="text-small">Monthly referral volume for the past 12 months</p>
                </div>
              </CardBody>
            </Card>
            
            <Card className="border border-default-200">
              <CardHeader>
                <h2 className="text-lg font-semibold">Referral Distribution</h2>
              </CardHeader>
              <CardBody className="h-80 flex items-center justify-center">
                <div className="text-center text-foreground-500">
                  <Icon icon="lucide:pie-chart" className="text-5xl mb-2" />
                  <p>Chart visualization would appear here</p>
                  <p className="text-small">Distribution of referrals by specialty</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>
      )}
      
      {selectedTab === 'quality' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-default-200">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Quality Metrics</h2>
              <div className="flex items-center gap-2 text-small text-foreground-500">
                <span>Time Period:</span>
                <Button size="sm" variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                  Last Quarter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-foreground-500 text-small border-b border-divider">
                      <th className="pb-2 font-medium">Metric</th>
                      <th className="pb-2 font-medium">Current Score</th>
                      <th className="pb-2 font-medium">Previous Score</th>
                      <th className="pb-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityMetricsData.map((item) => (
                      <tr key={item.metric} className="border-b border-divider last:border-b-0">
                        <td className="py-3 text-small">{item.metric}</td>
                        <td className="py-3 text-small font-medium">{item.score}</td>
                        <td className="py-3 text-small">{item.previousScore}</td>
                        <td className="py-3 text-small">
                          {item.change === 'up' && (
                            <div className="flex items-center gap-1 text-success">
                              <Icon icon="lucide:trending-up" />
                              <span>Improving</span>
                            </div>
                          )}
                          {item.change === 'down' && (
                            <div className="flex items-center gap-1 text-danger">
                              <Icon icon="lucide:trending-down" />
                              <span>Declining</span>
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
          
          <Card className="border border-default-200 mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Quality Improvement Opportunities</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="border border-default-200 rounded-medium p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Improve Follow-up Compliance</h3>
                      <p className="text-small text-foreground-500 mt-1">
                        Follow-up compliance has decreased by 2% compared to the previous quarter. 
                        Consider implementing automated reminders for patients and providers.
                      </p>
                    </div>
                    <Chip size="sm" color="warning" variant="flat">High Priority</Chip>
                  </div>
                </div>
                
                <div className="border border-default-200 rounded-medium p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Enhance Specialist Availability</h3>
                      <p className="text-small text-foreground-500 mt-1">
                        Current specialist availability is at 76%, below the target of 80%. 
                        Review scheduling practices and consider expanding telemedicine options.
                      </p>
                    </div>
                    <Chip size="sm" color="warning" variant="flat">High Priority</Chip>
                  </div>
                </div>
                
                <div className="border border-default-200 rounded-medium p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Reduce Response Time for Orthopedics</h3>
                      <p className="text-small text-foreground-500 mt-1">
                        Orthopedics department has the longest average response time at 3.2 days.
                        Investigate bottlenecks and implement process improvements.
                      </p>
                    </div>
                    <Chip size="sm" color="primary" variant="flat">Medium Priority</Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
};