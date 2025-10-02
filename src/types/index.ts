/**
 * Tipos de datos para la aplicación RentAutoPro
 */

// Tipos de usuario y autenticación
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'gestor_flota' | 'cliente';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'cliente';
}

// Tipos de vehículos
export interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'van' | 'convertible' | 'coupe';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  daily_rate: number;
  current_mileage: number;
  last_maintenance_mileage?: number;
  next_maintenance_mileage?: number;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  is_active: boolean;
  purchase_date?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
  vin?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de clientes
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: 'dni' | 'passport' | 'license';
  document_number: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  driver_license_number?: string;
  driver_license_expiry?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de alquileres
export interface Rental {
  id: string;
  rental_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  pickup_location: string;
  return_location: string;
  daily_rate: number;
  total_days: number;
  subtotal: number;
  tax_amount: number;
  additional_charges: number;
  discount_amount: number;
  total_amount: number;
  deposit_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  rental_status: 'reserved' | 'active' | 'completed' | 'cancelled';
  pickup_mileage?: number;
  return_mileage?: number;
  fuel_level_pickup?: number;
  fuel_level_return?: number;
  damage_notes_pickup?: string;
  damage_notes_return?: string;
  additional_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  customer?: Customer;
  vehicle?: Vehicle;
  created_by_user?: User;
}

// Tipos de mantenimiento
export interface Maintenance {
  id: string;
  maintenance_number: string;
  vehicle_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency';
  title: string;
  description?: string;
  scheduled_date: string;
  completed_date?: string;
  mileage_at_maintenance?: number;
  estimated_cost?: number;
  actual_cost?: number;
  service_provider?: string;
  parts_replaced?: Array<{
    name: string;
    quantity: number;
    cost: number;
    part_number?: string;
  }>;
  labor_hours?: number;
  labor_cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  next_maintenance_mileage?: number;
  next_maintenance_date?: string;
  warranty_expiry?: string;
  invoice_number?: string;
  notes?: string;
  created_by: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  vehicle?: Vehicle;
  created_by_user?: User;
  completed_by_user?: User;
}

// Tipos para formularios
export interface VehicleFormData {
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: Vehicle['vehicle_type'];
  fuel_type: Vehicle['fuel_type'];
  transmission: Vehicle['transmission'];
  seats: number;
  daily_rate: number;
  current_mileage: number;
  purchase_date?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
  vin?: string;
  notes?: string;
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: Customer['document_type'];
  document_number: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  driver_license_number?: string;
  driver_license_expiry?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface RentalFormData {
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  daily_rate: number;
  additional_charges?: number;
  discount_amount?: number;
  deposit_amount: number;
  additional_notes?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para filtros y búsquedas
export interface VehicleFilters {
  status?: Vehicle['status'];
  vehicle_type?: Vehicle['vehicle_type'];
  fuel_type?: Vehicle['fuel_type'];
  transmission?: Vehicle['transmission'];
  min_rate?: number;
  max_rate?: number;
  search?: string;
}

export interface RentalFilters {
  status?: Rental['rental_status'];
  payment_status?: Rental['payment_status'];
  start_date?: string;
  end_date?: string;
  customer_id?: string;
  vehicle_id?: string;
  search?: string;
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  vehicles: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    out_of_service: number;
  };
  rentals: {
    active: number;
    completed_today: number;
    pending_returns: number;
    overdue: number;
  };
  revenue: {
    today: number;
    this_month: number;
    this_year: number;
  };
  maintenance: {
    scheduled: number;
    overdue: number;
    in_progress: number;
  };
}

// Tipos para contexto de autenticación
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}