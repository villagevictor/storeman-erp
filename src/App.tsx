import React, { useState } from 'react';
import { ERPProvider } from './context/ERPContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { AuthGuard } from './components/AuthGuard';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

// Views
import { DashboardView } from './views/DashboardView';
import { MaterialsView } from './views/MaterialsView';
import { StockInView } from './views/StockInView';
import { StockOutView } from './views/StockOutView';
import { InvoicesView } from './views/InvoicesView';
import { WarehousesView } from './views/WarehousesView';
import { SuppliersView } from './views/SuppliersView';
import { AdminView } from './views/AdminView';
import { ActivityLogsView } from './views/ActivityLogsView';
import { BackupsView } from './views/BackupsView';
import { SettingsView } from './views/SettingsView';

function ERPContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <AuthGuard requiredModule="dashboard">
            <DashboardView setActiveView={setActiveView} />
          </AuthGuard>
        );
      case 'materials':
        return (
          <AuthGuard requiredModule="materials">
            <MaterialsView />
          </AuthGuard>
        );
      case 'stock_in':
        return (
          <AuthGuard requiredModule="stock_in">
            <StockInView />
          </AuthGuard>
        );
      case 'stock_out':
        return (
          <AuthGuard requiredModule="stock_out">
            <StockOutView />
          </AuthGuard>
        );
      case 'invoices':
        return (
          <AuthGuard requiredModule="invoices">
            <InvoicesView />
          </AuthGuard>
        );
      case 'warehouses':
        return (
          <AuthGuard requiredModule="warehouses">
            <WarehousesView />
          </AuthGuard>
        );
      case 'suppliers':
        return (
          <AuthGuard requiredModule="suppliers">
            <SuppliersView />
          </AuthGuard>
        );
      case 'admin':
        return (
          <AuthGuard requiredModule="admin">
            <AdminView />
          </AuthGuard>
        );
      case 'activity_logs':
        return (
          <AuthGuard requiredModule="activity_logs">
            <ActivityLogsView />
          </AuthGuard>
        );
      case 'backups':
        return (
          <AuthGuard requiredModule="backups">
            <BackupsView />
          </AuthGuard>
        );
      case 'settings':
        return (
          <AuthGuard requiredModule="settings">
            <SettingsView />
          </AuthGuard>
        );
      default:
        return (
          <AuthGuard requiredModule="dashboard">
            <DashboardView setActiveView={setActiveView} />
          </AuthGuard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Thermal Receipt & WhatsApp Modal */}
      <ThermalReceiptModal />

      <div className="flex flex-1 min-h-screen">
        {/* Responsive Slate Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Top Header */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export function App() {
  return (
    <ERPProvider>
      <ERPContent />
    </ERPProvider>
  );
}

export default App;
