import React, { useState } from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  Printer,
  MessageSquare,
  History,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatCurrencyETB } from '../lib/whatsapp';

export const StockOutView: React.FC = () => {
  const { materials, warehouses, performStockOut, transactions, setActiveReceiptTransaction } = useERP();

  const [materialId, setMaterialId] = useState<string>(materials[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+251 ');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [referenceNumber, setReferenceNumber] = useState(`DO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMaterial = materials.find(m => m.id === materialId);
  const warehouse = warehouses.find(w => w.id === selectedMaterial?.warehouse_id);

  const availableStock = selectedMaterial ? Number(selectedMaterial.stock_quantity) : 0;
  const isInsufficient = quantity !== '' && Number(quantity) > availableStock;
  const totalBillETB = selectedMaterial && quantity ? Number(quantity) * Number(selectedMaterial.unit_price) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity === '' || !customerName || isInsufficient) return;

    setIsSubmitting(true);
    const res = await performStockOut({
      materialId,
      quantity: Number(quantity),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      invoiceNumber: invoiceNumber.trim(),
      referenceNumber: referenceNumber.trim(),
    });
    setIsSubmitting(false);

    if (res.success && res.transaction) {
      // Refresh form
      setQuantity('');
      setCustomerName('');
      setCustomerPhone('+251 ');
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setReferenceNumber(`DO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const recentStockOuts = transactions.filter(t => t.type === 'OUT').slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Stock Out & Tax Invoicing
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Issue goods, enforce Insufficient Stock Guards, generate 80mm thermal receipts, and dispatch low-stock alerts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer / Client Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Sunshine Construction PLC"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Phone (for WhatsApp Receipt)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+251 911 234 567"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Material Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Material to Issue</label>
              <select
                required
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white text-slate-900"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.sku} — {m.name} (Available: {m.stock_quantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level Live Banner */}
            {selectedMaterial && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Depot Location</span>
                  <span className="font-semibold text-slate-800">{warehouse?.name || 'Central Warehouse'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit Price</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyETB(selectedMaterial.unit_price)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Available in Stock</span>
                  <span
                    className={`font-black text-sm ${
                      availableStock === 0
                        ? 'text-rose-600'
                        : availableStock <= selectedMaterial.min_threshold
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {availableStock} {selectedMaterial.unit}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Out with Insufficient Stock Guard */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity to Issue ({selectedMaterial?.unit || 'Units'}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Max ${availableStock}`}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-hidden font-mono text-base font-bold ${
                  isInsufficient
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-rose-500 text-slate-900'
                }`}
              />

              {/* Insufficient Stock Guard Warning */}
              {isInsufficient && (
                <div className="mt-2 p-3 bg-rose-100/80 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong>Insufficient Stock Guard Triggered:</strong> You requested{' '}
                    <strong>{quantity} {selectedMaterial?.unit}</strong>, but only{' '}
                    <strong>{availableStock} {selectedMaterial?.unit}</strong> is in warehouse storage.
                    Transaction is blocked to prevent negative inventory balance.
                  </div>
                </div>
              )}
            </div>

            {/* Document Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Order (DO) Ref</label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Bill Summary & Submit */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Total Payable (ETB):
                </span>
                <div className="text-2xl font-black text-rose-900">
                  {formatCurrencyETB(totalBillETB)}
                </div>
              </div>

              <button
                type="submit"
                disabled={isInsufficient || isSubmitting || quantity === ''}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Invoice...' : 'Generate Invoice & Thermal Receipt'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Invoices / Stock Out Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Invoices & Outflow
            </h3>
          </div>

          <div className="space-y-3">
            {recentStockOuts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No Stock Out transactions recorded.</p>
            ) : (
              recentStockOuts.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => setActiveReceiptTransaction(tx)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-rose-300 bg-slate-50/50 hover:bg-rose-50/30 cursor-pointer transition text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{tx.invoice_number}</span>
                    <span className="text-rose-600 font-bold">-{tx.quantity} {tx.material_unit}</span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1 truncate">{tx.customer_name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{tx.material_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60">
                    <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-900">{formatCurrencyETB(tx.total_amount || 0)}</span>
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
