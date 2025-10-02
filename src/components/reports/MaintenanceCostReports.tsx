/**
 * Componente de Reportes de Costos de Mantenimiento - Análisis detallado de gastos de mantenimiento
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
  Wrench, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Car,
  Filter,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Interfaces para los datos de reportes de mantenimiento
 */
interface MaintenanceCostData {
  period: string;
  total_maintenances: number;
  total_cost: number;
  average_cost: number;
  preventive_cost: number;
  corrective_cost: number;
  emergency_cost: number;
}

interface MaintenanceTotalStats {
  total_maintenances: number;
  total_cost: number;
  average_cost: number;
  highest_cost: number;
  lowest_cost: number;
  preventive_percentage: number;
  corrective_percentage: number;
  emergency_percentage: number;
}

interface VehicleMaintenanceCost {
  vehicle_id: number;
  maintenance_count: number;
  total_cost: number;
  average_cost: number;
  Vehicle: {
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    mileage: number;
  };
}

interface MaintenanceTypeBreakdown {
  maintenance_type: string;
  count: number;
  total_cost: number;
  average_cost: number;
}

interface MaintenanceCostReportsData {
  cost_by_period: MaintenanceCostData[];
  total_stats: MaintenanceTotalStats;
  vehicle_costs: VehicleMaintenanceCost[];
  type_breakdown: MaintenanceTypeBreakdown[];
  filters: {
    startDate?: string;
    endDate?: string;
    groupBy: string;
    vehicleId?: number;
    maintenanceType?: string;
  };
}

/**
 * Componente principal de Reportes de Costos de Mantenimiento
 */
const MaintenanceCostReports: React.FC = () => {
  const [data, setData] = useState<MaintenanceCostReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'month',
    vehicleId: '',
    maintenanceType: ''
  });

  /**
   * Carga los datos de reportes de costos de mantenimiento
   */
  const fetchMaintenanceCostReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('groupBy', filters.groupBy);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.maintenanceType) params.append('maintenanceType', filters.maintenanceType);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/reports/maintenance-costs?${params.toString()}`, {
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
        setError('Error al cargar los datos de costos de mantenimiento');
      }
    } catch (err: any) {
      console.error('Error fetching maintenance cost reports:', err);
      setError(err.message || 'Error al cargar los reportes de costos de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    fetchMaintenanceCostReports();
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
    fetchMaintenanceCostReports();
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
   * Colores para gráficos
   */
  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4'];
  const MAINTENANCE_TYPE_COLORS = {
    'preventive': '#10B981',
    'corrective': '#F59E0B', 
    'emergency': '#EF4444'
  };

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
            onClick={fetchMaintenanceCostReports}
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
              Tipo de Mantenimiento
            </label>
            <select
              value={filters.maintenanceType}
              onChange={(e) => handleFilterChange('maintenanceType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="preventive">Preventivo</option>
              <option value="corrective">Correctivo</option>
              <option value="emergency">Emergencia</option>
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
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_stats.total_cost)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mantenimientos</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.total_stats.total_maintenances}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_stats.average_cost)}
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
              <p className="text-sm font-medium text-gray-600">% Preventivo</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.total_stats.preventive_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Costos por Período */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Costos de Mantenimiento por Período
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data.cost_by_period}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatPeriod}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelFormatter={formatPeriod}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="preventive_cost" 
              stackId="1"
              stroke="#10B981" 
              fill="#10B981"
              name="Preventivo"
            />
            <Area 
              type="monotone" 
              dataKey="corrective_cost" 
              stackId="1"
              stroke="#F59E0B" 
              fill="#F59E0B"
              name="Correctivo"
            />
            <Area 
              type="monotone" 
              dataKey="emergency_cost" 
              stackId="1"
              stroke="#EF4444" 
              fill="#EF4444"
              name="Emergencia"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Distribución por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Costos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.type_breakdown.map(item => ({
                  name: item.maintenance_type,
                  value: item.total_cost,
                  count: item.count,
                  average_cost: item.average_cost
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${((entry.value / data.total_stats.total_cost) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.type_breakdown.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={MAINTENANCE_TYPE_COLORS[entry.maintenance_type as keyof typeof MAINTENANCE_TYPE_COLORS] || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Número de Mantenimientos por Período
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.cost_by_period}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriod}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Mantenimientos']}
                labelFormatter={formatPeriod}
              />
              <Legend />
              <Bar 
                dataKey="total_maintenances" 
                fill="#8B5CF6" 
                name="Total Mantenimientos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Vehículos por Costos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vehículos con Mayores Costos de Mantenimiento
        </h3>
        <div className="space-y-3">
          {data.vehicle_costs.slice(0, 10).map((vehicle, index) => (
            <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm mr-4">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {vehicle.Vehicle.brand} {vehicle.Vehicle.model} ({vehicle.Vehicle.year})
                  </p>
                  <p className="text-sm text-gray-600">
                    {vehicle.Vehicle.license_plate} • {vehicle.maintenance_count} mantenimientos • {vehicle.Vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(vehicle.total_cost)}
                </p>
                <p className="text-sm text-gray-600">
                  Promedio: {formatCurrency(vehicle.average_cost)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desglose por Tipo de Mantenimiento */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Desglose Detallado por Tipo de Mantenimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.type_breakdown.map((type, index) => (
            <div key={type.maintenance_type} className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ 
                    backgroundColor: MAINTENANCE_TYPE_COLORS[type.maintenance_type as keyof typeof MAINTENANCE_TYPE_COLORS] || COLORS[index] 
                  }}
                ></div>
                <h4 className="font-semibold text-gray-900 capitalize">
                  {type.maintenance_type}
                </h4>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Cantidad: <span className="font-medium">{type.count}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Costo Total: <span className="font-medium">{formatCurrency(type.total_cost)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Costo Promedio: <span className="font-medium">{formatCurrency(type.average_cost)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCostReports;