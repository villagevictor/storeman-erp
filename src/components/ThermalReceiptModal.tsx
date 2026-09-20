import React, { useState } from 'react';
import { Printer, Share2, MessageSquare, X, CheckCircle, FileText, Receipt, Copy } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatCurrencyETB, getWhatsAppShareUrl, generateWhatsAppReceiptText } from '../lib/whatsapp';

export const ThermalReceiptModal: React.FC = () => {
  const { activeReceiptTransaction, setActiveReceiptTransaction, addToast } = useERP();
  const [viewMode, setViewMode] = useState<'thermal' | 'invoice'>('thermal');

  if (!activeReceiptTransaction) return null;

  const tx = activeReceiptTransaction;
  const isStockOut = tx.type === 'OUT';
  const totalETB = formatCurrencyETB(tx.total_amount || (tx.quantity * (tx.unit_price || 0)));
  const unitPriceETB = formatCurrencyETB(tx.unit_price || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = generateWhatsAppReceiptText(tx);
    navigator.clipboard.writeText(text);
    addToast('info', 'Receipt Copied', 'Receipt summary copied to clipboard.');
  };

  const whatsAppUrl = getWhatsAppShareUrl(tx);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Actions - Hidden on Print */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-none">
                {isStockOut ? 'Sales Receipt & Tax Invoice' : 'Goods Received Voucher (GRN)'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Ref: {tx.invoice_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex gap-1 text-xs">
              <button
                onClick={() => setViewMode('thermal')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  viewMode === 'thermal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                onClick={() => setViewMode('invoice')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  viewMode === 'invoice' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Standard Invoice
              </button>
            </div>

            <button
              onClick={() => setActiveReceiptTransaction(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Close receipt modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {viewMode === 'thermal' ? (
            /* 80mm POS Thermal Receipt View */
            <div className="receipt-container w-full max-w-[340px] bg-white p-6 shadow-md border border-slate-300 rounded-sm font-mono text-xs text-slate-800 leading-relaxed">
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <div className="text-base font-bold tracking-wider uppercase text-slate-950">ENTERPRISE ERP PLC</div>
                <div className="text-[10px] text-slate-600">INDUSTRIAL & INVENTORY SOLUTIONS</div>
                <div className="text-[10px] text-slate-600">Addis Ababa, Ethiopia • TIN: 0098451293</div>
                <div className="text-[10px] text-slate-600 mt-1">Tel: +251 11 661 2233</div>
              </div>

              <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">INVOICE NO:</span>
                  <span className="font-bold">{tx.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REF CODE:</span>
                  <span>{tx.reference_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DATE & TIME:</span>
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WAREHOUSE:</span>
                  <span className="font-semibold text-right max-w-[160px] truncate">{tx.warehouse_name}</span>
                </div>
                {tx.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">CUSTOMER:</span>
                    <span className="font-bold text-right max-w-[160px] truncate">{tx.customer_name}</span>
                  </div>
                )}
                {tx.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PHONE:</span>
                    <span>{tx.customer_phone}</span>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="py-3 border-b border-dashed border-slate-400">
                <div className="font-bold text-[11px] mb-1.5 uppercase text-slate-900">
                  {tx.material_name}
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>{tx.quantity} {tx.material_unit} x {unitPriceETB}</span>
                  <span className="font-bold">{totalETB}</span>
                </div>
              </div>

              {/* Totals */}
              <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-400 text-xs">
                <div className="flex justify-between font-bold text-sm text-slate-950">
                  <span>TOTAL (ETB):</span>
                  <span>{totalETB}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>PAYMENT MODE:</span>
                  <span>CASH / BANK TRANSFER</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ISSUED BY:</span>
                  <span>{tx.performer_name}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="pt-4 text-center">
                <div className="flex justify-center items-end gap-1 h-10 px-4">
                  {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((h, i) => (
                    <div
                      key={i}
                      className="bg-slate-900"
                      style={{
                        width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '2px',
                        height: `${20 + (h * 2)}px`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[10px] tracking-widest text-slate-600 mt-1 font-mono">
                  *{tx.invoice_number}*
                </div>
                <div className="text-[9px] text-slate-500 mt-2 uppercase">
                  Valid with official seal • Thank you for your business
                </div>
              </div>
            </div>
          ) : (
            /* Standard A4 Tax Invoice View */
            <div className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 text-slate-800 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ENTERPRISE ERP PLC</h1>
                  <p className="text-slate-500 mt-0.5">Heavy Industry, Logistics & Supplies</p>
                  <p className="text-slate-500 mt-1">Bole Road, Mega Building 4th Floor</p>
                  <p className="text-slate-500">Addis Ababa, Ethiopia | TIN: 0098451293</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-md text-xs uppercase">
                    TAX INVOICE
                  </span>
                  <p className="font-mono text-sm font-bold text-slate-900 mt-2">{tx.invoice_number}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Date: {new Date(tx.timestamp).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Billed To:</h4>
                  <p className="font-bold text-slate-900 text-sm">{tx.customer_name || 'Walk-in Client'}</p>
                  {tx.customer_phone && <p className="text-slate-600 mt-0.5">Phone: {tx.customer_phone}</p>}
                  <p className="text-slate-500">Delivery: Ex-Warehouse</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Dispatch Depot:</h4>
                  <p className="font-bold text-slate-900">{tx.warehouse_name}</p>
                  <p className="text-slate-600 mt-0.5">Ref No: {tx.reference_number}</p>
                  <p className="text-slate-600">Handler: {tx.performer_name}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full my-5 border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (ETB)</th>
                    <th className="py-2.5 px-3 text-right">Total (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900">{tx.material_name}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{tx.material_unit}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">{tx.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{unitPriceETB}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{totalETB}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-3">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{totalETB}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (15% inclusive):</span>
                    <span>ETB 0.00</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{totalETB}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p>Terms: Immediate Payment upon delivery.</p>
                  <p>Bank: Commercial Bank of Ethiopia (CBE) A/C 10002883921</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-300 w-36 mb-1"></div>
                  <p>Authorized Signature & Stamp</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Print, WhatsApp & Copy */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex flex-wrap gap-2.5 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
          </div>

          {/* WhatsApp Action Button */}
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-md hover:shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
