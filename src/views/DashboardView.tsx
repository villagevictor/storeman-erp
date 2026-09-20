import React, { useMemo } from 'react';
import {
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  Building2,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useERP } from '../context/ERPContext';
import { formatCurrencyETB } from '../lib/whatsapp';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { materials, transactions, activityLogs, selectedWarehouseId, warehouses } = useERP();

  // Filter materials by warehouse if selected
  const filteredMaterials = useMemo(() => {
    if (selectedWarehouseId === 'ALL') return materials;
    return materials.filter(m => m.warehouse_id === selectedWarehouseId);
  }, [materials, selectedWarehouseId]);

  // KPI Calculations
  const totalMaterialsCount = filteredMaterials.length;
  const totalStockQuantity = filteredMaterials.reduce((acc, m) => acc + Number(m.stock_quantity), 0);
  const totalValuationETB = filteredMaterials.reduce(
    (acc, m) => acc + Number(m.stock_quantity) * Number(m.unit_price),
    0
  );
  const lowStockMaterials = filteredMaterials.filter(
    m => Number(m.stock_quantity) <= Number(m.min_threshold)
  );
  const lowStockCount = lowStockMaterials.length;

  const activeWarehouseName = useMemo(() => {
    if (selectedWarehouseId === 'ALL') return 'All Ethiopian Warehouses';
    return warehouses.find(w => w.id === selectedWarehouseId)?.name || 'Selected Depot';
  }, [selectedWarehouseId, warehouses]);

  // Recharts: Top 5 Materials by ETB Valuation
  const topValuationData = useMemo(() => {
    return [...filteredMaterials]
      .sort((a, b) => b.stock_quantity * b.unit_price - a.stock_quantity * a.unit_price)
      .slice(0, 5)
      .map(m => ({
        name: m.name.length > 18 ? m.name.slice(0, 18) + '...' : m.name,
        sku: m.sku,
        valuation: Math.round(m.stock_quantity * m.unit_price),
        stock: m.stock_quantity,
        unit: m.unit,
      }));
  }, [filteredMaterials]);

  // Recharts: Stock Movement Trends (In vs Out over recent transactions)
  const movementTrendData = useMemo(() => {
    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group transactions by date
    const dateMap = new Map<string, { date: string; stockIn: number; stockOut: number }>();

    sortedTxs.forEach(tx => {
      const dateStr = new Date(tx.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, stockIn: 0, stockOut: 0 });
      }

      const item = dateMap.get(dateStr)!;
      if (tx.type === 'IN') {
        item.stockIn += Number(tx.quantity);
      } else {
        item.stockOut += Number(tx.quantity);
      }
    });

    const list = Array.from(dateMap.values());
    // Ensure we have at least sample points for display
    if (list.length === 0) {
      return [
        { date: 'Mon', stockIn: 150, stockOut: 40 },
        { date: 'Tue', stockIn: 300, stockOut: 120 },
        { date: 'Wed', stockIn: 200, stockOut: 85 },
        { date: 'Thu', stockIn: 500, stockOut: 210 },
      ];
    }
    return list;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Active Depot Context & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ERP Operations Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Viewing: <strong>{activeWarehouseName}</strong> • Currency: <strong>Ethiopian Birr (ETB)</strong></span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setActiveView('stock_in')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock In (GRN)</span>
          </button>

          <button
            onClick={() => setActiveView('stock_out')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out / Bill</span>
          </button>

          <button
            onClick={() => setActiveView('materials')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Material</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Materials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Materials
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalMaterialsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Cataloged item SKU entries</div>
          </div>
        </div>

        {/* Card 2: Total Units in Stock */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Units in Inventory
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStockQuantity.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Physical pieces, bags & rolls</div>
          </div>
        </div>

        {/* Card 3: Stock Valuation ETB */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Valuation
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatCurrencyETB(totalValuationETB)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total current asset worth</div>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div
          onClick={() => setActiveView('materials')}
          className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between cursor-pointer transition ${
            lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1">
              {lowStockCount > 0
                ? 'Below minimum safety threshold'
                : 'All stock levels healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stock Movement Trends (In vs Out) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Stock Movement Dynamics
              </h3>
              <p className="text-xs text-slate-500">Material flow comparison: Stock In (GRN) vs Stock Out</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> In
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Out
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="stockIn" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#gradIn)" name="Stock In" />
                <Area type="monotone" dataKey="stockOut" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#gradOut)" name="Stock Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Materials by ETB Valuation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Top Inventory Valuation (ETB)
              </h3>
              <p className="text-xs text-slate-500">Highest value capital materials in storage</p>
            </div>
            <button
              onClick={() => setActiveView('materials')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topValuationData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={val => `${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrencyETB(Number(val)), 'Asset Valuation']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="valuation" fill="#2563eb" radius={[6, 6, 0, 0]} name="Valuation (ETB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert Items Table & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items Warning Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Critical Threshold Watchlist
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              {lowStockCount} Requires Replenishment
            </span>
          </div>

          {lowStockMaterials.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All inventory levels are safely above required thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Material Name</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">Min Threshold</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockMaterials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{m.sku}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{m.name}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-rose-600">
                          {m.stock_quantity} {m.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {m.min_threshold} {m.unit}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setActiveView('stock_in')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] border border-emerald-200 transition"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Logs Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Audit Trail
              </h3>
            </div>
            <button
              onClick={() => setActiveView('activity_logs')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  {log.details?.message ||
                   log.details?.material ||
                   log.details?.customer ||
                   JSON.stringify(log.details).slice(0, 50)}
                </p>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">
                  By: {log.user_name || 'Admin'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
