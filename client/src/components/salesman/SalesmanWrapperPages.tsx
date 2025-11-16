import { useState } from 'react';
import { BeatManagement } from './BeatManagement';
import { AttendanceTracking } from './AttendanceTracking';
import { StoreVisitForm } from './StoreVisitForm';
import { SalesOrderForm } from './SalesOrderForm';
import { PerformanceDashboard } from './PerformanceDashboard';

export const SalesmanBeatsPage = () => {
  return <BeatManagement />;
};

export const SalesmanAttendancePage = () => {
  return <AttendanceTracking />;
};

export const SalesmanVisitsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Store Visits</h2>
        <p className="text-muted-foreground">Log your store visits and interactions</p>
      </div>
      
      {!selectedBeat && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Please select a beat to start logging visits</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select Beat
          </button>
        </div>
      )}
      
      <StoreVisitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        beat={selectedBeat}
      />
    </div>
  );
};

export const SalesmanOrdersPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sales Orders</h2>
        <p className="text-muted-foreground">Create and manage sales orders</p>
      </div>
      
      {!selectedBeat && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Please select a beat to start creating orders</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select Beat
          </button>
        </div>
      )}
      
      <SalesOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        beat={selectedBeat}
      />
    </div>
  );
};

export const SalesmanPerformancePage = () => {
  return <PerformanceDashboard />;
};
