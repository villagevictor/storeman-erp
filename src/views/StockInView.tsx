import React, { useState } from 'react';
import { ArrowDownLeft, CheckCircle2, History, Package, Truck, FileCheck, Layers } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatCurrencyETB } from '../lib/whatsapp';

export const StockInView: React.FC = () => {
  const { materials, suppliers, warehouses, performStockIn, transactions, setActiveReceiptTransaction } = useERP();

  const [materialId, setMaterialId] = useState<string>(materials[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [referenceNumber, setReferenceNumber] = useState(`GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceNumber, setInvoiceNumber] = useState(`SUP-INV-${Math.floor(10000 + Math.random() * 90000)}`);

  const selectedMaterial = materials.find(m => m.id === materialId);
  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const warehouse = warehouses.find(w => w.id === selectedMaterial?.warehouse_id);

  const calculatedValuation = selectedMaterial && quantity ? Number(quantity) * Number(selectedMaterial.unit_price) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity === '' || Number(quantity) <= 0) return;

    const res = performStockIn({
      materialId,
      quantity: Number(quantity),
      supplierId: supplierId || null,
      referenceNumber: referenceNumber.trim(),
      invoiceNumber: invoiceNumber.trim(),
    });

    if (res.success && res.transaction) {
      // Reset form with new codes
      setQuantity('');
      setReferenceNumber(`GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setInvoiceNumber(`SUP-INV-${Math.floor(10000 + Math.random() * 90000)}`);
      // Offer opening receipt voucher
      setActiveReceiptTransaction(res.transaction);
    }
  };

  // Recent Stock In Transactions
  const recentStockIns = transactions.filter(t => t.type === 'IN').slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Stock In — Goods Received Note (GRN)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Receive inventory from suppliers, increase warehouse balance, and generate audit records.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Record Received Stock Entry</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Material to Receive</label>
              <select
                required
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-900"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.sku} — {m.name} (Current Stock: {m.stock_quantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Material Quick Info Bar */}
            {selectedMaterial && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Depot</span>
                  <span className="font-semibold text-slate-800">{warehouse?.name || 'Central Warehouse'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Stock</span>
                  <span className="font-black text-slate-900">{selectedMaterial.stock_quantity} {selectedMaterial.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit Valuation</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyETB(selectedMaterial.unit_price)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Received ({selectedMaterial?.unit || 'Units'})
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-900"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Receipt (GRN) No.</label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Invoice Code</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Total Valuation Preview */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Estimated Inflow Valuation:
                </span>
                <div className="text-xl font-black text-emerald-900">
                  {formatCurrencyETB(calculatedValuation)}
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Stock In</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Recent GRN Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent GRN Batches
            </h3>
          </div>

          <div className="space-y-3">
            {recentStockIns.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No Stock In entries recorded yet.</p>
            ) : (
              recentStockIns.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => setActiveReceiptTransaction(tx)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{tx.reference_number}</span>
                    <span className="text-emerald-700 font-bold">+{tx.quantity} {tx.material_unit}</span>
                  </div>
                  <div className="font-medium text-slate-900 mt-1 truncate">{tx.material_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60">
                    <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    <span className="font-semibold text-emerald-800">{formatCurrencyETB(tx.total_amount || 0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
