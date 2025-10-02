/**
 * Página de Reportes - Componente principal para mostrar reportes de ingresos, costos y disponibilidad
 */
import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Car, RefreshCw, Download, Wrench } from 'lucide-react';
import IncomeReports from '../components/reports/IncomeReports';
import MaintenanceCostReports from '../components/reports/MaintenanceCostReports';
import FleetAvailabilityReports from '../components/reports/FleetAvailabilityReports';

/**
 * Interface para las props del componente TabPanel
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Componente TabPanel para mostrar contenido de pestañas
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      className={value === index ? 'block' : 'hidden'}
    >
      {value === index && (
        <div className="py-6">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Componente principal de Reportes
 */
const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Maneja el cambio de pestañas
   */
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Maneja la actualización de datos
   */
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Maneja la exportación de reportes
   */
  const handleExport = () => {
    // TODO: Implementar exportación de reportes
    console.log('Exportar reportes');
  };

  const tabs = [
    {
      id: 0,
      label: 'Resumen Ejecutivo',
      icon: BarChart3,
      component: <div className="text-center py-8 text-gray-500">Componente de Resumen Ejecutivo en desarrollo...</div>
    },
    {
      id: 1,
      label: 'Ingresos',
      icon: TrendingUp,
      component: <IncomeReports />
    },
    {
      id: 2,
      label: 'Costos de Mantenimiento',
      icon: Wrench,
      component: <MaintenanceCostReports />
    },
    {
      id: 3,
      label: 'Disponibilidad de Flota',
      icon: Car,
      component: <FleetAvailabilityReports />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Reportes y Análisis
            </h1>
            <p className="text-lg text-gray-600">
              Análisis detallado de ingresos, costos y disponibilidad de la flota
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              title="Actualizar datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
              title="Exportar reportes"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200
                    ${tabValue === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  id={`reports-tab-${tab.id}`}
                  aria-controls={`reports-tabpanel-${tab.id}`}
                  aria-selected={tabValue === tab.id}
                >
                  <IconComponent className="w-6 h-6 mb-2" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-lg shadow-md">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={tabValue} index={tab.id}>
            {tab.component}
          </TabPanel>
        ))}
      </div>
    </div>
  );
};

export default Reports;