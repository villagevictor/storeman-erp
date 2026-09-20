import { Transaction } from '../types';

export function formatCurrencyETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('ETB', 'ETB ');
}

export function generateWhatsAppReceiptText(transaction: Transaction): string {
  const dateFormatted = new Date(transaction.timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalETB = formatCurrencyETB(transaction.total_amount || 0);
  const unitPriceETB = formatCurrencyETB(transaction.unit_price || 0);

  return `*🧾 OFFICIAL ERP SALES RECEIPT & INVOICE*
----------------------------------------
*Invoice No:* ${transaction.invoice_number}
*Ref Code:* ${transaction.reference_number}
*Date:* ${dateFormatted}
*Customer:* ${transaction.customer_name || 'Walk-in Client'}
${transaction.customer_phone ? `*Phone:* ${transaction.customer_phone}\n` : ''}*Warehouse:* ${transaction.warehouse_name || 'Central Depot'}
----------------------------------------
*ITEMS:*
• *${transaction.material_name}*
  Qty: ${transaction.quantity} ${transaction.material_unit || 'Units'} @ ${unitPriceETB}
----------------------------------------
*TOTAL PAID: ${totalETB}*
----------------------------------------
*Processed By:* ${transaction.performer_name || 'ERP System'}
_Thank you for your business with us!_
_Enterprise ERP System - Ethiopia_`;
}

export function getWhatsAppShareUrl(transaction: Transaction): string {
  const text = generateWhatsAppReceiptText(transaction);
  const encodedText = encodeURIComponent(text);

  if (transaction.customer_phone) {
    // Strip non-digits except leading +
    const cleanPhone = transaction.customer_phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}
