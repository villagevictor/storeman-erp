import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  Download,
  Upload,
  Database,
  CheckCircle2,
  RefreshCw,
  Copy,
  Terminal,
  Server,
  AlertTriangle,
  Code,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { SUPABASE_SCHEMA_SQL } from '../lib/supabase';

export const BackupsView: React.FC = () => {
  const {
    isSupabaseConnected,
    checkSupabaseStatus,
    exportFullDatabaseBackup,
    restoreDatabaseBackup,
    addToast,
    materials,
    transactions,
    suppliers,
    warehouses,
    allProfiles,
  } = useERP();

  const [checking, setChecking] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestConnection = async () => {
    setChecking(true);
    await checkSupabaseStatus();
    setChecking(false);
  };

  const handleDownloadBackup = () => {
    const backupJson = exportFullDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise_erp_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Exported', 'Full ERP database dump downloaded successfully.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = restoreDatabaseBackup(content);
        if (success) {
          addToast('success', 'Database Restored', 'All tables and inventory records successfully restored.');
        } else {
          addToast('error', 'Restore Failed', 'Invalid backup file format.');
        }
      } catch (err: any) {
        addToast('error', 'Restore Error', err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    addToast('success', 'SQL Copied', 'Full Supabase schema SQL copied to clipboard.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CloudUpload className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cloud Database, Sync & Data Backups
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Supabase PostgreSQL engine, complete JSON export/restore dumps, and DDL schema scripts.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-blue-600' : ''}`} />
          <span>Ping Supabase Server</span>
        </button>
      </div>

      {/* Status & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
            isSupabaseConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Connection State</span>
            <div className="text-base font-extrabold text-slate-900">
              {isSupabaseConnected ? 'Supabase Connected' : 'Local Hybrid Store'}
            </div>
            <div className="text-xs text-slate-500">
              {isSupabaseConnected ? 'Production PostgreSQL instance active' : 'Offline-first indexed storage active'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Entities in Storage</span>
            <div className="text-base font-extrabold text-slate-900">
              {materials.length + transactions.length + suppliers.length + warehouses.length} Records
            </div>
            <div className="text-xs text-slate-500">
              {materials.length} materials • {transactions.length} transactions
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Security Guard</span>
            <div className="text-base font-extrabold text-slate-900">Row-Level Security (RLS)</div>
            <div className="text-xs text-slate-500">Enforced by profiles.status guard</div>
          </div>
        </div>
      </div>

      {/* Backup & Restore Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Download Full Database Dump</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Exports a complete snapshot of all relational tables: Materials, Warehouses, Suppliers, Transactions, User Profiles, and System Settings as a standard JSON schema dump.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Snapshot</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Restore ERP From Backup</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Upload an existing JSON backup dump file to restore materials, transaction histories, and user access records.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select Backup File to Restore</span>
          </button>
        </div>
      </div>

      {/* Supabase SQL DDL Schema Scripts with 1-Click Copy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Supabase SQL Schema & DDL Scripts</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy this SQL script directly into your Supabase SQL Editor to initialize all tables, foreign keys, triggers, and Row-Level Security policies.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition"
          >
            {copiedSql ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Schema SQL'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
