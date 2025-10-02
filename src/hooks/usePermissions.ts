/**
 * Hook personalizado para manejar permisos por roles
 */
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export interface Permissions {
  // Permisos de clientes
  canViewCustomers: boolean;
  canCreateCustomers: boolean;
  canEditCustomers: boolean;
  canDeleteCustomers: boolean;
  
  // Permisos de vehículos
  canViewVehicles: boolean;
  canCreateVehicles: boolean;
  canEditVehicles: boolean;
  canDeleteVehicles: boolean;
  
  // Permisos de alquileres
  canViewRentals: boolean;
  canCreateRentals: boolean;
  canEditRentals: boolean;
  canCancelRentals: boolean;
  canStartRentals: boolean;
  canCompleteRentals: boolean;
  
  // Permisos de mantenimiento
  canViewMaintenance: boolean;
  canCreateMaintenance: boolean;
  canEditMaintenance: boolean;
  canStartMaintenance: boolean;
  canCompleteMaintenance: boolean;
  
  // Permisos de usuarios
  canViewUsers: boolean;
  canEditUsers: boolean;
  
  // Permisos de dashboard
  canViewDashboard: boolean;
  canViewStats: boolean;
}

/**
 * Hook para obtener los permisos del usuario actual
 */
export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  
  if (!user) {
    return getDefaultPermissions();
  }
  
  return getPermissionsByRole(user.role);
};

/**
 * Obtiene permisos por defecto (sin permisos)
 */
const getDefaultPermissions = (): Permissions => ({
  canViewCustomers: false,
  canCreateCustomers: false,
  canEditCustomers: false,
  canDeleteCustomers: false,
  canViewVehicles: false,
  canCreateVehicles: false,
  canEditVehicles: false,
  canDeleteVehicles: false,
  canViewRentals: false,
  canCreateRentals: false,
  canEditRentals: false,
  canCancelRentals: false,
  canStartRentals: false,
  canCompleteRentals: false,
  canViewMaintenance: false,
  canCreateMaintenance: false,
  canEditMaintenance: false,
  canStartMaintenance: false,
  canCompleteMaintenance: false,
  canViewUsers: false,
  canEditUsers: false,
  canViewDashboard: false,
  canViewStats: false,
});

/**
 * Obtiene permisos según el rol del usuario
 */
const getPermissionsByRole = (role: User['role']): Permissions => {
  switch (role) {
    case 'admin':
      return {
        // Admin tiene todos los permisos
        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: true,
        canDeleteCustomers: true,
        canViewVehicles: true,
        canCreateVehicles: true,
        canEditVehicles: true,
        canDeleteVehicles: true,
        canViewRentals: true,
        canCreateRentals: true,
        canEditRentals: true,
        canCancelRentals: true,
        canStartRentals: true,
        canCompleteRentals: true,
        canViewMaintenance: true,
        canCreateMaintenance: true,
        canEditMaintenance: true,
        canStartMaintenance: true,
        canCompleteMaintenance: true,
        canViewUsers: true,
        canEditUsers: true,
        canViewDashboard: true,
        canViewStats: true,
      };
      
    case 'gestor_flota':
      return {
        // Gestor puede gestionar operaciones pero no usuarios
        canViewCustomers: true,
        canCreateCustomers: true,
        canEditCustomers: true,
        canDeleteCustomers: false, // Solo admin puede eliminar
        canViewVehicles: true,
        canCreateVehicles: true,
        canEditVehicles: true,
        canDeleteVehicles: false, // Solo admin puede eliminar
        canViewRentals: true,
        canCreateRentals: true,
        canEditRentals: true,
        canCancelRentals: true,
        canStartRentals: true,
        canCompleteRentals: true,
        canViewMaintenance: true,
        canCreateMaintenance: true,
        canEditMaintenance: true,
        canStartMaintenance: true,
        canCompleteMaintenance: true,
        canViewUsers: false,
        canEditUsers: false,
        canViewDashboard: true,
        canViewStats: true,
      };
      
    case 'cliente':
      return {
        // Cliente solo puede ver sus propios datos
        canViewCustomers: false, // Solo su propio perfil
        canCreateCustomers: false,
        canEditCustomers: false, // Solo su propio perfil
        canDeleteCustomers: false,
        canViewVehicles: true, // Solo vehículos disponibles
        canCreateVehicles: false,
        canEditVehicles: false,
        canDeleteVehicles: false,
        canViewRentals: true, // Solo sus propios alquileres
        canCreateRentals: false, // Los alquileres los crea el gestor/admin
        canEditRentals: false,
        canCancelRentals: false,
        canStartRentals: false,
        canCompleteRentals: false,
        canViewMaintenance: false,
        canCreateMaintenance: false,
        canEditMaintenance: false,
        canStartMaintenance: false,
        canCompleteMaintenance: false,
        canViewUsers: false,
        canEditUsers: false,
        canViewDashboard: false,
        canViewStats: false,
      };
      
    default:
      return getDefaultPermissions();
  }
};

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export const useHasPermission = (permission: keyof Permissions): boolean => {
  const permissions = usePermissions();
  return permissions[permission];
};

/**
 * Hook para verificar si el usuario tiene alguno de los permisos especificados
 */
export const useHasAnyPermission = (permissionList: (keyof Permissions)[]): boolean => {
  const permissions = usePermissions();
  return permissionList.some(permission => permissions[permission]);
};

/**
 * Hook para verificar si el usuario tiene todos los permisos especificados
 */
export const useHasAllPermissions = (permissionList: (keyof Permissions)[]): boolean => {
  const permissions = usePermissions();
  return permissionList.every(permission => permissions[permission]);
};