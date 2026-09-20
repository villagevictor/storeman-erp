import React from 'react';
import { LayoutDashboard, Package, ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'stock_in', label: 'Stock In', icon: ArrowDownLeft },
    { id: 'stock_out', label: 'Stock Out', icon: ArrowUpRight },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950 border-t border-slate-800 px-2 py-1 flex justify-around items-center no-print">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
