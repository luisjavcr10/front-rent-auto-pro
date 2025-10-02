/**
 * Formulario para crear y editar alquileres
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Rental, Customer, Vehicle, RentalFormData } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

interface RentalFormProps {
  rental?: Rental | null;
  isOpen: boolean;
  onSuccess: (createdRental?: Rental) => void;
  onCancel: () => void;
}

/**
 * Componente de formulario para alquileres
 */
const RentalForm: React.FC<RentalFormProps> = ({
  rental,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<RentalFormData>({
    customer_id: '',
    vehicle_id: '',
    start_date: '',
    end_date: '',
    pickup_location: '',
    return_location: '',
    daily_rate: 0,
    additional_charges: 0,
    discount_amount: 0,
    deposit_amount: 0,
    additional_notes: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadVehicles();
    }
  }, [isOpen]);

  // Cargar datos del alquiler si estamos editando
  useEffect(() => {
    if (rental) {
      setFormData({
        customer_id: rental.customer_id,
        vehicle_id: rental.vehicle_id,
        start_date: rental.start_date.split('T')[0],
        end_date: rental.end_date.split('T')[0],
        pickup_location: rental.pickup_location,
        return_location: rental.return_location,
        daily_rate: rental.daily_rate,
        additional_charges: rental.additional_charges,
        discount_amount: rental.discount_amount,
        deposit_amount: rental.deposit_amount,
        additional_notes: rental.additional_notes || '',
      });
    } else {
      // Resetear formulario para nuevo alquiler
      setFormData({
        customer_id: '',
        vehicle_id: '',
        start_date: '',
        end_date: '',
        pickup_location: '',
        return_location: '',
        daily_rate: 0,
        additional_charges: 0,
        discount_amount: 0,
        deposit_amount: 0,
        additional_notes: '',
      });
    }
  }, [rental, isOpen]);

  // Cargar vehículos disponibles cuando cambien las fechas
  useEffect(() => {
    if (formData.start_date && formData.end_date && !rental) {
      loadAvailableVehicles();
    }
  }, [formData.start_date, formData.end_date, rental]);

  /**
   * Carga la lista de clientes
   */
  const loadCustomers = async () => {
    try {
      const response = await apiService.getCustomers();
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los clientes',
        read: false
      });
    }
  };

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
   * Carga vehículos disponibles para las fechas seleccionadas
   */
  const loadAvailableVehicles = async () => {
    try {
      const response = await apiService.getAvailableVehicles(
        formData.start_date,
        formData.end_date
      );
      setAvailableVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los vehículos disponibles',
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
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  /**
   * Maneja el cambio de vehículo y actualiza la tarifa diaria
   */
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
      daily_rate: selectedVehicle ? selectedVehicle.daily_rate : 0,
    }));
  };

  /**
   * Calcula el total de días
   */
  const calculateDays = (): number => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  /**
   * Calcula el total del alquiler
   */
  const calculateTotal = (): number => {
    const days = calculateDays();
    const subtotal = days * formData.daily_rate;
    const additionalCharges = formData.additional_charges || 0;
    const discountAmount = formData.discount_amount || 0;
    const total = subtotal + additionalCharges - discountAmount;
    return Math.max(0, total);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let createdRental: Rental | undefined;
      
      if (rental) {
        // Actualizar alquiler existente
        await apiService.updateRental(rental.id, formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Alquiler actualizado correctamente',
          read: false
        });
      } else {
        // Crear nuevo alquiler
        const response = await apiService.createRental(formData);
        createdRental = response.data;
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Alquiler creado correctamente',
          read: false
        });
      }
      
      onSuccess(createdRental);
      onCancel();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el alquiler',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const days = calculateDays();
  const total = calculateTotal();
  
  // Para editar: mostrar todos los vehículos
  // Para nuevo alquiler: mostrar vehículos disponibles si hay fechas, sino todos los vehículos
  const vehiclesToShow = rental 
    ? vehicles 
    : (formData.start_date && formData.end_date && availableVehicles.length > 0) 
      ? availableVehicles 
      : vehicles;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="text-xl font-semibold">
            {rental ? 'Editar Alquiler' : 'Nuevo Alquiler'}
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
            {/* Cliente y vehículo */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Cliente y Vehículo</h3>
              
              <div className="form-group">
                <label htmlFor="customer_id" className="form-label">
                  Cliente *
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="vehicle_id" className="form-label">
                  Vehículo *
                </label>
                <select
                  id="vehicle_id"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleVehicleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiclesToShow.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} - {vehicle.brand} {vehicle.model} (${vehicle.daily_rate}/día)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas y ubicaciones */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Fechas y Ubicaciones</h3>
              
              <div className="form-group">
                <label htmlFor="start_date" className="form-label">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date" className="form-label">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickup_location" className="form-label">
                  Lugar de Recogida *
                </label>
                <input
                  type="text"
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                  placeholder="Dirección de recogida"
                />
              </div>

              <div className="form-group">
                <label htmlFor="return_location" className="form-label">
                  Lugar de Devolución *
                </label>
                <input
                  type="text"
                  id="return_location"
                  name="return_location"
                  value={formData.return_location}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                  placeholder="Dirección de devolución"
                />
              </div>
            </div>

            {/* Costos */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Costos</h3>
              
              <div className="form-group">
                <label htmlFor="daily_rate" className="form-label">
                  Tarifa Diaria *
                </label>
                <input
                  type="number"
                  id="daily_rate"
                  name="daily_rate"
                  value={formData.daily_rate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="additional_charges" className="form-label">
                  Cargos Adicionales
                </label>
                <input
                  type="number"
                  id="additional_charges"
                  name="additional_charges"
                  value={formData.additional_charges}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="discount_amount" className="form-label">
                  Descuento
                </label>
                <input
                  type="number"
                  id="discount_amount"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deposit_amount" className="form-label">
                  Depósito *
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Resumen</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Días:</span>
                  <span className="font-medium">{days}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-medium">${(days * formData.daily_rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Cargos adicionales:</span>
                  <span className="font-medium">${(formData.additional_charges || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Descuento:</span>
                  <span className="font-medium">-${(formData.discount_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="form-notes">
              <label htmlFor="additional_notes" className="form-label">
                Notas Adicionales
              </label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                rows={3}
                className="form-input"
                disabled={loading}
                placeholder="Notas adicionales sobre el alquiler..."
              />
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
                {loading ? 'Guardando...' : rental ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentalForm;