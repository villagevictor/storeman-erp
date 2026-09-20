import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Package, TrendingUp, X } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Warehouse } from '../types';
import { formatCurrencyETB } from '../lib/whatsapp';

export const WarehousesView: React.FC = () => {
  const { warehouses, materials, addWarehouse, updateWarehouse, deleteWarehouse, currentUser } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const openAdd = () => {
    setEditingWh(null);
    setName('');
    setLocation('');
    setIsModalOpen(true);
  };

  const openEdit = (wh: Warehouse) => {
    setEditingWh(wh);
    setName(wh.name);
    setLocation(wh.location);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    if (editingWh) {
      updateWarehouse(editingWh.id, name, location);
    } else {
      addWarehouse(name, location);
    }
    setIsModalOpen(false);
  };

  const canManage = currentUser?.role === 'Admin' || currentUser?.permissions?.warehouses?.create;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Warehouse Network & Depots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage regional industrial distribution hubs across Ethiopia and track localized asset values.
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={!canManage}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map(wh => {
          const whMaterials = materials.filter(m => m.warehouse_id === wh.id);
          const totalValuation = whMaterials.reduce((acc, m) => acc + (m.stock_quantity * m.unit_price), 0);
          const totalUnits = whMaterials.reduce((acc, m) => acc + Number(m.stock_quantity), 0);

          return (
            <div
              key={wh.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(wh)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Warehouse"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete warehouse ${wh.name}?`)) {
                            deleteWarehouse(wh.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Warehouse"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{wh.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{wh.location}</span>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Items Stored</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {whMaterials.length} SKUs ({totalUnits.toLocaleString()} units)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Valuation</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {formatCurrencyETB(totalValuation)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingWh ? 'Update Warehouse' : 'Add New Warehouse Depot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hawassa Industrial Depot"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Location & Address</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Hawassa Eco-Industrial Park, Sidama Region"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingWh ? 'Save Updates' : 'Add Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
