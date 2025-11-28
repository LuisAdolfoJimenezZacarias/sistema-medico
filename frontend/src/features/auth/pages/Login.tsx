import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Input, Button, Checkbox } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../../context/auth-context';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState('doctor');
  
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const toggleVisibility = () => setIsVisible(!isVisible);
  
  const roleIdMap: Record<string, number> = {
    doctor: 1,
    admin: 2,
    director: 3,
    patient: 4
  };

  const normalizeRole = (r?: string) => {
    if (!r) return null;
    const s = String(r).toLowerCase().trim();
    if (s.includes('medic') || s.includes('doctor')) return 'doctor';
    if (s.includes('admin') || s.includes('administrativ') || s.includes('administrador')) return 'admin';
    if (s.includes('director')) return 'director';
    if (s.includes('pacient') || s.includes('patient')) return 'patient';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailTrimmed = email.trim();
    const passwordTrimmed = (password ?? '').trim();
    const selectedRoleId = roleIdMap[selectedRole] ?? null;

    const res = await login(emailTrimmed, passwordTrimmed, selectedRoleId);
    setIsLoading(false);

    if (!res || res.status !== 200) {
      alert(res?.data?.message ?? 'Login failed');
      return;
    }

    // prioridad: rol devuelto por backend; fallback: rol seleccionado en UI
    const backendRoleName = res.data?.user?.role ?? null;
    const routeKey = normalizeRole(backendRoleName) ?? selectedRole ?? 'doctor';

    navigate(`/${routeKey}/dashboard`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardBody className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="p-3 rounded-full bg-primary-100">
                <Icon icon="lucide:activity" className="text-3xl text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Medical Referral System</h1>
              <p className="text-foreground-500">Sign in to manage patient referrals</p>
            </div>
            
            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-small font-medium">Select your role</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedRole === 'doctor' ? 'solid' : 'flat'}
                  color={selectedRole === 'doctor' ? 'primary' : 'default'}
                  className="justify-start"
                  startContent={<Icon icon="lucide:stethoscope" />}
                  onPress={() => setSelectedRole('doctor')}
                >
                  Doctor
                </Button>
                <Button
                  variant={selectedRole === 'admin' ? 'solid' : 'flat'}
                  color={selectedRole === 'admin' ? 'primary' : 'default'}
                  className="justify-start"
                  startContent={<Icon icon="lucide:shield" />}
                  onPress={() => setSelectedRole('admin')}
                >
                  Administrator
                </Button>
                <Button
                  variant={selectedRole === 'director' ? 'solid' : 'flat'}
                  color={selectedRole === 'director' ? 'primary' : 'default'}
                  className="justify-start"
                  startContent={<Icon icon="lucide:briefcase" />}
                  onPress={() => setSelectedRole('director')}
                >
                  Director
                </Button>
                <Button
                  variant={selectedRole === 'patient' ? 'solid' : 'flat'}
                  color={selectedRole === 'patient' ? 'primary' : 'default'}
                  className="justify-start"
                  startContent={<Icon icon="lucide:user" />}
                  onPress={() => setSelectedRole('patient')}
                >
                  Patient
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onValueChange={setEmail}
                startContent={<Icon icon="lucide:mail" className="text-default-400" />}
                type="email"
                isRequired
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
                endContent={
                  <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                    {isVisible ? (
                      <Icon icon="lucide:eye-off" className="text-default-400" />
                    ) : (
                      <Icon icon="lucide:eye" className="text-default-400" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                isRequired
              />
              
              <div className="flex items-center justify-between">
                <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                  Remember me
                </Checkbox>
                <Button variant="light" size="sm" className="text-primary">
                  Forgot password?
                </Button>
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                fullWidth 
                isLoading={isLoading}
                className="font-medium"
              >
                Sign In
              </Button>
            </form>
            
            {/* demo block removed */}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};