import React, { useState } from 'react';
import { ShieldAlert, Clock, Ban, UserCheck, KeyRound, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredModule?: string;
  requiredAction?: 'view' | 'create' | 'update' | 'delete' | 'manage_users' | 'restore';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredModule = 'dashboard',
  requiredAction = 'view',
}) => {
  const { currentUser, loginAs, signUp, allProfiles, warehouses } = useERP();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Staff');
  const [formWarehouse, setFormWarehouse] = useState<string>('');

  // 1. Not signed in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              ERP
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ethiopia Enterprise ERP</h2>
              <p className="text-xs text-slate-500">Sign in to access industrial operations</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Sign In as Demo User</p>
            {allProfiles.map(p => (
              <button
                key={p.id}
                onClick={() => loginAs(p.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{p.full_name}</div>
                  <div className="text-xs text-slate-500">{p.email} • <span className="font-medium text-slate-700">{p.role}</span></div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  p.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {p.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Pending Approval Guard Screen
  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 ring-8 ring-amber-50">
            <Clock className="w-8 h-8 animate-spin" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            Status: Pending Approval
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Registration Under Review</h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Welcome, <strong className="text-slate-800">{currentUser.full_name}</strong>! Your ERP profile has been created in the database and an automatic alert has been dispatched to the Administrator (<strong className="text-slate-700">ashenafihailay645@gmail.com</strong>).
          </p>
          <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-4 h-4" /> Security Guard Policy (Row-Level Security)
            </p>
            <p>
              In accordance with enterprise safety standards, your account must be granted role privileges and warehouse access by an Administrator before accessing ERP inventory, stock in/out, and financial valuation records.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => loginAs('user-admin-01')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Admin to Approve</span>
            </button>
            <button
              onClick={() => loginAs('user-manager-02')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
            >
              <span>Switch to Active Manager</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Blocked User Guard Screen
  if (currentUser.status === 'blocked') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 ring-8 ring-rose-50">
            <Ban className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            Access Blocked
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Account Suspended</h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Your account (<strong className="text-slate-800">{currentUser.email}</strong>) has been restricted by the System Administrator. All inventory read and write operations are temporarily locked.
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={() => loginAs('user-admin-01')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Feature-Level Permission Guard
  const permissions = currentUser.permissions as any;
  const modulePerms = permissions?.[requiredModule];
  const hasAccess = modulePerms ? Boolean(modulePerms[requiredAction] ?? modulePerms.view) : true;

  if (!hasAccess && currentUser.role !== 'Admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-600">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Restricted Module Access</h3>
          <p className="text-sm text-slate-600 mt-2">
            Your role (<span className="font-semibold text-slate-800">{currentUser.role}</span>) does not have permission to access the <strong>{requiredModule.replace('_', ' ').toUpperCase()}</strong> module with <strong>{requiredAction}</strong> rights.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => loginAs('user-admin-01')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Log In as Administrator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const SignUpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { signUp, warehouses } = useERP();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    setSubmitting(true);
    await signUp(email, fullName, role, warehouseId || null);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Register ERP Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Sign up with your credentials. New user accounts are initialized with <strong>pending</strong> status and require Administrator authorization before granting inventory privileges.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Almaz Kebede"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="almaz@enterprise.et"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Staff">Warehouse Staff</option>
                <option value="Manager">Inventory Manager</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse</label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Registering Account...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
