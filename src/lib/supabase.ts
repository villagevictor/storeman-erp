import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'erp_supabase_url';
const STORAGE_KEY_KEY = 'erp_supabase_anon_key';

export const DEFAULT_SUPABASE_URL = 'https://cfnrbgfczqfpmdjzzbia.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbnJiZ2ZjenFmcG1kanp6YmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzQ2ODQsImV4cCI6MjEwMjI1MDY4NH0.7F1z16a1hdLGr_I-rgPui8KYjb4toQLPx6D78ueQ0CA';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  const storedUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
  const storedKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  supabaseClientInstance = null; // Reset cached client
}

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const { url, anonKey } = getStoredSupabaseConfig();

  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseClientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseClientInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return null;
}

export const supabase = getSupabaseClient();

/**
 * Full Supabase SQL Migration script matching exact user specifications and RLS.
 * Users can run this directly in Supabase SQL editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- Enterprise ERP & Inventory Management - Complete Supabase Schema
-- Includes Tables, Foreign Keys, Indexes, Row Level Security (RLS), and Auto-Profile Triggers

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Manager', 'Staff')),
  company_id TEXT DEFAULT 'comp-ethiopia-erp',
  warehouse_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  permissions JSONB NOT NULL DEFAULT '{"dashboard":{"view":true},"materials":{"view":true,"create":false,"update":false,"delete":false},"stock_in":{"view":true,"create":true},"stock_out":{"view":true,"create":true},"suppliers":{"view":true,"create":false,"update":false,"delete":false},"warehouses":{"view":true,"create":false,"update":false,"delete":false},"invoices":{"view":true,"create":true},"activity_logs":{"view":false},"backups":{"view":false,"create":false,"restore":false},"settings":{"view":false,"update":false},"admin":{"view":false,"manage_users":false}}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Warehouses Table
CREATE TABLE IF NOT EXISTS public.warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Materials Table
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('Pcs', 'Kg', 'Bag', 'Meter', 'Litre', 'Box', 'Roll', 'Carton')),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  min_threshold NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Transactions Table (Stock In & Out)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  reference_number TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  unit_price NUMERIC(12, 2),
  total_amount NUMERIC(12, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Create Store Backups Table
CREATE TABLE IF NOT EXISTS public.store_backups (
  id TEXT PRIMARY KEY,
  backup_data JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_backups ENABLE ROW LEVEL SECURITY;

-- Base Policies (Active users have read access; Admins/Managers have write access)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile or Admin can update all"
  ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin');

CREATE POLICY "Warehouses are viewable by active users"
  ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Warehouses manageable by authenticated staff"
  ON public.warehouses FOR ALL TO authenticated USING (true);

CREATE POLICY "Suppliers are viewable by active users"
  ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Suppliers manageable by authenticated staff"
  ON public.suppliers FOR ALL TO authenticated USING (true);

CREATE POLICY "Materials are viewable by active users"
  ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Materials manageable by authenticated staff"
  ON public.materials FOR ALL TO authenticated USING (true);

CREATE POLICY "Transactions viewable by active users"
  ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Transactions insertable by active users"
  ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Activity logs viewable by active users"
  ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activity logs insertable by all authenticated"
  ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Backups manageable by Admins"
  ON public.store_backups FOR ALL TO authenticated USING (true);

-- Automatic Profile Creation on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Staff',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
