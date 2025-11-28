import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/auth-context';

interface LayoutProps {
  children: React.ReactNode;
}

export const LegacyLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar maxWidth="full" className="border-b border-divider">
        <NavbarBrand>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Icon icon="lucide:activity" className="text-primary text-2xl" />
            <p className="font-bold text-inherit">MedRef System</p>
          </Link>
        </NavbarBrand>
        
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/dashboard')}>
            <Link to="/dashboard" className={`flex items-center gap-1 ${isActive('/dashboard') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:layout-dashboard" />
              <span>Dashboard</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/patients')}>
            <Link to="/patients" className={`flex items-center gap-1 ${isActive('/patients') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:users" />
              <span>Patients</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/referrals')}>
            <Link to="/referrals" className={`flex items-center gap-1 ${isActive('/referrals') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:send" />
              <span>Referrals</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/counter-referrals')}>
            <Link to="/counter-referrals" className={`flex items-center gap-1 ${isActive('/counter-referrals') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:reply" />
              <span>Counter-Referrals</span>
            </Link>
          </NavbarItem>
        </NavbarContent>
        
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" isIconOnly>
                <Avatar
                  name={user?.name || "User"}
                  size="sm"
                  className="transition-transform"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-bold">{user?.name}</p>
                <p className="text-small text-default-500">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="facility">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:building" />
                  <span>{user?.facility}</span>
                </div>
              </DropdownItem>
              <DropdownItem key="role">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" />
                  <span>{user?.role}</span>
                </div>
              </DropdownItem>
              <DropdownItem key="settings">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:settings" />
                  <span>Settings</span>
                </div>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={logout}>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:log-out" />
                  <span>Log Out</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
      
      {/* Mobile navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-content1 border-t border-divider z-50">
        <div className="flex justify-around py-2">
          <Link to="/dashboard" className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:layout-dashboard" className="text-xl" />
            <span className="text-tiny">Dashboard</span>
          </Link>
          <Link to="/patients" className={`flex flex-col items-center p-2 ${isActive('/patients') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:users" className="text-xl" />
            <span className="text-tiny">Patients</span>
          </Link>
          <Link to="/referrals" className={`flex flex-col items-center p-2 ${isActive('/referrals') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:send" className="text-xl" />
            <span className="text-tiny">Referrals</span>
          </Link>
          <Link to="/counter-referrals" className={`flex flex-col items-center p-2 ${isActive('/counter-referrals') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:reply" className="text-xl" />
            <span className="text-tiny">Counter</span>
          </Link>
        </div>
      </div>
      
      <main className="flex-grow p-4 sm:p-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  );
};