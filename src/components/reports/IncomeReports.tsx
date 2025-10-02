/**
 * Componente de Reportes de Ingresos - Muestra análisis detallado de ingresos por alquileres
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
  Cell
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car,
  Filter,
  Download
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import apiService from '../../services/api';

/**
 * Interfaces para los datos de reportes
 */
interface IncomeData {
  period: string;
  total_rentals: number;
  total_income: number;
  average_rental_amount: number;
  total_daily_rates: number;
}

interface TotalStats {
  total_rentals: number;
  total_income: number;
  average_rental_amount: number;
  highest_rental: number;
  lowest_rental: number;
}

interface TopVehicle {
  vehicle_id: number;
  rental_count: number;
  total_income: number;
  Vehicle: {
    brand: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

interface TopCustomer {
  customer_id: number;
  rental_count: number;
  total_spent: number;
  Customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface IncomeReportsData {
  income_by_period: IncomeData[];
  total_stats: TotalStats;
  top_vehicles: TopVehicle[];
  top_customers: TopCustomer[];
  filters: {
    startDate?: string;
    endDate?: string;
    groupBy: string;
    vehicleId?: number;
  };
}

/**
 * Componente principal de Reportes de Ingresos
 */
const IncomeReports: React.FC = () => {
  const [data, setData] = useState<IncomeReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'month',
    vehicleId: ''
  });

  /**
   * Carga los datos de reportes de ingresos
   */
  const fetchIncomeReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('groupBy', filters.groupBy);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/reports/income?${params.toString()}`, {
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
        setError('Error al cargar los datos de ingresos');
      }
    } catch (err: any) {
      console.error('Error fetching income reports:', err);
      setError(err.message || 'Error al cargar los reportes de ingresos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    fetchIncomeReports();
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
    fetchIncomeReports();
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
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
            onClick={fetchIncomeReports}
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_stats.total_income)}
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
              <p className="text-sm font-medium text-gray-600">Total Alquileres</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.total_stats.total_rentals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio por Alquiler</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_stats.average_rental_amount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alquiler Máximo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_stats.highest_rental)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Ingresos por Período */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ingresos por Período
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.income_by_period}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatPeriod}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
              labelFormatter={formatPeriod}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_income" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Ingresos Totales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Alquileres por Período */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Número de Alquileres por Período
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.income_by_period}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatPeriod}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [value, 'Alquileres']}
              labelFormatter={formatPeriod}
            />
            <Legend />
            <Bar 
              dataKey="total_rentals" 
              fill="#10B981" 
              name="Número de Alquileres"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Vehículos y Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vehículos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Vehículos por Ingresos
          </h3>
          <div className="space-y-3">
            {data.top_vehicles.slice(0, 5).map((vehicle, index) => (
              <div key={vehicle.vehicle_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {vehicle.Vehicle.brand} {vehicle.Vehicle.model} ({vehicle.Vehicle.year})
                    </p>
                    <p className="text-sm text-gray-600">
                      {vehicle.Vehicle.license_plate} • {vehicle.rental_count} alquileres
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(vehicle.total_income)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Clientes por Gastos
          </h3>
          <div className="space-y-3">
            {data.top_customers.slice(0, 5).map((customer, index) => (
              <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.Customer.first_name} {customer.Customer.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customer.Customer.email} • {customer.rental_count} alquileres
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(customer.total_spent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeReports;