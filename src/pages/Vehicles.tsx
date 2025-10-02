import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Vehicle, VehicleFilters } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Página de gestión de vehículos
 * Permite listar, filtrar, crear, editar y eliminar vehículos
 */
const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VehicleFilters & { brand?: string; model?: string; year?: number }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { addNotification } = useNotifications();

  // Cargar vehículos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, [filters]);

  /**
   * Carga la lista de vehículos desde la API
   */
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVehicles(filters);
      setVehicles(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los vehículos',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la eliminación de un vehículo
   */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return;
    }

    try {
      await apiService.deleteVehicle(id);
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Vehículo eliminado correctamente',
        read: false
      });
      loadVehicles();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el vehículo',
        read: false
      });
    }
  };

  /**
   * Obtiene el color de estado del vehículo
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-success';
      case 'rented':
        return 'text-warning';
      case 'maintenance':
        return 'text-error';
      default:
        return 'text-secondary';
    }
  };

  /**
   * Obtiene el texto del estado del vehículo
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'rented':
        return 'Rentado';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando vehículos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Vehículos</h1>
          <p className="text-secondary-600 mt-2">Gestiona tu flota de vehículos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por marca..."
                value={filters.brand || ''}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por modelo..."
                value={filters.model || ''}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as Vehicle['status'] || undefined })}
              >
                <option value="">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="rented">Rentado</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-input"
                placeholder="Año..."
                value={filters.year || ''}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Lista de Vehículos ({vehicles.length})</h2>
        </div>
        <div className="card-body p-0">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">No se encontraron vehículos</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Precio/Día
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {vehicles.map((vehicle, index) => (
                    <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-sm text-secondary-500">{vehicle.vehicle_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">{vehicle.year}</td>
                      <td className="px-6 py-4 text-sm text-secondary-900">{vehicle.license_plate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                          {getStatusText(vehicle.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        ${vehicle.daily_rate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="btn btn-sm btn-outline"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowModal(true);
                            }}
                            className="btn btn-sm btn-secondary"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="btn btn-sm bg-error text-white hover:bg-red-700"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
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

      {/* Modal para crear/editar vehículo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h3>
            <p className="text-secondary-600 mb-4">
              Funcionalidad de formulario pendiente de implementación
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedVehicle(null);
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                {selectedVehicle ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedVehicle && !showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Detalles del Vehículo</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Marca:</span> {selectedVehicle.brand}
              </div>
              <div>
                <span className="font-medium">Modelo:</span> {selectedVehicle.model}
              </div>
              <div>
                <span className="font-medium">Año:</span> {selectedVehicle.year}
              </div>
              <div>
                <span className="font-medium">Placa:</span> {selectedVehicle.license_plate}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {selectedVehicle.vehicle_type}
              </div>
              <div>
                <span className="font-medium">Estado:</span>{' '}
                <span className={getStatusColor(selectedVehicle.status)}>
                  {getStatusText(selectedVehicle.status)}
                </span>
              </div>
              <div>
                <span className="font-medium">Precio por día:</span> ${selectedVehicle.daily_rate.toLocaleString()}
              </div>
              {selectedVehicle.notes && (
                <div>
                  <span className="font-medium">Notas:</span> {selectedVehicle.notes}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedVehicle(null)}
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

export default Vehicles;