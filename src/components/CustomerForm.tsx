/**
 * Formulario para crear y editar clientes
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Customer, CustomerFormData } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Componente de formulario para clientes
 */
const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
}) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_type: 'dni',
    document_number: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    driver_license_number: '',
    driver_license_expiry: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  });

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        document_type: customer.document_type,
        document_number: customer.document_number,
        date_of_birth: customer.date_of_birth || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        driver_license_number: customer.driver_license_number || '',
        driver_license_expiry: customer.driver_license_expiry || '',
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || '',
        notes: customer.notes || '',
      });
    } else {
      // Resetear formulario para nuevo cliente
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        document_type: 'dni',
        document_number: '',
        date_of_birth: '',
        address: '',
        city: '',
        country: '',
        driver_license_number: '',
        driver_license_expiry: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
      });
    }
  }, [customer]);

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        // Actualizar cliente existente
        await apiService.updateCustomer(customer.id, formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Cliente actualizado correctamente',
          read: false
        });
      } else {
        // Crear nuevo cliente
        await apiService.createCustomer(formData);
        addNotification({
          type: 'success',
          title: 'Éxito',
          message: 'Cliente creado correctamente',
          read: false
        });
      }
      
      onSuccess();
      onCancel();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el cliente',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Siempre renderizar como modal

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="text-xl font-semibold">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
            {/* Información personal */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Información Personal</h3>
              
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth" className="form-label">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Documentación */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Documentación</h3>
              
              <div className="form-group">
                <label htmlFor="document_type" className="form-label">
                  Tipo de Documento *
                </label>
                <select
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="dni">DNI</option>
                  <option value="passport">Pasaporte</option>
                  <option value="license">Licencia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="document_number" className="form-label">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  id="document_number"
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="driver_license_number" className="form-label">
                  Número de Licencia de Conducir
                </label>
                <input
                  type="text"
                  id="driver_license_number"
                  name="driver_license_number"
                  value={formData.driver_license_number}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="driver_license_expiry" className="form-label">
                  Vencimiento de Licencia
                </label>
                <input
                  type="date"
                  id="driver_license_expiry"
                  name="driver_license_expiry"
                  value={formData.driver_license_expiry}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Dirección</h3>
              
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contacto de emergencia */}
            <div className="form-section">
              <h3 className="text-lg font-medium mb-4">Contacto de Emergencia</h3>
              
              <div className="form-group">
                <label htmlFor="emergency_contact_name" className="form-label">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact_phone" className="form-label">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="form-notes">
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
                {loading ? 'Guardando...' : customer ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;