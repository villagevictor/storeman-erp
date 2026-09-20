export type UserRole = 'Admin' | 'Manager' | 'Staff';
export type UserStatus = 'pending' | 'active' | 'blocked';
export type TransactionType = 'IN' | 'OUT';
export type MaterialUnit = 'Pcs' | 'Kg' | 'Bag' | 'Meter' | 'Litre' | 'Box' | 'Roll' | 'Carton';

export interface ModulePermission {
  view?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  restore?: boolean;
  manage_users?: boolean;
}

export interface UserPermissions {
  dashboard: { view: boolean };
  materials: { view: boolean; create: boolean; update: boolean; delete: boolean };
  stock_in: { view: boolean; create: boolean };
  stock_out: { view: boolean; create: boolean };
  suppliers: { view: boolean; create: boolean; update: boolean; delete: boolean };
  warehouses: { view: boolean; create: boolean; update: boolean; delete: boolean };
  invoices: { view: boolean; create: boolean };
  activity_logs: { view: boolean };
  backups: { view: boolean; create: boolean; restore: boolean };
  settings: { view: boolean; update: boolean };
  admin: { view: boolean; manage_users: boolean };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_id: string;
  warehouse_id: string | null;
  status: UserStatus;
  permissions: UserPermissions;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  created_at: string;
}

export interface SystemSettings {
  company_name: string;
  currency: string;
  tin_number: string;
  address: string;
  phone: string;
  emailjs_service_id?: string;
  emailjs_template_id?: string;
  emailjs_public_key?: string;
  alert_recipient_email?: string;
}

export interface Material {
  id: string;
  sku: string;
  name: string;
  unit: MaterialUnit;
  unit_price: number; // in ETB
  stock_quantity: number;
  min_threshold: number;
  warehouse_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  material_id: string;
  quantity: number;
  supplier_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  reference_number: string;
  invoice_number: string;
  performed_by: string; // Profile ID
  timestamp: string;
  unit_price?: number; // Snapshot of unit price at transaction time
  total_amount?: number; // quantity * unit_price (ETB)
  material_name?: string; // Joined display helper
  material_unit?: string;
  warehouse_name?: string;
  performer_name?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface StoreBackup {
  id: string;
  backup_data: {
    materials: Material[];
    warehouses: Warehouse[];
    suppliers: Supplier[];
    transactions: Transaction[];
    profiles?: Profile[];
    exported_at: string;
    version: string;
  };
  created_by: string;
  creator_name?: string;
  timestamp: string;
}

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  adminEmail: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: { view: true },
  materials: { view: true, create: true, update: true, delete: true },
  stock_in: { view: true, create: true },
  stock_out: { view: true, create: true },
  suppliers: { view: true, create: true, update: true, delete: true },
  warehouses: { view: true, create: true, update: true, delete: true },
  invoices: { view: true, create: true },
  activity_logs: { view: true },
  backups: { view: true, create: true, restore: true },
  settings: { view: true, update: true },
  admin: { view: true, manage_users: true },
};

export const DEFAULT_MANAGER_PERMISSIONS: UserPermissions = {
  dashboard: { view: true },
  materials: { view: true, create: true, update: true, delete: false },
  stock_in: { view: true, create: true },
  stock_out: { view: true, create: true },
  suppliers: { view: true, create: true, update: true, delete: false },
  warehouses: { view: true, create: true, update: true, delete: false },
  invoices: { view: true, create: true },
  activity_logs: { view: true },
  backups: { view: true, create: true, restore: false },
  settings: { view: true, update: false },
  admin: { view: false, manage_users: false },
};

export const DEFAULT_STAFF_PERMISSIONS: UserPermissions = {
  dashboard: { view: true },
  materials: { view: true, create: false, update: false, delete: false },
  stock_in: { view: true, create: true },
  stock_out: { view: true, create: true },
  suppliers: { view: true, create: false, update: false, delete: false },
  warehouses: { view: true, create: false, update: false, delete: false },
  invoices: { view: true, create: true },
  activity_logs: { view: false },
  backups: { view: false, create: false, restore: false },
  settings: { view: false, update: false },
  admin: { view: false, manage_users: false },
};
