/**
 * Servicio de API para comunicarse con el backend local
 */
import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  Vehicle,
  Customer,
  Rental,
  Maintenance,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  PaginatedResponse,
  VehicleFormData,
  CustomerFormData,
  RentalFormData,
  VehicleFilters,
  RentalFilters,
  DashboardStats
} from '../types';

/**
 * Configuración base de la API
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');

        // Validar que el token sea válido antes de enviarlo
        if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Normaliza respuestas paginadas desde distintos esquemas del backend
   * Acepta formas como:
   * - { data: T[], pagination }
   * - { customers|vehicles|rentals|maintenances: T[], pagination }
   * - { data: { customers|vehicles|rentals|maintenances: T[], pagination } }
   */
  private normalizePaginated<T>(payload: any, key: string): PaginatedResponse<T> {
    const items: T[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.[key])
        ? payload[key]
        : Array.isArray(payload?.data?.[key])
          ? payload.data[key]
          : [];

    const pagination = payload?.pagination
      ?? payload?.data?.pagination
      ?? {
        page: typeof payload?.page === 'number' ? payload.page : 1,
        limit: typeof payload?.limit === 'number' ? payload.limit : (Array.isArray(items) ? items.length : 0),
        total: typeof payload?.total === 'number' ? payload.total : (Array.isArray(items) ? items.length : 0),
        totalPages: typeof payload?.totalPages === 'number' ? payload.totalPages : 1,
      };

    const success = typeof payload?.success === 'boolean' ? payload.success : true;
    const message = typeof payload?.message === 'string' ? payload.message : '';

    return { success, message, data: items, pagination };
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/profile');
    const payload = response.data || {};
    const user: User = payload?.data?.user ?? payload?.user ?? payload?.data;
    return {
      success: typeof payload.success === 'boolean' ? payload.success : true,
      message: typeof payload.message === 'string' ? payload.message : '',
      data: user,
    };
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    const response = await this.api.put<ApiResponse<void>>('/auth/change-password', data);
    return response.data;
  }

  // Métodos de vehículos
  async getVehicles(filters?: VehicleFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Vehicle>> {
    const response = await this.api.get('/vehicles', { params: filters });
    return this.normalizePaginated<Vehicle>(response.data, 'vehicles');
  }

  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await this.api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(data: VehicleFormData): Promise<ApiResponse<Vehicle>> {
    const response = await this.api.post<ApiResponse<Vehicle>>('/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: Partial<VehicleFormData>): Promise<ApiResponse<Vehicle>> {
    const response = await this.api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/vehicles/${id}`);
    return response.data;
  }

  async getAvailableVehicles(startDate: string, endDate: string): Promise<ApiResponse<Vehicle[]>> {
    const response = await this.api.get('/vehicles/available', {
      params: { start_date: startDate, end_date: endDate }
    });
    const payload = response.data;
    const vehicles: Vehicle[] = Array.isArray(payload?.data?.vehicles)
      ? payload.data.vehicles
      : Array.isArray(payload?.vehicles)
        ? payload.vehicles
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
    return {
      success: typeof payload?.success === 'boolean' ? payload.success : true,
      message: typeof payload?.message === 'string' ? payload.message : '',
      data: vehicles,
    };
  }

  async updateVehicleMileage(id: string, mileage: number): Promise<ApiResponse<Vehicle>> {
    const response = await this.api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}/mileage`, { mileage });
    return response.data;
  }

  // Métodos de clientes
  async getCustomers(filters?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Customer>> {
    const response = await this.api.get('/customers', { params: filters });
    return this.normalizePaginated<Customer>(response.data, 'customers');
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    const response = await this.api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: CustomerFormData): Promise<ApiResponse<Customer>> {
    const response = await this.api.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> {
    const response = await this.api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  }

  // Métodos de alquileres
  async getRentals(filters?: RentalFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Rental>> {
    const response = await this.api.get('/rentals', { params: filters });
    return this.normalizePaginated<Rental>(response.data, 'rentals');
  }

  async getRentalById(id: string): Promise<ApiResponse<Rental>> {
    const response = await this.api.get<ApiResponse<Rental>>(`/rentals/${id}`);
    return response.data;
  }

  async createRental(data: RentalFormData): Promise<ApiResponse<Rental>> {
    const response = await this.api.post<ApiResponse<Rental>>('/rentals', data);
    return response.data;
  }

  async updateRental(id: string, data: Partial<RentalFormData>): Promise<ApiResponse<Rental>> {
    const response = await this.api.put<ApiResponse<Rental>>(`/rentals/${id}`, data);
    return response.data;
  }

  async cancelRental(id: string): Promise<ApiResponse<Rental>> {
    const response = await this.api.patch<ApiResponse<Rental>>(`/rentals/${id}/cancel`);
    return response.data;
  }

  async completeRental(id: string, data: {
    actual_return_date: string;
    return_mileage?: number;
    fuel_level_return?: number;
    damage_notes_return?: string;
  }): Promise<ApiResponse<Rental>> {
    const response = await this.api.patch<ApiResponse<Rental>>(`/rentals/${id}/complete`, data);
    return response.data;
  }

  async startRental(id: string): Promise<ApiResponse<Rental>> {
    const response = await this.api.put<ApiResponse<Rental>>(`/rentals/${id}/start`);
    return response.data;
  }

  // Métodos de mantenimiento
  async getMaintenances(filters?: { 
    vehicle_id?: string; 
    status?: string; 
    priority?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<PaginatedResponse<Maintenance>> {
    const response = await this.api.get('/maintenances', { params: filters });
    return this.normalizePaginated<Maintenance>(response.data, 'maintenances');
  }

  async getMaintenanceById(id: string): Promise<ApiResponse<Maintenance>> {
    const response = await this.api.get<ApiResponse<Maintenance>>(`/maintenances/${id}`);
    return response.data;
  }

  async createMaintenance(data: {
    vehicle_id: string;
    maintenance_type: 'preventive' | 'corrective' | 'emergency';
    title: string;
    description?: string;
    scheduled_date: string;
    estimated_cost?: number;
    service_provider?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  }): Promise<ApiResponse<Maintenance>> {
    const response = await this.api.post<ApiResponse<Maintenance>>('/maintenances', data);
    return response.data;
  }

  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<ApiResponse<Maintenance>> {
    const response = await this.api.put<ApiResponse<Maintenance>>(`/maintenances/${id}`, data);
    return response.data;
  }

  async completeMaintenance(id: string, data: {
    completed_date: string;
    actual_cost?: number;
    mileage_at_maintenance?: number;
    parts_replaced?: Array<{
      name: string;
      quantity: number;
      cost: number;
      part_number?: string;
    }>;
    labor_hours?: number;
    labor_cost?: number;
    invoice_number?: string;
    notes?: string;
  }): Promise<ApiResponse<Maintenance>> {
    const response = await this.api.patch<ApiResponse<Maintenance>>(`/maintenances/${id}/complete`, data);
    return response.data;
  }

  async startMaintenance(id: string): Promise<ApiResponse<Maintenance>> {
    const response = await this.api.put<ApiResponse<Maintenance>>(`/maintenances/${id}/start`);
    return response.data;
  }

  // Métodos de estadísticas y dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  }

  async getVehicleStats(): Promise<ApiResponse<{
    by_status: Record<string, number>;
    total: number;
    maintenance_due: number;
  }>> {
    const response = await this.api.get('/vehicles/stats');
    return response.data;
  }

  // Métodos de usuarios (solo para admin)
  async getUsers(filters?: { search?: string; role?: string; page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get('/auth/users', { params: filters });
    return this.normalizePaginated<User>(response.data, 'users');
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>(`/auth/users/${id}`, data);
    return response.data;
  }

  // Método para subir archivos
  async uploadFile(file: File, type: 'vehicle' | 'customer' | 'rental' | 'maintenance'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Test methods for debugging
  async testAuth(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/auth/test-auth');
    return response.data;
  }

  async testAdmin(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/auth/test-admin');
    return response.data;
  }
}

// Instancia singleton del servicio de API
export const apiService = new ApiService();
export default apiService;