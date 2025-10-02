/**
 * Formulario para crear y editar mantenimientos
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Maintenance, Vehicle } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

interface MaintenanceFormProps {
  maintenance?: Maintenance | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface MaintenanceFormData {
  vehicle_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency';
  title: string;
  description?: string;
  scheduled_date: string;
  estimated_cost?: number;
  service_provider?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

/**
 * Componente de formulario para mantenimientos
 */
const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  maintenance,
  onSuccess,
  onCancel,
}) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicle_id: '',
    maintenance_type: 'preventive',
    title: '',
    description: '',
    scheduled_date: '',
    estimated_cost: undefined,
    service_provider: '',
    priority: 'medium',
    notes: '',
  });

  // Cargar vehículos disponibles
  useEffect(() => {
    loadVehicles();
  }, []);

  // Cargar datos del mantenimiento si estamos editando
  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle_id: maintenance.vehicle_id,
        maintenance_type: maintenance.maintenance_type,
        title: maintenance.title,
        description: maintenance.description || '',
        scheduled_date: maintenance.scheduled_date.split('T')[0], // Solo la fecha
        estimated_cost: maintenance.estimated_cost,
        service_provider: maintenance.service_provider || '',
        priority: maintenance.priority,
        notes: maintenance.notes || '',
      });
    } else {
      // Resetear formulario para nuevo mantenimiento
      setFormData({
        vehicle_id: '',
        maintenance_type: 'preventive',
        title: '',
        description: '',
        scheduled_date: '',
        estimated_cost: undefined,
        service_provider: '',
        priority: 'medium',
        notes: '',
      });
    }
  }, [maintenance]);

  /**
   * Carga la lista de vehículos
   */
  const loadVehicles = async () => {
    try {
      const response = await apiService.getVehicles();
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los vehículos',
        read: false
      });
    }
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (maintenance) {
        // Actualizar mantenimiento existente
        await apiService.updateMaintenance(maintenance.id, formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Mantenimiento actualizado correctamente',
          read: false
        });
      } else {
        // Crear nuevo mantenimiento
        await apiService.createMaintenance(formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Mantenimiento creado correctamente',
          read: false
        });
      }
      
      onSuccess();
      onCancel();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el mantenimiento',
        read: false
      });
    } finally {
      setLoading(false);
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

  /**
   * Obtiene el texto de la prioridad
   */
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="text-xl font-semibold">
            {maintenance ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </h2>
          <button
            onClick={onCancel}
            className="modal-close-btn"
            disabled={loading}
          >
            <XMarkIcon className="icon-md" />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Información básica */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Información Básica</h3>
              
              <div className="form-group">
                <label htmlFor="vehicle_id" className="form-label">
                  Vehículo *
                </label>
                <select
                  id="vehicle_id"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maintenance_type" className="form-label">
                  Tipo de Mantenimiento *
                </label>
                <select
                  id="maintenance_type"
                  name="maintenance_type"
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="preventive">Preventivo</option>
                  <option value="corrective">Correctivo</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                  placeholder="Ej: Cambio de aceite, Revisión de frenos..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  Prioridad *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            {/* Programación y costos */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Programación y Costos</h3>
              
              <div className="form-group">
                <label htmlFor="scheduled_date" className="form-label">
                  Fecha Programada *
                </label>
                <input
                  type="date"
                  id="scheduled_date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimated_cost" className="form-label">
                  Costo Estimado
                </label>
                <input
                  type="number"
                  id="estimated_cost"
                  name="estimated_cost"
                  value={formData.estimated_cost || ''}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="service_provider" className="form-label">
                  Proveedor de Servicio
                </label>
                <input
                  type="text"
                  id="service_provider"
                  name="service_provider"
                  value={formData.service_provider}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                  placeholder="Nombre del taller o proveedor"
                />
              </div>
            </div>

            {/* Descripción y notas */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Detalles</h3>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  disabled={loading}
                  placeholder="Descripción detallada del mantenimiento..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  disabled={loading}
                  placeholder="Notas adicionales, observaciones..."
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : maintenance ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;