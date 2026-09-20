import { getSupabaseClient, supabase } from './supabase';

export {
  getSupabaseClient,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_SCHEMA_SQL,
  supabase,
} from './supabase';

export default supabase || getSupabaseClient();
