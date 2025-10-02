import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Customer } from '../types';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import CustomerForm from '../components/CustomerForm';

/**
 * Página de gestión de clientes
 * Permite listar, filtrar, crear, editar y eliminar clientes
 */
const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const role = user?.role;
  // Permisos simples por rol: cliente NO crea/edita/elimina
  const canViewCustomers = role === 'admin' || role === 'gestor_flota' || role === 'cliente';
  const canCreateCustomers = role === 'admin' || role === 'gestor_flota';
  const canEditCustomers = role === 'admin' || role === 'gestor_flota';
  const canDeleteCustomers = role === 'admin';

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers();
  }, []);

  /**
   * Carga la lista de clientes desde la API
   */
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomers({ search: searchTerm });
      // La respuesta es PaginatedResponse<Customer>, así que response.data ya es Customer[]
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]); // Asegurar que customers sea siempre un array
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los clientes',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un cliente
   */
  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      await apiService.deleteCustomer(customerId);
      setCustomers(customers.filter(customer => customer.id !== customerId));
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Cliente eliminado exitosamente',
        read: false
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar cliente',
        read: false
      });
    }
  };

  /**
   * Abre el formulario para crear un nuevo cliente
   */
  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  /**
   * Abre el formulario para editar un cliente existente
   */
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  /**
   * Maneja el éxito del formulario (crear/editar)
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers(); // Recargar la lista de clientes
  };

  /**
   * Cierra el formulario
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  /**
   * Filtra clientes por término de búsqueda
   */
  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.document_number.includes(searchTerm)
  );

  /**
   * Obtiene el texto del tipo de documento
   */
  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'dni':
        return 'DNI';
      case 'passport':
        return 'Pasaporte';
      case 'license':
        return 'Licencia';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Clientes</h1>
          <p className="text-secondary-600 mt-2">Gestiona tu base de clientes</p>
        </div>
        {canCreateCustomers && (
          <button
            onClick={handleCreateCustomer}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Buscar Cliente</label>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nombre, email o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Lista de Clientes ({filteredCustomers.length})</h2>
        </div>
        <div className="card-body p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-500">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-secondary-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-secondary-900">{customer.document_number}</div>
                          <div className="text-sm text-secondary-500">{getDocumentTypeText(customer.document_type)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {customer.phone || 'No especificado'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${customer.is_active ? 'text-success' : 'text-error'}`}>
                          {customer.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {canViewCustomers && (
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="btn btn-sm btn-outline"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canEditCustomers && (
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="btn btn-sm btn-secondary"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteCustomers && (
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="btn btn-sm bg-error text-white hover:bg-red-700"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
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

      {/* Formulario para crear/editar cliente */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      )}

      {/* Modal de detalles */}
      {selectedCustomer && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Detalles del Cliente</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Nombre:</span> {selectedCustomer.first_name} {selectedCustomer.last_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedCustomer.email}
              </div>
              <div>
                <span className="font-medium">Teléfono:</span> {selectedCustomer.phone || 'No especificado'}
              </div>
              <div>
                <span className="font-medium">Documento:</span> {selectedCustomer.document_number} ({getDocumentTypeText(selectedCustomer.document_type)})
              </div>
              {selectedCustomer.date_of_birth && (
                <div>
                  <span className="font-medium">Fecha de nacimiento:</span> {new Date(selectedCustomer.date_of_birth).toLocaleDateString()}
                </div>
              )}
              {selectedCustomer.address && (
                <div>
                  <span className="font-medium">Dirección:</span> {selectedCustomer.address}
                </div>
              )}
              {selectedCustomer.city && (
                <div>
                  <span className="font-medium">Ciudad:</span> {selectedCustomer.city}
                </div>
              )}
              {selectedCustomer.driver_license_number && (
                <div>
                  <span className="font-medium">Licencia de conducir:</span> {selectedCustomer.driver_license_number}
                </div>
              )}
              <div>
                <span className="font-medium">Estado:</span>{' '}
                <span className={selectedCustomer.is_active ? 'text-success' : 'text-error'}>
                  {selectedCustomer.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <span className="font-medium">Notas:</span> {selectedCustomer.notes}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedCustomer(null)}
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

export default Customers;