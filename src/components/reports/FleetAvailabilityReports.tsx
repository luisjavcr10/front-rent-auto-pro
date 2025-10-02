/**
 * Componente de Reportes de Disponibilidad de Flota - Análisis de utilización y disponibilidad de vehículos
 */
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Car, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Interfaces para los datos de reportes de disponibilidad
 */
interface FleetAvailabilityData {
  period: string;
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  utilization_rate: number;
  availability_rate: number;
}

interface FleetTotalStats {
  total_vehicles: number;
  average_utilization_rate: number;
  average_availability_rate: number;
  total_rental_days: number;
  total_available_days: number;
  most_utilized_period: string;
  least_utilized_period: string;
}

interface VehicleUtilization {
  vehicle_id: number;
  rental_days: number;
  available_days: number;
  maintenance_days: number;
  utilization_rate: number;
  total_revenue: number;
  Vehicle: {
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    status: string;
    daily_rate: number;
  };
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface FleetAvailabilityReportsData {
  availability_by_period: FleetAvailabilityData[];
  total_stats: FleetTotalStats;
  vehicle_utilization: VehicleUtilization[];
  status_distribution: StatusDistribution[];
  filters: {
    startDate?: string;
    endDate?: string;
    groupBy: string;
    vehicleId?: number;
    status?: string;
  };
}

/**
 * Componente principal de Reportes de Disponibilidad de Flota
 */
const FleetAvailabilityReports: React.FC = () => {
  const [data, setData] = useState<FleetAvailabilityReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'month',
    vehicleId: '',
    status: ''
  });

  /**
   * Carga los datos de reportes de disponibilidad de flota
   */
  const fetchFleetAvailabilityReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('groupBy', filters.groupBy);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/reports/fleet-availability?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setData(responseData.data);
      } else {
        setError('Error al cargar los datos de disponibilidad de flota');
      }
    } catch (err: any) {
      console.error('Error fetching fleet availability reports:', err);
      setError(err.message || 'Error al cargar los reportes de disponibilidad de flota');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    fetchFleetAvailabilityReports();
  }, []);

  /**
   * Maneja el cambio de filtros
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Aplica los filtros y recarga los datos
   */
  const applyFilters = () => {
    fetchFleetAvailabilityReports();
  };

  /**
   * Formatea números como moneda
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  /**
   * Formatea porcentajes
   */
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Formatea el período para mostrar
   */
  const formatPeriod = (period: string) => {
    if (filters.groupBy === 'month') {
      const [year, month] = period.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy', { locale: es });
    }
    return period;
  };

  /**
   * Obtiene el color según el estado del vehículo
   */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': '#10B981',
      'rented': '#3B82F6',
      'maintenance': '#F59E0B',
      'out_of_service': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  /**
   * Obtiene el nombre del estado en español
   */
  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      'available': 'Disponible',
      'rented': 'Alquilado',
      'maintenance': 'Mantenimiento',
      'out_of_service': 'Fuera de Servicio'
    };
    return names[status] || status;
  };

  /**
   * Colores para gráficos
   */
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={fetchFleetAvailabilityReports}
            className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agrupar por
            </label>
            <select
              value={filters.groupBy}
              onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="rented">Alquilado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="out_of_service">Fuera de Servicio</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo ID (opcional)
            </label>
            <input
              type="number"
              value={filters.vehicleId}
              onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
              placeholder="Todos los vehículos"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehículos</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.total_stats.total_vehicles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilización Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(data.total_stats.average_utilization_rate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibilidad Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(data.total_stats.average_availability_rate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Días de Alquiler</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.total_stats.total_rental_days.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Utilización por Período */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Utilización y Disponibilidad por Período
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.availability_by_period}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatPeriod}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              labelFormatter={formatPeriod}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="utilization_rate" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Tasa de Utilización"
            />
            <Line 
              type="monotone" 
              dataKey="availability_rate" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Tasa de Disponibilidad"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución de Estados y Vehículos por Período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Estados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución Actual de Estados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.status_distribution.map(item => ({
                  name: getStatusName(item.status),
                  value: item.count,
                  percentage: item.percentage
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.value} (${entry.percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.status_distribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getStatusColor(entry.status)} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vehículos por Estado por Período */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vehículos por Estado por Período
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.availability_by_period}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriod}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={formatPeriod}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="available_vehicles" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                name="Disponibles"
              />
              <Area 
                type="monotone" 
                dataKey="rented_vehicles" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6"
                name="Alquilados"
              />
              <Area 
                type="monotone" 
                dataKey="maintenance_vehicles" 
                stackId="1"
                stroke="#F59E0B" 
                fill="#F59E0B"
                name="Mantenimiento"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Vehículos por Utilización */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Vehículos por Utilización
        </h3>
        <div className="space-y-3">
          {data.vehicle_utilization.slice(0, 10).map((vehicle, index) => (
            <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-4">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {vehicle.Vehicle.brand} {vehicle.Vehicle.model} ({vehicle.Vehicle.year})
                  </p>
                  <p className="text-sm text-gray-600">
                    {vehicle.Vehicle.license_plate} • {getStatusName(vehicle.Vehicle.status)} • {formatCurrency(vehicle.Vehicle.daily_rate)}/día
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPercentage(vehicle.utilization_rate)}
                </p>
                <p className="text-sm text-gray-600">
                  {vehicle.rental_days} días alquilado
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {formatCurrency(vehicle.total_revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Estados */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen Detallado por Estado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.status_distribution.map((status, index) => (
            <div key={status.status} className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor(status.status) }}
                ></div>
                <h4 className="font-semibold text-gray-900">
                  {getStatusName(status.status)}
                </h4>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {status.count}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPercentage(status.percentage)} del total
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Rendimiento de Flota
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Período de Mayor Utilización:</span>
              <span className="font-semibold text-green-700">
                {formatPeriod(data.total_stats.most_utilized_period)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Período de Menor Utilización:</span>
              <span className="font-semibold text-red-700">
                {formatPeriod(data.total_stats.least_utilized_period)}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Días Disponibles:</span>
              <span className="font-semibold text-blue-700">
                {data.total_stats.total_available_days.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Días de Alquiler:</span>
              <span className="font-semibold text-purple-700">
                {data.total_stats.total_rental_days.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetAvailabilityReports;