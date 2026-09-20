import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Building2,
  Database,
  Send,
  CheckCircle2,
  AlertCircle,
  Save,
  Key,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { sendLowStockAlertEmail } from '../lib/emailjs';

export const SettingsView: React.FC = () => {
  const { systemSettings, updateSettings, addToast, materials } = useERP();

  const [companyName, setCompanyName] = useState(systemSettings.company_name);
  const [currency, setCurrency] = useState(systemSettings.currency);
  const [tin, setTin] = useState(systemSettings.tin_number);
  const [address, setAddress] = useState(systemSettings.address);
  const [phone, setPhone] = useState(systemSettings.phone);

  // EmailJS settings
  const [serviceId, setServiceId] = useState(systemSettings.emailjs_service_id || 'service_enterprise_erp');
  const [templateId, setTemplateId] = useState(systemSettings.emailjs_template_id || 'template_low_stock');
  const [publicKey, setPublicKey] = useState(systemSettings.emailjs_public_key || 'user_public_key_mock');
  const [alertEmail, setAlertEmail] = useState(systemSettings.alert_recipient_email || 'ashenafihailay645@gmail.com');

  const [testingEmail, setTestingEmail] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      company_name: companyName,
      currency,
      tin_number: tin,
      address,
      phone,
      emailjs_service_id: serviceId,
      emailjs_template_id: templateId,
      emailjs_public_key: publicKey,
      alert_recipient_email: alertEmail,
    });
    addToast('success', 'Settings Saved', 'System configurations updated successfully.');
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    const sampleMaterial = materials.find(m => m.stock_quantity <= m.min_threshold) || materials[0];

    const res = await sendLowStockAlertEmail({
      materialName: sampleMaterial?.name || 'Deformed Rebar Steel 12mm',
      sku: sampleMaterial?.sku || 'ET-STL-012',
      currentStock: sampleMaterial?.stock_quantity || 15,
      minThreshold: sampleMaterial?.min_threshold || 25,
      unit: sampleMaterial?.unit || 'Pcs',
      warehouseName: 'Addis Ababa Central Depot',
      recipientEmail: alertEmail,
      serviceId,
      templateId,
      publicKey,
    });

    setTestingEmail(false);
    if (res.success) {
      addToast('success', 'Email Alert Dispatched', `Test low-stock notification sent to ${alertEmail}`);
    } else {
      addToast('warning', 'Email Notification Note', `${res.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Enterprise Configuration & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize company legal entities, tax TIN numbers, and configure EmailJS alert credentials.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Legal Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Company & Invoice Identity
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TIN Number (Ethiopia)</label>
                <input
                  type="text"
                  value={tin}
                  onChange={e => setTin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Head Office Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* EmailJS & Low Stock Alerting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  EmailJS Low Stock Alert Service
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Automated
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Alert Recipient Email
              </label>
              <input
                type="email"
                required
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-blue-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Instant email alerts will be sent here whenever inventory drops to or below the minimum threshold.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service ID</label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template ID</label>
                <input
                  type="text"
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Public Key / User ID</label>
              <input
                type="text"
                value={publicKey}
                onChange={e => setPublicKey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>

            {/* Test Email Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{testingEmail ? 'Sending Test Alert...' : 'Send Test Low-Stock Email Alert'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
