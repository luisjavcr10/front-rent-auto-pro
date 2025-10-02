import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Rental, RentalFilters } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { usePermissions } from '../hooks/usePermissions';
import RentalForm from '../components/RentalForm';
import RentalPDFGenerator from '../components/RentalPDFGenerator';
import { useAuth } from '../context/AuthContext';

/**
 * Página de gestión de rentas
 * Permite listar, filtrar, crear, editar y eliminar rentas
 */
const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RentalFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [newlyCreatedRental, setNewlyCreatedRental] = useState<Rental | null>(null);
  const { addNotification } = useNotifications();
  const permissions = usePermissions();
  const { user } = useAuth();
  const role = user?.role;


  const canCreateRentals = role === 'cliente';

  // Cargar rentas al montar el componente
  useEffect(() => {
    loadRentals();
  }, [filters]);

  /**
   * Carga la lista de rentas desde la API
   */
  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRentals(filters);
      // La respuesta es PaginatedResponse<Rental>, así que response.data ya es Rental[]
      setRentals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading rentals:', error);
      setRentals([]); // Asegurar que rentals sea siempre un array
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las rentas',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la cancelación de una renta
   */
  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta renta?')) {
      return;
    }

    try {
      await apiService.cancelRental(id);
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Renta cancelada correctamente',
        read: false
      });
      loadRentals();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cancelar la renta',
        read: false
      });
    }
  };

  /**
   * Abre el formulario para crear una nueva renta
   */
  const handleCreateRental = () => {
    setEditingRental(null);
    setShowForm(true);
  };

  /**
   * Abre el formulario para editar una renta existente
   */
  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setShowForm(true);
  };

  /**
   * Maneja el éxito del formulario (crear/editar)
   */
  const handleFormSuccess = (createdRental?: Rental) => {
    setShowForm(false);
    setEditingRental(null);
    
    // Si se creó una nueva renta, mostrar opción de generar PDF
    if (createdRental) {
      setNewlyCreatedRental(createdRental);
    }
    
    loadRentals(); // Recargar la lista de rentas
  };

  /**
   * Cierra el formulario
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRental(null);
  };

  /**
   * Obtiene el color de estado de la renta
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'text-info';
      case 'active':
        return 'text-success';
      case 'completed':
        return 'text-secondary';
      case 'cancelled':
        return 'text-error';
      default:
        return 'text-secondary';
    }
  };

  /**
   * Obtiene el texto del estado de la renta
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'Reservada';
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  /**
   * Obtiene el color del estado de pago
   */
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-success';
      case 'partial':
        return 'text-warning';
      case 'pending':
        return 'text-error';
      case 'refunded':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  /**
   * Obtiene el texto del estado de pago
   */
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'partial':
        return 'Parcial';
      case 'pending':
        return 'Pendiente';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando rentas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Rentas</h1>
          <p className="text-secondary-600 mt-2">Gestiona las rentas de vehículos</p>
        </div>
        {canCreateRentals && (
          <button
            onClick={handleCreateRental}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Renta
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Estado de Renta</label>
              <select
                className="form-input"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as Rental['rental_status'] || undefined })}
              >
                <option value="">Todos los estados</option>
                <option value="reserved">Reservada</option>
                <option value="active">Activa</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado de Pago</label>
              <select
                className="form-input"
                value={filters.payment_status || ''}
                onChange={(e) => setFilters({ ...filters, payment_status: e.target.value as Rental['payment_status'] || undefined })}
              >
                <option value="">Todos los pagos</option>
                <option value="pending">Pendiente</option>
                <option value="partial">Parcial</option>
                <option value="paid">Pagado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-input"
                value={filters.start_date || ''}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-input"
                value={filters.end_date || ''}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de rentas */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Lista de Rentas ({rentals.length})</h2>
        </div>
        <div className="card-body p-0">
          {rentals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">No se encontraron rentas</p>
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
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {rentals.map((rental, index) => (
                    <tr key={rental.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                        {rental.rental_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900">
                          {rental.customer ? `${rental.customer.first_name} ${rental.customer.last_name}` : 'Cliente no disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900">
                          {rental.vehicle ? `${rental.vehicle.brand} ${rental.vehicle.model}` : 'Vehículo no disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-secondary-900">
                            {new Date(rental.start_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {new Date(rental.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-sm font-medium ${getStatusColor(rental.rental_status)}`}>
                            {getStatusText(rental.rental_status)}
                          </span>
                          <div className={`text-xs ${getPaymentStatusColor(rental.payment_status)}`}>
                            {getPaymentStatusText(rental.payment_status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        ${rental.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRental(rental)}
                            className="btn btn-sm btn-outline"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {permissions.canEditRentals && (
                            <button
                              onClick={() => handleEditRental(rental)}
                              className="btn btn-sm btn-secondary"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCancel(rental.id)}
                            className="btn btn-sm bg-error text-white hover:bg-red-700"
                            title="Cancelar"
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

      {/* Formulario para crear/editar renta */}
      {showForm && (
        <RentalForm
          isOpen={showForm}
          rental={editingRental}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      )}

      {/* Modal de renta creada exitosamente */}
      {newlyCreatedRental && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">¡Renta Creada Exitosamente!</h3>
            <div className="text-center mb-6">
              <p className="text-secondary-600 mb-2">
                La renta <strong>{newlyCreatedRental.rental_number}</strong> ha sido creada correctamente.
              </p>
              <p className="text-secondary-600">
                ¿Deseas generar un reporte PDF con todos los detalles de la renta?
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <RentalPDFGenerator 
                rental={newlyCreatedRental}
                onGenerate={() => {
                  addNotification({
                    type: 'success',
                    title: 'PDF Generado',
                    message: 'El reporte PDF se ha descargado correctamente',
                    read: false
                  });
                  setNewlyCreatedRental(null);
                }}
              />
              <button
                onClick={() => setNewlyCreatedRental(null)}
                className="btn btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedRental && !showForm && !newlyCreatedRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Detalles de la Renta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Número:</span> {selectedRental.rental_number}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span>{' '}
                  {selectedRental.customer ? `${selectedRental.customer.first_name} ${selectedRental.customer.last_name}` : 'No disponible'}
                </div>
                <div>
                  <span className="font-medium">Vehículo:</span>{' '}
                  {selectedRental.vehicle ? `${selectedRental.vehicle.brand} ${selectedRental.vehicle.model}` : 'No disponible'}
                </div>
                <div>
                  <span className="font-medium">Fecha inicio:</span> {new Date(selectedRental.start_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Fecha fin:</span> {new Date(selectedRental.end_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Días totales:</span> {selectedRental.total_days}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  <span className={getStatusColor(selectedRental.rental_status)}>
                    {getStatusText(selectedRental.rental_status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Estado de pago:</span>{' '}
                  <span className={getPaymentStatusColor(selectedRental.payment_status)}>
                    {getPaymentStatusText(selectedRental.payment_status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Tarifa diaria:</span> ${selectedRental.daily_rate.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Subtotal:</span> ${selectedRental.subtotal.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ${selectedRental.total_amount.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Depósito:</span> ${selectedRental.deposit_amount.toLocaleString()}
                </div>
              </div>
            </div>
            {selectedRental.additional_notes && (
              <div className="mt-4">
                <span className="font-medium">Notas adicionales:</span>
                <p className="text-secondary-600 mt-1">{selectedRental.additional_notes}</p>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <RentalPDFGenerator 
                rental={selectedRental}
                onGenerate={() => {
                  addNotification({
                    type: 'success',
                    title: 'PDF Generado',
                    message: 'El reporte PDF se ha descargado correctamente',
                    read: false
                  });
                }}
              />
              <button
                onClick={() => setSelectedRental(null)}
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

export default Rentals;