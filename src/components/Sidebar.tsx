import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  CloudUpload,
  Settings,
  X,
  Boxes,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
}) => {
  const { currentUser, materials } = useERP();

  const lowStockCount = materials.filter(m => m.stock_quantity <= m.min_threshold).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'materials', label: 'Materials & Catalog', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alert` : null, badgeColor: 'bg-amber-500 text-white' },
    { id: 'stock_in', label: 'Stock In (GRN)', icon: ArrowDownLeft, color: 'text-emerald-400' },
    { id: 'stock_out', label: 'Stock Out & Billing', icon: ArrowUpRight, color: 'text-rose-400' },
    { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
    { id: 'warehouses', label: 'Warehouses', icon: Building2 },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'admin', label: 'Admin & Permissions', icon: ShieldCheck, adminOnly: true },
    { id: 'activity_logs', label: 'Activity Logs', icon: ClipboardList },
    { id: 'backups', label: 'Cloud Backups & DB', icon: CloudUpload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container: Slate primary navigation (#0f172a / #1e293b) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-wide uppercase">
                ENTERPRISE ERP
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider">
                INVENTORY & ACCOUNTING
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency & Context Pill */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">System Currency</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-xs tracking-wider">
            ETB (Birr)
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            if (item.adminOnly && currentUser?.role !== 'Admin' && !currentUser?.permissions?.admin?.view) {
              return null;
            }

            const isActive = activeView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.full_name.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{currentUser?.full_name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
