/**
 * Componente de ruta protegida para manejar la autenticación
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'gestor_flota' | 'cliente';
}

/**
 * Componente que protege rutas basado en autenticación y roles
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.role !== requiredRole) {
    // Si es admin, puede acceder a todo
    if (user?.role === 'admin') {
      return <>{children}</>;
    }
    
    // Si es gestor_flota, puede acceder a rutas de gestor y cliente
    if (user?.role === 'gestor_flota' && requiredRole === 'cliente') {
      return <>{children}</>;
    }
    
    // Si no tiene permisos, mostrar página de acceso denegado
    return (
      <div className="access-denied-screen">
        <div className="access-denied-content">
          <div className="access-denied-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="access-denied-title">Acceso Denegado</h2>
          <p className="access-denied-message">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary access-denied-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;