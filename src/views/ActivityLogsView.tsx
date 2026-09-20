import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, Clock, User, ShieldCheck } from 'lucide-react';
import { useERP } from '../context/ERPContext';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs } = useERP();
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user_name.toLowerCase().includes(q) ||
        JSON.stringify(log.details).toLowerCase().includes(q)
      );
    });
  }, [activityLogs, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Enterprise Activity Logs & Audit Trail
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable system logs tracking inventory mutations, user role adjustments, and financial dispatches.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action, staff name, or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Authorized User</th>
                <th className="py-3 px-4">Audit Details & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No activity logs recorded matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-bold text-xs font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
