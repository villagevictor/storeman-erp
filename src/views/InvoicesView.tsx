import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatCurrencyETB, getWhatsAppShareUrl } from '../lib/whatsapp';

export const InvoicesView: React.FC = () => {
  const { transactions, setActiveReceiptTransaction } = useERP();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filterType === 'ALL' || t.type === filterType;
      const q = search.toLowerCase();
      const matchSearch =
        t.invoice_number.toLowerCase().includes(q) ||
        t.reference_number.toLowerCase().includes(q) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
        (t.material_name && t.material_name.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [transactions, search, filterType]);

  const totalSalesVolumeETB = transactions
    .filter(t => t.type === 'OUT')
    .reduce((acc, t) => acc + (t.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Invoices & Voucher Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete billing records, Goods Received Notes (GRN), and WhatsApp receipt integration.
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Total Billed Sales</span>
          <span className="text-lg font-black text-blue-900">{formatCurrencyETB(totalSalesVolumeETB)}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice no, client, or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Documents ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('OUT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'OUT' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Invoices ({transactions.filter(t => t.type === 'OUT').length})
          </button>
          <button
            onClick={() => setFilterType('IN')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'IN' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GRN Vouchers ({transactions.filter(t => t.type === 'IN').length})
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Doc Type</th>
                <th className="py-3 px-4">Invoice / GRN No.</th>
                <th className="py-3 px-4">Client / Party</th>
                <th className="py-3 px-4">Material Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Total Amount (ETB)</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Receipt & Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No invoice documents match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isOut = tx.type === 'OUT';
                  const whatsAppUrl = getWhatsAppShareUrl(tx);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {isOut ? 'Sales Invoice' : 'GRN Stock In'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {tx.invoice_number}
                        <span className="block text-[10px] text-slate-600 font-normal">{tx.reference_number}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {tx.customer_name || 'Vendor Inflow'}
                        {tx.customer_phone && (
                          <span className="block text-[10px] text-slate-600 font-normal">{tx.customer_phone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">
                        {tx.material_name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {tx.quantity} {tx.material_unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrencyETB(tx.total_amount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(tx.timestamp).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveReceiptTransaction(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            title="View Thermal Receipt & Printable Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-600" />
                            <span>View</span>
                          </button>

                          {isOut && (
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
                              title="Send to Customer via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
