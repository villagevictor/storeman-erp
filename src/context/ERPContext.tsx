import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ActivityLog,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_MANAGER_PERMISSIONS,
  DEFAULT_STAFF_PERMISSIONS,
  Material,
  Profile,
  StoreBackup,
  Supplier,
  SystemSettings,
  ToastMessage,
  Transaction,
  UserPermissions,
  UserRole,
  UserStatus,
  Warehouse,
} from '../types';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MATERIALS,
  INITIAL_PROFILES,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_WAREHOUSES,
} from '../lib/mockData';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabase';
import { sendLowStockAlertEmail, sendNewUserAlertEmail } from '../lib/emailjs';

interface StockInPayload {
  materialId: string;
  quantity: number;
  supplierId: string | null;
  referenceNumber: string;
  invoiceNumber: string;
}

interface StockOutPayload {
  materialId: string;
  quantity: number;
  customerName: string;
  customerPhone?: string;
  invoiceNumber: string;
  referenceNumber?: string;
}

interface ERPContextType {
  // Current user & profiles
  currentUser: Profile | null;
  allProfiles: Profile[];
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  loginAs: (profileId: string) => void;
  signUp: (email: string, fullName: string, role: UserRole, warehouseId: string | null) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  approveUser: (userId: string, role: UserRole, warehouseId: string | null, permissions?: UserPermissions) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserPermissions: (userId: string, permissions: UserPermissions) => void;
  deleteProfile: (userId: string) => void;

