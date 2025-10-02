/**
 * Componente principal de la aplicación RentAutoPro
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Maintenance from './pages/Maintenance';

/**
 * Componente de rutas de la aplicación
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Páginas de vehículos */}
        <Route path="vehicles" element={<Vehicles />} />
        
        {/* Páginas de clientes */}
        <Route path="customers" element={<Customers />} />
        
        {/* Páginas de alquileres */}
        <Route path="rentals" element={<Rentals />} />
        
        {/* Páginas de mantenimiento */}
        <Route path="maintenance" element={<Maintenance />} />
      </Route>

      {/* Ruta por defecto - redirigir a dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Componente principal de la aplicación
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
