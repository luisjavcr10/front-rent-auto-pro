/**
 * Layout principal de la aplicación
 */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationContainer } from '../components/NotificationToast';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Componente de sidebar
 */
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  //const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Vehículos', href: '/vehicles', icon: TruckIcon },
    { name: 'Clientes', href: '/customers', icon: UsersIcon },
    { name: 'Alquileres', href: '/rentals', icon: DocumentTextIcon },
    { name: 'Mantenimiento', href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="sidebar-mobile-overlay">
          <div className="sidebar-mobile-backdrop" onClick={onClose} />
          <div className="sidebar-mobile-content">
            <div className="sidebar-close-button-container">
              <button
                type="button"
                className="sidebar-close-button"
                onClick={onClose}
              >
                <XMarkIcon className="icon-sm text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <div className="sidebar-desktop-content">
          <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
        </div>
      </div>
    </>
  );
};

/**
 * Contenido del sidebar
 */
const SidebarContent: React.FC<{
  navigation: Array<{ name: string; href: string; icon: React.ComponentType<any> }>;
  user: any;
  onLogout: () => void;
}> = ({ navigation, user, onLogout }) => {
  const location = useLocation();

  return (
    <>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h1 className="sidebar-title">RentAutoPro</h1>
        </div>
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-nav-item ${
                  isActive
                    ? 'sidebar-nav-item-active'
                    : 'sidebar-nav-item-inactive'
                }`}
              >
                <item.icon
                  className={`sidebar-nav-icon ${
                    isActive ? 'sidebar-nav-icon-active' : 'sidebar-nav-icon-inactive'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div>
            <UserCircleIcon className="sidebar-user-avatar" />
          </div>
          <div className="sidebar-user-details">
             <p className="sidebar-user-name">{user?.first_name} {user?.last_name}</p>
             <p className="sidebar-user-email">{user?.email}</p>
           </div>
          <button
            onClick={onLogout}
            className="sidebar-logout-button"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="icon-xs" />
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * Componente de header
 */
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <button
              type="button"
              className="header-menu-button"
              onClick={onMenuClick}
            >
              <Bars3Icon className="icon-sm" />
            </button>
          </div>
          <div className="header-right">
            <div className="header-welcome">
               <span className="header-welcome-text">
                 Bienvenido, {user?.first_name}
               </span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Layout principal
 */
const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="page-content">
          <div className="page-content-inner">
            <div className="page-content-container">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </div>
  );
};

export default MainLayout;