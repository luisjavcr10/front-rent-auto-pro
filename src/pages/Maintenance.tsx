import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Maintenance } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { usePermissions } from '../hooks/usePermissions';
import MaintenanceForm from '../components/MaintenanceForm';

/**
 * Página de gestión de mantenimiento
 * Permite listar, filtrar, crear, editar y completar mantenimientos
 */
const MaintenancePage: React.FC = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
    vehicle_id?: string;
  }>({});
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const { addNotification } = useNotifications();
  const permissions = usePermissions();

  // Cargar mantenimientos al montar el componente
  useEffect(() => {
    loadMaintenances();
  }, [filters]);

  /**
   * Carga la lista de mantenimientos desde la API
   */
  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaintenances(filters);
      // La respuesta es PaginatedResponse<Maintenance>, así que response.data ya es Maintenance[]
      setMaintenances(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading maintenances:', error);
      setMaintenances([]); // Asegurar que maintenances sea siempre un array
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los mantenimientos',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la finalización de un mantenimiento
   */
  const handleComplete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres marcar este mantenimiento como completado?')) {
      return;
    }

    try {
      await apiService.completeMaintenance(id, {
        completed_date: new Date().toISOString(),
        notes: 'Completado desde la interfaz web'
      });
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Mantenimiento completado correctamente',
        read: false
      });
      loadMaintenances();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo completar el mantenimiento',
        read: false
      });
    }
  };

  /**
   * Abre el formulario para crear un nuevo mantenimiento
   */
  const handleCreateMaintenance = () => {
    setEditingMaintenance(null);
    setShowForm(true);
  };

  /**
   * Abre el formulario para editar un mantenimiento existente
   */
  const handleEditMaintenance = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setShowForm(true);
  };

  /**
   * Maneja el éxito del formulario (crear/editar)
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMaintenance(null);
    loadMaintenances(); // Recargar la lista de mantenimientos
  };

  /**
   * Cierra el formulario
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaintenance(null);
  };

  /**
   * Obtiene el color de estado del mantenimiento
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-info';
      case 'in_progress':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      case 'cancelled':
        return 'text-error';
      default:
        return 'text-secondary';
    }
  };

  /**
   * Obtiene el texto del estado del mantenimiento
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  /**
   * Obtiene el color de prioridad del mantenimiento
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-info';
      case 'low':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  };

  /**
   * Obtiene el texto de prioridad del mantenimiento
   */
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  /**
   * Obtiene el texto del tipo de mantenimiento
   */
  const getMaintenanceTypeText = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Preventivo';
      case 'corrective':
        return 'Correctivo';
      case 'emergency':
        return 'Emergencia';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando mantenimientos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Mantenimiento</h1>
          <p className="text-secondary-600 mt-2">Gestiona el mantenimiento de la flota</p>
        </div>
        {permissions.canCreateMaintenance && (
          <button
            onClick={handleCreateMaintenance}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Mantenimiento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              >
                <option value="">Todos los estados</option>
                <option value="scheduled">Programado</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="form-input"
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
              >
                <option value="">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehículo ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="ID del vehículo..."
                value={filters.vehicle_id || ''}
                onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mantenimientos */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Lista de Mantenimientos ({maintenances.length})</h2>
        </div>
        <div className="card-body p-0">
          {maintenances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">No se encontraron mantenimientos</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {maintenances.map((maintenance, index) => (
                    <tr key={maintenance.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                        {maintenance.maintenance_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900">
                          {maintenance.vehicle ? `${maintenance.vehicle.brand} ${maintenance.vehicle.model}` : 'Vehículo no disponible'}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {maintenance.vehicle?.license_plate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {getMaintenanceTypeText(maintenance.maintenance_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {maintenance.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {new Date(maintenance.scheduled_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getStatusColor(maintenance.status)}`}>
                          {getStatusText(maintenance.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getPriorityColor(maintenance.priority)}`}>
                          {getPriorityText(maintenance.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMaintenance(maintenance)}
                            className="btn btn-sm btn-outline"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {permissions.canEditMaintenance && (
                            <button
                              onClick={() => handleEditMaintenance(maintenance)}
                              className="btn btn-sm btn-secondary"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {maintenance.status !== 'completed' && (
                            <button
                              onClick={() => handleComplete(maintenance.id)}
                              className="btn btn-sm bg-success text-white hover:bg-green-700"
                              title="Completar"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Formulario para crear/editar mantenimiento */}
      {showForm && (
        <MaintenanceForm
          maintenance={editingMaintenance}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      )}

      {/* Modal de detalles */}
      {selectedMaintenance && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Detalles del Mantenimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Número:</span> {selectedMaintenance.maintenance_number}
                </div>
                <div>
                  <span className="font-medium">Vehículo:</span>{' '}
                  {selectedMaintenance.vehicle ? `${selectedMaintenance.vehicle.brand} ${selectedMaintenance.vehicle.model}` : 'No disponible'}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {getMaintenanceTypeText(selectedMaintenance.maintenance_type)}
                </div>
                <div>
                  <span className="font-medium">Título:</span> {selectedMaintenance.title}
                </div>
                <div>
                  <span className="font-medium">Fecha programada:</span> {new Date(selectedMaintenance.scheduled_date).toLocaleDateString()}
                </div>
                {selectedMaintenance.completed_date && (
                  <div>
                    <span className="font-medium">Fecha completada:</span> {new Date(selectedMaintenance.completed_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  <span className={getStatusColor(selectedMaintenance.status)}>
                    {getStatusText(selectedMaintenance.status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Prioridad:</span>{' '}
                  <span className={getPriorityColor(selectedMaintenance.priority)}>
                    {getPriorityText(selectedMaintenance.priority)}
                  </span>
                </div>
                {selectedMaintenance.estimated_cost && (
                  <div>
                    <span className="font-medium">Costo estimado:</span> ${selectedMaintenance.estimated_cost.toLocaleString()}
                  </div>
                )}
                {selectedMaintenance.actual_cost && (
                  <div>
                    <span className="font-medium">Costo real:</span> ${selectedMaintenance.actual_cost.toLocaleString()}
                  </div>
                )}
                {selectedMaintenance.service_provider && (
                  <div>
                    <span className="font-medium">Proveedor:</span> {selectedMaintenance.service_provider}
                  </div>
                )}
                {selectedMaintenance.mileage_at_maintenance && (
                  <div>
                    <span className="font-medium">Kilometraje:</span> {selectedMaintenance.mileage_at_maintenance.toLocaleString()} km
                  </div>
                )}
              </div>
            </div>
            {selectedMaintenance.description && (
              <div className="mt-4">
                <span className="font-medium">Descripción:</span>
                <p className="text-secondary-600 mt-1">{selectedMaintenance.description}</p>
              </div>
            )}
            {selectedMaintenance.notes && (
              <div className="mt-4">
                <span className="font-medium">Notas:</span>
                <p className="text-secondary-600 mt-1">{selectedMaintenance.notes}</p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedMaintenance(null)}
                className="btn btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;