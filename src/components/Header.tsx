import React, { useState } from 'react';
import {
  Building2,
  Database,
  UserCheck,
  Bell,
  Menu,
  ChevronDown,
  UserPlus,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { PWAInstallButton } from './PWAInstallButton';
import { SignUpModal } from './AuthGuard';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeView, setActiveView }) => {
  const {
    currentUser,
    allProfiles,
    loginAs,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    materials,
    isSupabaseConnected,
    checkSupabaseStatus,
  } = useERP();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [checkingDb, setCheckingDb] = useState(false);

  // Count low stock
  const lowStockCount = materials.filter(m => m.stock_quantity <= m.min_threshold).length;

  const handleTestSupabase = async () => {
    setCheckingDb(true);
    await checkSupabaseStatus();
    setCheckingDb(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between no-print shadow-xs">
        {/* Left Side: Mobile Menu + Warehouse Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Warehouse Selector */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <label htmlFor="warehouse-filter" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 leading-none">
                Active Depot
              </label>
              <select
                id="warehouse-filter"
                value={selectedWarehouseId}
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value="ALL">All Ethiopian Warehouses (Consolidated)</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: PWA Button + Status Badges + Notifications + Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Supabase Connection Status Pill */}
          <button
            onClick={handleTestSupabase}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="Click to check Supabase backend status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Live' : 'Offline / Local Store'}</span>
            {checkingDb && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
          </button>

          {/* Low Stock Quick Alert */}
          {lowStockCount > 0 && (
            <button
              onClick={() => setActiveView('materials')}
              className="relative p-2 rounded-lg text-amber-700 hover:bg-amber-50 transition border border-amber-200"
              title={`${lowStockCount} items below minimum safety threshold`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {lowStockCount}
              </span>
            </button>
          )}

          {/* User Profile Switcher Dropdown */}
          <div className="relative">
            <button
              id="btn-profile-dropdown"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.full_name.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.full_name || 'Sign In'}
                </div>
                <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider leading-none">
                  {currentUser?.role || 'Guest'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">{currentUser?.full_name}</div>
                  <div className="text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                      {currentUser?.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                      currentUser?.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      currentUser?.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentUser?.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Switch Demo Profile Options */}
                <div className="px-3 py-1.5">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Switch Test Profile:
                  </div>
                  <div className="space-y-1">
                    {allProfiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          loginAs(p.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                          currentUser?.id === p.id
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-medium">{p.full_name}</div>
                          <div className="text-[10px] text-slate-600">{p.role} • {p.status}</div>
                        </div>
                        {currentUser?.id === p.id && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1.5 mt-1 px-3">
                  <button
                    onClick={() => {
                      setIsSignUpOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register New Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign Up Modal */}
      <SignUpModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </>
  );
};
