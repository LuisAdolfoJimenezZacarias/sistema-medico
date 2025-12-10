import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/auth-context';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar maxWidth="full" className="border-b border-divider">
        <NavbarBrand>
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Icon icon="lucide:shield" className="text-primary text-2xl" />
            <p className="font-bold text-inherit">Sistema de Referencias Medicas</p>
          </Link>
        </NavbarBrand>
        
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/admin/dashboard')}>
            <Link to="/admin/dashboard" className={`flex items-center gap-1 ${isActive('/admin/dashboard') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:layout-dashboard" />
              <span>Dashboard</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/admin/users')}>
            <Link to="/admin/users" className={`flex items-center gap-1 ${isActive('/admin/users') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:users" />
              <span>Usuarios</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/admin/appointments')}>
            <Link to="/admin/appointments" className={`flex items-center gap-1 ${isActive('/admin/appointments') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:calendar" />
              <span>Citas</span>
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/admin/documents')}>
            <Link to="/admin/documents" className={`flex items-center gap-1 ${isActive('/admin/documents') ? 'text-primary' : 'text-foreground-500'}`}>
              <Icon icon="lucide:file-text" />
              <span>Referencias Emitidas</span>
            </Link>
          </NavbarItem>
        </NavbarContent>
        
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" isIconOnly>
                <Avatar
                  name={user?.name || "Admin"}
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
                  <Icon icon="lucide:shield" />
                  <span>Administrator</span>
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
          <Link to="/admin/dashboard" className={`flex flex-col items-center p-2 ${isActive('/admin/dashboard') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:layout-dashboard" className="text-xl" />
            <span className="text-tiny">Dashboard</span>
          </Link>
          <Link to="/admin/users" className={`flex flex-col items-center p-2 ${isActive('/admin/users') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:users" className="text-xl" />
            <span className="text-tiny">Users</span>
          </Link>
          <Link to="/admin/appointments" className={`flex flex-col items-center p-2 ${isActive('/admin/appointments') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:calendar" className="text-xl" />
            <span className="text-tiny">Appointments</span>
          </Link>
          <Link to="/admin/documents" className={`flex flex-col items-center p-2 ${isActive('/admin/documents') ? 'text-primary' : 'text-foreground-500'}`}>
            <Icon icon="lucide:file-text" className="text-xl" />
            <span className="text-tiny">Referencias Emitidas</span>
          </Link>
        </div>
      </div>
      
      <main className="flex-grow p-4 sm:p-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  );
};