import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Vehicle, VehicleFormData } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Formulario para crear y editar vehículos
 */
const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vehicle_type: 'sedan',
    fuel_type: 'gasoline',
    transmission: 'manual',
    seats: 5,
    daily_rate: 0,
    current_mileage: 0,
    purchase_date: '',
    insurance_expiry: '',
    registration_expiry: '',
    vin: '',
    notes: ''
  });
  const [vinError, setVinError] = useState<string>('');

  // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        vehicle_type: vehicle.vehicle_type,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        seats: vehicle.seats,
        daily_rate: vehicle.daily_rate,
        current_mileage: vehicle.current_mileage,
        purchase_date: vehicle.purchase_date ? vehicle.purchase_date.split('T')[0] : '',
        insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split('T')[0] : '',
        registration_expiry: vehicle.registration_expiry ? vehicle.registration_expiry.split('T')[0] : '',
        vin: vehicle.vin || '',
        notes: vehicle.notes || ''
      });
    } else {
      // Resetear formulario para nuevo vehículo
      setFormData({
        license_plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vehicle_type: 'sedan',
        fuel_type: 'gasoline',
        transmission: 'manual',
        seats: 5,
        daily_rate: 0,
        current_mileage: 0,
        purchase_date: '',
        insurance_expiry: '',
        registration_expiry: '',
        vin: '',
        notes: ''
      });
    }
  }, [vehicle]);

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (name === 'vin') {
      const vin = value.toUpperCase();
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (vin && !vinRegex.test(vin)) {
        setVinError('VIN inválido. Debe tener 17 caracteres y sin I/O/Q.');
      } else {
        setVinError('');
      }
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate VIN if provided
      const vinTrimmed = (formData.vin || '').toUpperCase().trim();
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (vinTrimmed && !vinRegex.test(vinTrimmed)) {
        setVinError('VIN inválido. Debe tener 17 caracteres y sin I/O/Q.');
        addNotification({
          type: 'error',
          title: 'VIN inválido',
          message: 'Revisa el campo VIN: formato inválido.',
          read: false
        });
        setLoading(false);
        return;
      }

      if (vehicle) {
        // Actualizar vehículo existente
        await apiService.updateVehicle(vehicle.id, formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Vehículo actualizado correctamente',
          read: false
        });
      } else {
        // Crear nuevo vehículo
        await apiService.createVehicle(formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Vehículo creado correctamente',
          read: false
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el vehículo',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-xl font-semibold">
            {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <XMarkIcon className="icon-md" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            {/* Información básica */}
            <div className="form-group">
              <label className="form-label">Placa *</label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                className="form-input"
                placeholder="ABC-123"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Marca *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-input"
                placeholder="Toyota"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modelo *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
                placeholder="Corolla"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Año *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color *</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input"
                placeholder="Blanco"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Vehículo *</label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van</option>
                <option value="coupe">Coupé</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Combustible *</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Eléctrico</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transmisión *</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Asientos *</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="form-input"
                min="2"
                max="9"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tarifa Diaria ($) *</label>
              <input
                type="number"
                name="daily_rate"
                value={formData.daily_rate}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kilometraje Actual *</label>
              <input
                type="number"
                name="current_mileage"
                value={formData.current_mileage}
                onChange={handleChange}
                className="form-input"
                min="0"
                required
              />
            </div>

            {/* Información adicional */}
            <div className="form-group">
              <label className="form-label">Fecha de Compra</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vencimiento Seguro</label>
              <input
                type="date"
                name="insurance_expiry"
                value={formData.insurance_expiry}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vencimiento Registro</label>
              <input
                type="date"
                name="registration_expiry"
                value={formData.registration_expiry}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className={`form-input ${vinError ? 'border-red-500' : ''}`}
                placeholder="1HGBH41JXMN109186"
                maxLength={17}
              />
              {vinError && (
                <p className="text-red-600 text-sm mt-1">{vinError}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="form-group form-notes">
            <label className="form-label">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows={3}
              placeholder="Información adicional sobre el vehículo..."
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Guardando...' : vehicle ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;