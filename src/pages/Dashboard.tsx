import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Propiedades para el componente StatCard
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Componente para mostrar una tarjeta de estadística
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-semibold text-secondary-900">{value}</p>
            {trend && (
              <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal del dashboard
 */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Datos simulados - en producción vendrían de la API
  const [stats] = useState({
    vehicles: {
      total: 45,
      available: 32,
      rented: 8,
      maintenance: 3,
      out_of_service: 2
    },
    rentals: {
      active: 8,
      completed_today: 3,
      pending_returns: 2,
      overdue: 1
    },
    revenue: {
      today: 2450,
      this_month: 45600,
      this_year: 456000
    },
    maintenance: {
      scheduled: 5,
      overdue: 2,
      in_progress: 1
    }
  });

  const [recentActivities] = useState([
    { id: 1, type: 'rental', message: 'Nueva renta creada - Toyota Corolla', time: '10:30 AM' },
    { id: 2, type: 'maintenance', message: 'Mantenimiento completado - Honda Civic', time: '09:15 AM' },
    { id: 3, type: 'return', message: 'Vehículo devuelto - Nissan Sentra', time: '08:45 AM' },
    { id: 4, type: 'rental', message: 'Nueva renta creada - Ford Focus', time: '08:20 AM' }
  ]);

  const vehicleStatusData = [
    { name: 'Disponibles', value: stats.vehicles.available, color: '#10b981' },
    { name: 'Rentados', value: stats.vehicles.rented, color: '#f59e0b' },
    { name: 'Mantenimiento', value: stats.vehicles.maintenance, color: '#ef4444' },
    { name: 'Fuera de servicio', value: stats.vehicles.out_of_service, color: '#6b7280' }
  ];

  const monthlyRevenueData = [
    { month: 'Ene', revenue: 35000 },
    { month: 'Feb', revenue: 42000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Abr', revenue: 45000 },
    { month: 'May', revenue: 52000 },
    { month: 'Jun', revenue: 48000 }
  ];

  // Simular carga de datos
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Simular llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">Resumen general de RentAutoPro</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Vehículos"
          value={stats.vehicles.total}
          icon={TruckIcon}
          color="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Alquileres Activos"
          value={stats.rentals.active}
          icon={DocumentTextIcon}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats.revenue.this_month.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Mantenimientos Pendientes"
          value={stats.maintenance.scheduled}
          icon={WrenchScrewdriverIcon}
          color="yellow"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle Status Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Estado de Vehículos</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Ingresos Mensuales</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Acciones Rápidas</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn btn-primary flex flex-col items-center p-4">
                <TruckIcon className="h-8 w-8 mb-2" />
                <span>Nuevo Vehículo</span>
              </button>
              <button className="btn btn-secondary flex flex-col items-center p-4">
                <UsersIcon className="h-8 w-8 mb-2" />
                <span>Nuevo Cliente</span>
              </button>
              <button className="btn btn-outline flex flex-col items-center p-4">
                <DocumentTextIcon className="h-8 w-8 mb-2" />
                <span>Nueva Renta</span>
              </button>
              <button className="btn btn-outline flex flex-col items-center p-4">
                <WrenchScrewdriverIcon className="h-8 w-8 mb-2" />
                <span>Mantenimiento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">
              Alertas y Notificaciones
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats.rentals.overdue > 0 && (
                <div className="flex items-center p-3 bg-red-50 rounded-md">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Alquileres Vencidos</p>
                    <p className="text-sm text-red-600">{stats.rentals.overdue} alquiler(es) vencido(s)</p>
                  </div>
                </div>
              )}
              {stats.maintenance.overdue > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-md">
                  <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Mantenimientos Atrasados</p>
                    <p className="text-sm text-yellow-600">{stats.maintenance.overdue} mantenimiento(s) atrasado(s)</p>
                  </div>
                </div>
              )}
              {stats.rentals.pending_returns > 0 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-md">
                  <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Devoluciones Pendientes</p>
                    <p className="text-sm text-blue-600">{stats.rentals.pending_returns} vehículo(s) por devolver</p>
                  </div>
                </div>
              )}
              {stats.rentals.overdue === 0 && stats.maintenance.overdue === 0 && (
                <div className="flex items-center p-3 bg-green-50 rounded-md">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Todo al día</p>
                    <p className="text-sm text-green-600">No hay alertas pendientes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">
              Actividades Recientes
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      activity.type === 'rental' ? 'bg-success' :
                      activity.type === 'maintenance' ? 'bg-warning' :
                      activity.type === 'return' ? 'bg-info' : 'bg-secondary'
                    }`}></div>
                    <span className="text-sm text-secondary-700">{activity.message}</span>
                  </div>
                  <span className="text-xs text-secondary-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;