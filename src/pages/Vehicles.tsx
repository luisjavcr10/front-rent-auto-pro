import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Vehicle, VehicleFilters } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import VehicleForm from '../components/VehicleForm';
import { useAuth } from '../context/AuthContext';

/**
 * Página de gestión de vehículos
 * Permite listar, filtrar, crear, editar y eliminar vehículos
 */
const Vehicles: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VehicleFilters & { brand?: string; model?: string; year?: number }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { addNotification } = useNotifications();

  const canCreateVehicles = role === 'admin' || role === 'gestor_flota';

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
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]); // Asegurar que vehicles sea siempre un array
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
   * Abre el modal para editar un vehículo
   */
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
    setShowDetailsModal(false);
  };

  /**
   * Abre el modal para ver detalles de un vehículo
   */
  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
    setShowModal(false);
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
        {canCreateVehicles &&( <button
          onClick={() => {
            setSelectedVehicle(null);
            setShowModal(true);
            setShowDetailsModal(false);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Vehículo
        </button>)}
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
                  {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
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
                            onClick={() => handleViewDetails(vehicle)}
                            className="btn btn-sm btn-outline"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(vehicle)}
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

      {/* Formulario para crear/editar vehículo */}
      <VehicleForm
        vehicle={selectedVehicle}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedVehicle(null);
        }}
        onSuccess={() => {
          loadVehicles();
        }}
      />

      {/* Modal de detalles */}
      {selectedVehicle && showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-secondary-900">Detalles del Vehículo</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedVehicle(null);
                }}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <EyeIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-secondary-900 border-b pb-2">Información Básica</h4>
                  <div>
                    <span className="font-medium text-secondary-700">Marca:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.brand}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Modelo:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.model}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Año:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.year}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Color:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.color}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Placa:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.license_plate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Tipo:</span>
                    <span className="ml-2 text-secondary-900 capitalize">{selectedVehicle.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Estado:</span>
                    <span className={`ml-2 font-medium ${getStatusColor(selectedVehicle.status)}`}>
                      {getStatusText(selectedVehicle.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-secondary-900 border-b pb-2">Especificaciones</h4>
                  <div>
                    <span className="font-medium text-secondary-700">Combustible:</span>
                    <span className="ml-2 text-secondary-900 capitalize">{selectedVehicle.fuel_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Transmisión:</span>
                    <span className="ml-2 text-secondary-900 capitalize">{selectedVehicle.transmission}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Asientos:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.seats}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Precio por día:</span>
                    <span className="ml-2 text-secondary-900 font-semibold">${selectedVehicle.daily_rate.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">Kilometraje:</span>
                    <span className="ml-2 text-secondary-900">{selectedVehicle.current_mileage.toLocaleString()} km</span>
                  </div>
                  {selectedVehicle.vin && (
                    <div>
                      <span className="font-medium text-secondary-700">VIN:</span>
                      <span className="ml-2 text-secondary-900 font-mono text-sm">{selectedVehicle.vin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas importantes */}
              {(selectedVehicle.purchase_date || selectedVehicle.insurance_expiry || selectedVehicle.registration_expiry) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-lg text-secondary-900 mb-4">Fechas Importantes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedVehicle.purchase_date && (
                      <div>
                        <span className="font-medium text-secondary-700">Compra:</span>
                        <span className="ml-2 text-secondary-900">
                          {new Date(selectedVehicle.purchase_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedVehicle.insurance_expiry && (
                      <div>
                        <span className="font-medium text-secondary-700">Venc. Seguro:</span>
                        <span className="ml-2 text-secondary-900">
                          {new Date(selectedVehicle.insurance_expiry).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedVehicle.registration_expiry && (
                      <div>
                        <span className="font-medium text-secondary-700">Venc. Registro:</span>
                        <span className="ml-2 text-secondary-900">
                          {new Date(selectedVehicle.registration_expiry).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedVehicle.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-lg text-secondary-900 mb-2">Notas</h4>
                  <p className="text-secondary-700 bg-secondary-50 p-4 rounded-lg">{selectedVehicle.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedVehicle);
                }}
                className="btn btn-secondary"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedVehicle(null);
                }}
                className="btn btn-primary"
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