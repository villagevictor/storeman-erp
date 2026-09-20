import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useERP } from '../context/ERPContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bg = 'bg-slate-900 border-emerald-600/50 text-white';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-slate-900 border-rose-600/50 text-white';
          Icon = AlertOctagon;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-slate-900 border-amber-600/50 text-white';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            id={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl transition transform ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight">{toast.title}</div>
              <div className="text-xs text-slate-300 mt-1 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-slate-800 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
