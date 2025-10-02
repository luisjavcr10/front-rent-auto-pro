/**
 * Componente de notificaciones toast
 */
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/solid';
import type { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

/**
 * Componente individual de notificación toast
 */
const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="toast-icon toast-icon-success" />;
      case 'error':
        return <XCircleIcon className="toast-icon toast-icon-error" />;
      case 'warning':
        return <ExclamationTriangleIcon className="toast-icon toast-icon-warning" />;
      case 'info':
        return <InformationCircleIcon className="toast-icon toast-icon-info" />;
      default:
        return <InformationCircleIcon className="toast-icon toast-icon-default" />;
    }
  };

  const getToastClass = () => {
    switch (notification.type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
        return 'toast-info';
      default:
        return 'toast-default';
    }
  };

  return (
    <div className={`toast ${getToastClass()}`}>
      <div className="toast-content">
        <div className="toast-body">
          <div className="toast-icon-container">
            {getIcon()}
          </div>
          <div className="toast-text">
            <p className="toast-title">
              {notification.title}
            </p>
            {notification.message && (
              <p className="toast-message">
                {notification.message}
              </p>
            )}
          </div>
          <div className="toast-close-container">
            <button
              className="toast-close-btn"
              onClick={() => onClose(notification.id)}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="toast-close-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

/**
 * Contenedor de notificaciones
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  notifications, 
  onClose 
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      <div className="notification-list">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;