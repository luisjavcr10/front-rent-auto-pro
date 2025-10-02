/**
 * Componente para generar reportes PDF de rentas
 * Incluye toda la información de la renta en formato PDF
 */
import React from 'react';
import jsPDF from 'jspdf';
import type { Rental } from '../types';

interface RentalPDFGeneratorProps {
  rental: Rental;
  onGenerate?: () => void;
}

/**
 * Componente para generar PDF de renta
 */
const RentalPDFGenerator: React.FC<RentalPDFGeneratorProps> = ({ rental, onGenerate }) => {
  
  /**
   * Formatea una fecha para mostrar en el PDF
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Formatea un monto monetario
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  /**
   * Obtiene el texto del estado de la renta
   */
  const getStatusText = (status: string): string => {
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
   * Obtiene el texto del estado de pago
   */
  const getPaymentStatusText = (status: string): string => {
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

  /**
   * Obtiene el texto del nivel de combustible
   */
  const getFuelLevelText = (level?: string): string => {
    if (!level) return 'No especificado';
    switch (level) {
      case 'empty':
        return 'Vacío';
      case 'quarter':
        return '1/4';
      case 'half':
        return '1/2';
      case 'three_quarters':
        return '3/4';
      case 'full':
        return 'Lleno';
      default:
        return level;
    }
  };

  /**
   * Función auxiliar para asegurar que el valor sea un string válido
   */
  const safeText = (value: any): string => {
    if (value === null || value === undefined) {
      return 'No especificado';
    }
    return String(value);
  };

  /**
   * Genera el PDF de la renta
   */
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Configuración de fuentes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);

    // Título del documento
    doc.text('REPORTE DE RENTA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Información de la empresa (header)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('RentAutoPro - Sistema de Gestión de Rentas', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text(`Fecha de generación: ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Información básica de la renta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INFORMACIÓN DE LA RENTA', margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Número de renta
    doc.setFont('helvetica', 'bold');
    doc.text('Número de Renta:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(rental.rental_number), margin + 50, yPosition);
    yPosition += 8;

    // Estado de la renta
    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(getStatusText(safeText(rental.rental_status)), margin + 50, yPosition);
    yPosition += 8;

    // Estado de pago
    doc.setFont('helvetica', 'bold');
    doc.text('Estado de Pago:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(getPaymentStatusText(safeText(rental.payment_status)), margin + 50, yPosition);
    yPosition += 15;

    // Información del cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INFORMACIÓN DEL CLIENTE', margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (rental.customer) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(`${safeText(rental.customer.first_name)} ${safeText(rental.customer.last_name)}`), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Email:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.customer.email), margin + 50, yPosition);
      yPosition += 8;

      if (rental.customer.phone) {
        doc.setFont('helvetica', 'bold');
        doc.text('Teléfono:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(rental.customer.phone), margin + 50, yPosition);
        yPosition += 8;
      }

      if (rental.customer.document_number) {
        doc.setFont('helvetica', 'bold');
        doc.text('Documento:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(`${safeText(rental.customer.document_type)?.toUpperCase()} - ${safeText(rental.customer.document_number)}`), margin + 50, yPosition);
        yPosition += 8;
      }
    }
    yPosition += 10;

    // Información del vehículo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INFORMACIÓN DEL VEHÍCULO', margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (rental.vehicle) {
      doc.setFont('helvetica', 'bold');
      doc.text('Vehículo:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(`${safeText(rental.vehicle.brand)} ${safeText(rental.vehicle.model)} (${safeText(rental.vehicle.year)})`), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Placa:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.vehicle.license_plate), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Color:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.vehicle.color), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Tipo:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.vehicle.vehicle_type), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Combustible:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.vehicle.fuel_type), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Transmisión:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(rental.vehicle.transmission), margin + 50, yPosition);
      yPosition += 8;
    }
    yPosition += 10;

    // Detalles de la renta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('DETALLES DE LA RENTA', margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Fechas
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Inicio:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(formatDate(rental.start_date)), margin + 50, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Fin:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(formatDate(rental.end_date)), margin + 50, yPosition);
    yPosition += 8;

    if (rental.actual_return_date) {
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha Real de Devolución:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(formatDate(rental.actual_return_date)), margin + 50, yPosition);
      yPosition += 8;
    }

    // Ubicaciones
    doc.setFont('helvetica', 'bold');
    doc.text('Lugar de Recogida:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(rental.pickup_location), margin + 50, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Lugar de Devolución:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(rental.return_location), margin + 50, yPosition);
    yPosition += 8;

    // Días totales
    doc.setFont('helvetica', 'bold');
    doc.text('Días Totales:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(rental.total_days), margin + 50, yPosition);
    yPosition += 15;

    // Información de kilometraje y combustible
    if (rental.pickup_mileage || rental.return_mileage || rental.fuel_level_pickup || rental.fuel_level_return) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('INFORMACIÓN DE ENTREGA/DEVOLUCIÓN', margin, yPosition);
      yPosition += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      if (rental.pickup_mileage) {
        doc.setFont('helvetica', 'bold');
        doc.text('Kilometraje Entrega:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(`${safeText(rental.pickup_mileage)} km`), margin + 50, yPosition);
        yPosition += 8;
      }

      if (rental.return_mileage) {
        doc.setFont('helvetica', 'bold');
        doc.text('Kilometraje Devolución:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(`${safeText(rental.return_mileage)} km`), margin + 50, yPosition);
        yPosition += 8;
      }

      if (rental.fuel_level_pickup) {
        doc.setFont('helvetica', 'bold');
        doc.text('Combustible Entrega:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(getFuelLevelText(safeText(rental.fuel_level_pickup))), margin + 50, yPosition);
        yPosition += 8;
      }

      if (rental.fuel_level_return) {
        doc.setFont('helvetica', 'bold');
        doc.text('Combustible Devolución:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(safeText(getFuelLevelText(safeText(rental.fuel_level_return))), margin + 50, yPosition);
        yPosition += 8;
      }
      yPosition += 10;
    }

    // Información financiera
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INFORMACIÓN FINANCIERA', margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Tarifa diaria
    doc.setFont('helvetica', 'bold');
    doc.text('Tarifa Diaria:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(formatCurrency(rental.daily_rate || 0)), margin + 50, yPosition);
    yPosition += 8;

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(formatCurrency(rental.subtotal || 0)), margin + 50, yPosition);
    yPosition += 8;

    // Impuestos
    doc.setFont('helvetica', 'bold');
    doc.text('Impuestos:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(formatCurrency(rental.tax_amount || 0)), margin + 50, yPosition);
    yPosition += 8;

    // Cargos adicionales
    if ((rental.additional_charges || 0) > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Cargos Adicionales:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(formatCurrency(rental.additional_charges || 0)), margin + 50, yPosition);
      yPosition += 8;
    }

    // Descuento
    if ((rental.discount_amount || 0) > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Descuento:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(`-${formatCurrency(rental.discount_amount || 0)}`), margin + 50, yPosition);
      yPosition += 8;
    }

    // Depósito
    if ((rental.deposit_amount || 0) > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Depósito:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(formatCurrency(rental.deposit_amount || 0)), margin + 50, yPosition);
      yPosition += 8;
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', margin, yPosition);
    doc.text(safeText(formatCurrency(rental.total_amount || 0)), margin + 50, yPosition);
    yPosition += 15;

    // Notas adicionales
    if (rental.additional_notes || rental.damage_notes_pickup || rental.damage_notes_return) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('NOTAS ADICIONALES', margin, yPosition);
      yPosition += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      if (rental.damage_notes_pickup) {
        doc.setFont('helvetica', 'bold');
        doc.text('Daños en Entrega:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const pickupLines = doc.splitTextToSize(safeText(rental.damage_notes_pickup), pageWidth - 2 * margin);
        doc.text(pickupLines, margin, yPosition);
        yPosition += pickupLines.length * 5 + 5;
      }

      if (rental.damage_notes_return) {
        doc.setFont('helvetica', 'bold');
        doc.text('Daños en Devolución:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const returnLines = doc.splitTextToSize(safeText(rental.damage_notes_return), pageWidth - 2 * margin);
        doc.text(returnLines, margin, yPosition);
        yPosition += returnLines.length * 5 + 5;
      }

      if (rental.additional_notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notas Generales:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(safeText(rental.additional_notes), pageWidth - 2 * margin);
        doc.text(notesLines, margin, yPosition);
        yPosition += notesLines.length * 5;
      }
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Este documento fue generado automáticamente por RentAutoPro', pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Guardar el PDF
    const fileName = `Renta_${rental.rental_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    // Callback opcional
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Generar PDF
    </button>
  );
};

export default RentalPDFGenerator;