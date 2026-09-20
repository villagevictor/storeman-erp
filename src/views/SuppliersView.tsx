import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, MapPin, PackageCheck, X } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Supplier } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, transactions, currentUser } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+251 ');
  const [address, setAddress] = useState('');

  const openAdd = () => {
    setEditingSup(null);
    setName('');
    setPhone('+251 ');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSup(s);
    setName(s.name);
    setPhone(s.phone);
    setAddress(s.address || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingSup) {
      updateSupplier(editingSup.id, name.trim(), phone.trim(), address.trim());
    } else {
      addSupplier(name.trim(), phone.trim(), address.trim());
    }
    setIsModalOpen(false);
  };

  const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.permissions?.suppliers?.create;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Suppliers & Vendor Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered industrial material manufacturers, importers, and regional supply vendors.
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={!canManage}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map(sup => {
          const supplierStockIns = transactions.filter(t => t.supplier_id === sup.id);

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(sup)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete supplier ${sup.name}?`)) {
                            deleteSupplier(sup.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{sup.name}</h3>

                <div className="space-y-1.5 mt-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{sup.phone}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{sup.address}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">GRN Deliveries:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {supplierStockIns.length} recorded
                </span>
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
                {editingSup ? 'Update Supplier Profile' : 'Register New Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ethiopian Steel & Pipe Mills"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+251 11 551 2233"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Address / Plant Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Dukem Industrial Zone, Oromia"
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
                  {editingSup ? 'Save Updates' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