  // Inventory Data
  materials: Material[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  backups: StoreBackup[];

  // CRUD Operations
  addWarehouse: (name: string, location: string) => void;
  updateWarehouse: (id: string, name: string, location: string) => void;
  deleteWarehouse: (id: string) => void;

  addSupplier: (name: string, phone: string, address?: string) => void;
  updateSupplier: (id: string, name: string, phone: string, address?: string) => void;
  deleteSupplier: (id: string) => void;

  addMaterial: (material: Omit<Material, 'id' | 'created_at'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Stock operations
  performStockIn: (payload: StockInPayload) => { success: boolean; transaction?: Transaction; error?: string };
  performStockOut: (payload: StockOutPayload) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;

  // Cloud Backups
  saveCloudBackup: () => Promise<{ success: boolean; message: string }>;
  restoreCloudBackup: (backupId?: string) => Promise<{ success: boolean; message: string }>;
  exportFullDatabaseBackup: () => string;
  restoreDatabaseBackup: (jsonContent: string) => boolean;
  resetToInitialData: () => void;

  // System Settings
  systemSettings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Supabase sync
  isSupabaseConnected: boolean;
  checkSupabaseStatus: () => Promise<boolean>;

  // Receipts
  activeReceiptTransaction: Transaction | null;
  setActiveReceiptTransaction: (tx: Transaction | null) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_PREFIX = 'erp_storage_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [profiles, setProfiles] = useState<Profile[]>(() => getStored('profiles', INITIAL_PROFILES));
  const [currentUserId, setCurrentUserId] = useState<string>(() => getStored('current_user_id', 'user-admin-01'));
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => getStored('warehouses', INITIAL_WAREHOUSES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', INITIAL_SUPPLIERS));
  const [materials, setMaterials] = useState<Material[]>(() => getStored('materials', INITIAL_MATERIALS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStored('transactions', INITIAL_TRANSACTIONS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getStored('activity_logs', INITIAL_ACTIVITY_LOGS));
  const [backups, setBackups] = useState<StoreBackup[]>(() => getStored('backups', []));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() =>
    getStored<SystemSettings>('system_settings', {
      company_name: 'ENTERPRISE ERP PLC',
      currency: 'ETB',
      tin_number: '0098451293',
      address: 'Bole Road, Mega Building 4th Floor, Addis Ababa, Ethiopia',
      phone: '+251 11 661 2233',
      emailjs_service_id: 'service_enterprise_erp',
      emailjs_template_id: 'template_low_stock',
      emailjs_public_key: 'user_public_key_mock',
      alert_recipient_email: 'ashenafihailay645@gmail.com',
    })
  );

  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => { setStored('profiles', profiles); }, [profiles]);
  useEffect(() => { setStored('current_user_id', currentUserId); }, [currentUserId]);
  useEffect(() => { setStored('warehouses', warehouses); }, [warehouses]);
  useEffect(() => { setStored('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStored('materials', materials); }, [materials]);
  useEffect(() => { setStored('transactions', transactions); }, [transactions]);
  useEffect(() => { setStored('activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { setStored('backups', backups); }, [backups]);
  useEffect(() => { setStored('system_settings', systemSettings); }, [systemSettings]);

  // Current User resolution
  const currentUser = useMemo(() => {
    return profiles.find(p => p.id === currentUserId) || profiles[0] || null;
  }, [profiles, currentUserId]);

  // Toast dispatch
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to log activities
  const logActivity = (action: string, details: Record<string, any>) => {
    const newLog: ActivityLog = {
      id: 'act-' + Math.random().toString(36).substr(2, 9),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.full_name || 'System Administrator',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Async push to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      supabase.from('activity_logs').insert([newLog]).then(() => {});
    }
  };

  // Check Supabase connection
  const checkSupabaseStatus = async (): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) {
      setIsSupabaseConnected(false);
      return false;
    }
    try {
      const { error } = await client.from('warehouses').select('id').limit(1);
      const isOk = !error;
      setIsSupabaseConnected(isOk);
      return isOk;
    } catch {
      setIsSupabaseConnected(false);
      return false;
    }
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  // Auth actions
  const loginAs = (profileId: string) => {
    const user = profiles.find(p => p.id === profileId);
    if (user) {
      setCurrentUserId(profileId);
      addToast('info', 'Switched User Profile', `Signed in as ${user.full_name} (${user.role})`);
      logActivity('User Switched Profile', { profile: user.full_name, role: user.role });
    }
  };

  const logout = () => {
    // switch to pending user for demo preview, or prompt login
    addToast('info', 'Logged Out', 'Signed out of session');
  };

  const signUp = async (email: string, fullName: string, role: UserRole, warehouseId: string | null) => {
    // Check if email exists
    if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
      addToast('error', 'Registration Failed', 'A user with this email address already exists.');
      return { success: false, message: 'Email already registered' };
    }

    const defaultPerms = role === 'Admin' 
      ? DEFAULT_ADMIN_PERMISSIONS 
      : role === 'Manager' 
      ? DEFAULT_STAFF_PERMISSIONS 
      : DEFAULT_STAFF_PERMISSIONS;

    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      company_id: 'comp-ethiopia-erp',
      warehouse_id: warehouseId,
      status: 'pending', // Starts in pending approval
      permissions: defaultPerms,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [...prev, newProfile]);
    setCurrentUserId(newProfile.id); // set as current so Access Guard triggers "Pending Approval"

    logActivity('New User Registration', {
      email: newProfile.email,
      full_name: newProfile.full_name,
      role: newProfile.role,
      status: 'pending',
    });

    // Send notification alert to Admin via EmailJS
    await sendNewUserAlertEmail({
      applicantName: newProfile.full_name,
      applicantEmail: newProfile.email,
      assignedRole: newProfile.role,
    });

    addToast(
      'warning',
      'Registration Submitted',
      'Your account is created and pending Administrator authorization. An alert was sent to the Admin.'
    );

    return { success: true, message: 'Account registered. Awaiting Administrator approval.' };
  };

  const approveUser = (userId: string, role: UserRole, warehouseId: string | null, permissions?: UserPermissions) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === userId) {
          const updatedPerms = permissions || (role === 'Admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS);
          return {
            ...p,
            status: 'active',
            role,
            warehouse_id: warehouseId,
            permissions: updatedPerms,
          };
        }
        return p;
      })
    );

    const targetUser = profiles.find(p => p.id === userId);
    addToast('success', 'User Approved', `${targetUser?.full_name || 'User'} has been approved and activated with ${role} privileges.`);
    logActivity('Admin Approved User Account', {
      approved_user_id: userId,
      approved_user: targetUser?.full_name,
      role,
      warehouse_id: warehouseId,
    });
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setProfiles(prev =>
      prev.map(p => (p.id === userId ? { ...p, status } : p))
    );
    const targetUser = profiles.find(p => p.id === userId);
    addToast('info', 'Status Updated', `${targetUser?.full_name} account status changed to: ${status.toUpperCase()}`);
    logActivity('Admin Modified User Status', {
      user: targetUser?.full_name,
      new_status: status,
    });
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === userId) {
          const perms = role === 'Admin' ? DEFAULT_ADMIN_PERMISSIONS : role === 'Manager' ? DEFAULT_MANAGER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;
          return { ...p, role, permissions: perms };
        }
        return p;
      })
    );
    const targetUser = profiles.find(p => p.id === userId);
    addToast('success', 'Role Updated', `Updated role for ${targetUser?.full_name || 'user'} to ${role}`);
    logActivity('Admin Modified User Role', { user_id: userId, role });
  };

  const updateUserPermissions = (userId: string, permissions: UserPermissions) => {
    setProfiles(prev =>
      prev.map(p => (p.id === userId ? { ...p, permissions } : p))
    );
    const targetUser = profiles.find(p => p.id === userId);
    addToast('success', 'Permissions Saved', `Updated granular permissions for ${targetUser?.full_name}`);
    logActivity('Admin Updated User Permissions', {
      user: targetUser?.full_name,
      permissions,
    });
  };

  const deleteProfile = (userId: string) => {
    const targetUser = profiles.find(p => p.id === userId);
    setProfiles(prev => prev.filter(p => p.id !== userId));
    addToast('info', 'User Removed', `Removed ${targetUser?.full_name || 'user'} from system.`);
    logActivity('Admin Removed User Account', { user_id: userId, name: targetUser?.full_name });
  };

  // Warehouses CRUD
  const addWarehouse = (name: string, location: string) => {
    const newWh: Warehouse = {
      id: 'wh-' + Math.random().toString(36).substr(2, 7),
      name: name.trim(),
      location: location.trim(),
      created_at: new Date().toISOString(),
    };
    setWarehouses(prev => [...prev, newWh]);
    addToast('success', 'Warehouse Created', `Added warehouse ${name}`);
    logActivity('Created Warehouse', { name, location });
  };

  const updateWarehouse = (id: string, name: string, location: string) => {
    setWarehouses(prev =>
      prev.map(w => (w.id === id ? { ...w, name: name.trim(), location: location.trim() } : w))
    );
    addToast('success', 'Warehouse Updated', `Updated warehouse ${name}`);
    logActivity('Updated Warehouse', { id, name, location });
  };

  const deleteWarehouse = (id: string) => {
    const wh = warehouses.find(w => w.id === id);
    setWarehouses(prev => prev.filter(w => w.id !== id));
    addToast('info', 'Warehouse Deleted', `Removed warehouse ${wh?.name}`);
    logActivity('Deleted Warehouse', { id, name: wh?.name });
  };

  // Suppliers CRUD
  const addSupplier = (name: string, phone: string, address?: string) => {
    const newSup: Supplier = {
      id: 'sup-' + Math.random().toString(36).substr(2, 7),
      name: name.trim(),
      phone: phone.trim(),
      address: address?.trim(),
      created_at: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newSup]);
    addToast('success', 'Supplier Registered', `Added supplier ${name}`);
    logActivity('Registered Supplier', { name, phone, address });
  };

  const updateSupplier = (id: string, name: string, phone: string, address?: string) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, name: name.trim(), phone: phone.trim(), address: address?.trim() } : s))
    );
    addToast('success', 'Supplier Updated', `Updated supplier ${name}`);
    logActivity('Updated Supplier', { id, name, phone, address });
  };

  const deleteSupplier = (id: string) => {
    const sup = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addToast('info', 'Supplier Removed', `Removed supplier ${sup?.name}`);
    logActivity('Deleted Supplier', { id, name: sup?.name });
  };

  // Materials CRUD
  const addMaterial = (materialData: Omit<Material, 'id' | 'created_at'>) => {
    const newMat: Material = {
      ...materialData,
      id: 'mat-' + Math.random().toString(36).substr(2, 7),
      created_at: new Date().toISOString(),
    };
    setMaterials(prev => [newMat, ...prev]);
    addToast('success', 'Material Cataloged', `Added ${newMat.name} (${newMat.sku})`);
    logActivity('Added Material to Inventory', {
      sku: newMat.sku,
      name: newMat.name,
      stock: newMat.stock_quantity,
      price: newMat.unit_price,
    });
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates } : m))
    );
    addToast('success', 'Material Updated', 'Inventory item specifications updated.');
    logActivity('Updated Material', { id, ...updates });
  };

  const deleteMaterial = (id: string) => {
    const mat = materials.find(m => m.id === id);
    setMaterials(prev => prev.filter(m => m.id !== id));
    addToast('info', 'Material Deleted', `Deleted ${mat?.name} (${mat?.sku})`);
    logActivity('Deleted Material', { id, sku: mat?.sku, name: mat?.name });
  };

  // Stock In
  const performStockIn = (payload: StockInPayload): { success: boolean; transaction?: Transaction; error?: string } => {
    const material = materials.find(m => m.id === payload.materialId);
    if (!material) {
      addToast('error', 'Stock In Failed', 'Material not found.');
      return { success: false, error: 'Material not found' };
    }
    if (payload.quantity <= 0) {
      addToast('error', 'Invalid Quantity', 'Quantity In must be greater than zero.');
      return { success: false, error: 'Quantity must be > 0' };
    }

    const supplier = suppliers.find(s => s.id === payload.supplierId);
    const warehouse = warehouses.find(w => w.id === material.warehouse_id);

    // Increase stock
    const updatedStock = Number(material.stock_quantity) + Number(payload.quantity);
    setMaterials(prev =>
      prev.map(m => (m.id === payload.materialId ? { ...m, stock_quantity: updatedStock } : m))
    );

    const totalETB = Number(payload.quantity) * Number(material.unit_price);
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      type: 'IN',
      material_id: material.id,
      quantity: Number(payload.quantity),
      supplier_id: payload.supplierId,
      customer_name: null,
      customer_phone: null,
      reference_number: payload.referenceNumber || `GRN-${Date.now().toString().slice(-6)}`,
      invoice_number: payload.invoiceNumber || `SUP-${Date.now().toString().slice(-5)}`,
      performed_by: currentUser?.id || 'admin',
      timestamp: new Date().toISOString(),
      unit_price: material.unit_price,
      total_amount: totalETB,
      material_name: material.name,
      material_unit: material.unit,
      warehouse_name: warehouse?.name || 'Central Warehouse',
      performer_name: currentUser?.full_name || 'Administrator',
    };

    setTransactions(prev => [newTx, ...prev]);

    logActivity('Completed Stock In', {
      material: material.name,
      sku: material.sku,
      quantity_in: payload.quantity,
      new_stock: updatedStock,
      supplier: supplier?.name,
      reference: newTx.reference_number,
    });

    addToast('success', 'Stock In Recorded', `Added ${payload.quantity} ${material.unit} of ${material.name}. Current stock: ${updatedStock}`);
    return { success: true, transaction: newTx };
  };

  // Stock Out & Invoicing
  const performStockOut = async (payload: StockOutPayload): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
    const material = materials.find(m => m.id === payload.materialId);
    if (!material) {
      addToast('error', 'Stock Out Failed', 'Material not found.');
      return { success: false, error: 'Material not found' };
    }

    const requestedQty = Number(payload.quantity);
    if (requestedQty <= 0) {
      addToast('error', 'Invalid Quantity', 'Stock Out quantity must be greater than zero.');
      return { success: false, error: 'Quantity must be > 0' };
    }

    // INSUFFICIENT STOCK GUARD
    if (requestedQty > Number(material.stock_quantity)) {
      const errMsg = `Insufficient stock! Requested: ${requestedQty} ${material.unit}, but only ${material.stock_quantity} ${material.unit} is available in inventory.`;
      addToast('error', 'Stock Out Blocked', errMsg);
      return { success: false, error: errMsg };
    }

    const updatedStock = Number(material.stock_quantity) - requestedQty;
    const warehouse = warehouses.find(w => w.id === material.warehouse_id);
    const totalETB = requestedQty * Number(material.unit_price);

    // Update material quantity
    setMaterials(prev =>
      prev.map(m => (m.id === payload.materialId ? { ...m, stock_quantity: updatedStock } : m))
    );

    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      type: 'OUT',
      material_id: material.id,
      quantity: requestedQty,
      supplier_id: null,
      customer_name: payload.customerName.trim(),
      customer_phone: payload.customerPhone?.trim() || null,
      reference_number: payload.referenceNumber || `DO-${Date.now().toString().slice(-6)}`,
      invoice_number: payload.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      performed_by: currentUser?.id || 'admin',
      timestamp: new Date().toISOString(),
      unit_price: material.unit_price,
      total_amount: totalETB,
      material_name: material.name,
      material_unit: material.unit,
      warehouse_name: warehouse?.name || 'Central Warehouse',
      performer_name: currentUser?.full_name || 'Administrator',
    };

    setTransactions(prev => [newTx, ...prev]);

    logActivity('Completed Stock Out & Issued Invoice', {
      material: material.name,
      sku: material.sku,
      quantity_out: requestedQty,
      remaining_stock: updatedStock,
      customer: payload.customerName,
      invoice_number: newTx.invoice_number,
      total_etb: totalETB,
    });

    addToast(
      'success',
      'Stock Out & Invoice Generated',
      `Issued ${requestedQty} ${material.unit} to ${payload.customerName}. Invoice ${newTx.invoice_number} created.`
    );

    // Open receipt modal automatically
    setActiveReceiptTransaction(newTx);

    // LOW STOCK ALERT & EMAILJS CHECK
    if (updatedStock <= Number(material.min_threshold)) {
      addToast(
        'warning',
        '⚠️ Low Stock Threshold Alert!',
        `${material.name} stock (${updatedStock} ${material.unit}) is at or below minimum threshold (${material.min_threshold} ${material.unit}). Dispatching Email alert.`
      );

      logActivity('Low Stock Alert Triggered', {
        sku: material.sku,
        material: material.name,
        current_stock: updatedStock,
        min_threshold: material.min_threshold,
      });

      // Dispatch EmailJS
      sendLowStockAlertEmail({
        materialName: material.name,
        sku: material.sku,
        currentStock: updatedStock,
        minThreshold: material.min_threshold,
        unit: material.unit,
        warehouseName: warehouse?.name || 'Central Warehouse',
        triggeredBy: currentUser?.full_name || 'Inventory Staff',
      }).then(res => {
        if (res.simulated) {
          console.log('[EmailJS Notification Simulated]:', res.message);
        } else {
          addToast('info', 'Admin Notified', 'Low stock alert email dispatched to Administrator.');
        }
      });
    }

    return { success: true, transaction: newTx };
  };

  // Cloud Backups
  const saveCloudBackup = async (): Promise<{ success: boolean; message: string }> => {
    const backupData = {
      materials,
      warehouses,
      suppliers,
      transactions,
      profiles,
      exported_at: new Date().toISOString(),
      version: '1.0.0-et-enterprise',
    };

    const newBackup: StoreBackup = {
      id: 'bcp-' + Date.now().toString(),
      backup_data: backupData,
      created_by: currentUser?.id || 'admin',
      creator_name: currentUser?.full_name || 'System Admin',
      timestamp: new Date().toISOString(),
    };

    setBackups(prev => [newBackup, ...prev]);

    // Push to Supabase if connected
    const client = getSupabaseClient();
    if (client && isSupabaseConnected) {
      try {
        await client.from('store_backups').insert([
          {
            id: newBackup.id,
            backup_data: newBackup.backup_data,
            created_by: currentUser?.id,
            timestamp: newBackup.timestamp,
          },
        ]);
      } catch (err) {
        console.warn('Supabase backup push issue, persisted locally:', err);
      }
    }

    logActivity('Created Cloud Database Backup', {
      backup_id: newBackup.id,
      materials_count: materials.length,
      transactions_count: transactions.length,
    });

    addToast('success', 'Cloud Backup Saved', `Complete snapshot packaged (${materials.length} items, ${transactions.length} transactions).`);
    return { success: true, message: 'Cloud backup created successfully' };
  };

  const restoreCloudBackup = async (backupId?: string): Promise<{ success: boolean; message: string }> => {
    const targetBackup = backupId ? backups.find(b => b.id === backupId) : backups[0];

    if (!targetBackup) {
      addToast('error', 'Restore Failed', 'No backup archive found to restore from.');
      return { success: false, message: 'No backup found' };
    }

    const { materials: restoredMats, warehouses: restoredWhs, suppliers: restoredSups, transactions: restoredTxs } = targetBackup.backup_data;

    if (restoredMats) setMaterials(restoredMats);
    if (restoredWhs) setWarehouses(restoredWhs);
    if (restoredSups) setSuppliers(restoredSups);
    if (restoredTxs) setTransactions(restoredTxs);

    logActivity('Restored Database State from Backup', {
      backup_id: targetBackup.id,
      restored_at: new Date().toISOString(),
    });

    addToast('success', 'Database Restored', `State restored from snapshot dated ${new Date(targetBackup.timestamp).toLocaleDateString()}`);
    return { success: true, message: 'Data restored successfully' };
  };

  const exportFullDatabaseBackup = (): string => {
    const backupData = {
      materials,
      warehouses,
      suppliers,
      transactions,
      profiles,
      activityLogs,
      systemSettings,
      exported_at: new Date().toISOString(),
      version: '1.0.0-et-enterprise',
    };
    return JSON.stringify(backupData, null, 2);
  };

  const restoreDatabaseBackup = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (Array.isArray(data.materials)) setMaterials(data.materials);
      if (Array.isArray(data.warehouses)) setWarehouses(data.warehouses);
      if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.profiles)) setProfiles(data.profiles);
      if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
      if (data.systemSettings) setSystemSettings(data.systemSettings);
      addToast('success', 'Database Restored', 'Full database snapshot restored successfully.');
      logActivity('Restored Database from JSON File', {});
      return true;
    } catch (e) {
      addToast('error', 'Restore Failed', 'Invalid JSON backup format.');
      return false;
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'System configuration updated successfully.');
    logActivity('Updated System Settings', newSettings);
  };

  const resetToInitialData = () => {
    setMaterials(INITIAL_MATERIALS);
    setWarehouses(INITIAL_WAREHOUSES);
    setSuppliers(INITIAL_SUPPLIERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setProfiles(INITIAL_PROFILES);
    setCurrentUserId('user-admin-01');
    addToast('info', 'Demo State Reset', 'Database reset to factory Ethiopian industrial seed data.');
    logActivity('Reset Database to Factory Defaults', {});
  };

  const value = {
    currentUser,
    allProfiles: profiles,
    selectedWarehouseId,
    setSelectedWarehouseId,
    loginAs,
    signUp,
    logout,
    approveUser,
    updateUserStatus,
    updateUserRole,
    updateUserPermissions,
    deleteProfile,
    materials,
    warehouses,
    suppliers,
    transactions,
    activityLogs,
    backups,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    performStockIn,
    performStockOut,
    saveCloudBackup,
    restoreCloudBackup,
    exportFullDatabaseBackup,
    restoreDatabaseBackup,
    resetToInitialData,
    systemSettings,
    updateSettings,
    isSupabaseConnected,
    checkSupabaseStatus,
    activeReceiptTransaction,
    setActiveReceiptTransaction,
    toasts,
    addToast,
    removeToast,
  };

  return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
