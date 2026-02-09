import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('pa_supabase_url');
  const key = localStorage.getItem('pa_supabase_key');
  return { url, key };
};

export const isCloudEnabled = () => {
  const { url, key } = getSupabaseConfig();
  return !!(url && key && url.startsWith('https://'));
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  return createClient(url, key);
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: { user: null }, error: new Error('Configure Supabase en los ajustes.') };
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, role: string, username: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: { user: null }, error: new Error('Configure Supabase en los ajustes.') };
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        display_name: username
      }
    }
  });
};

export const syncToCloud = async (table: string, id: string, data: any) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error } = await supabase
    .from(table)
    .upsert({ id, data, updated_at: new Date().toISOString() });
  return !error;
};

export const fetchFromCloud = async (table: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*');
  return error ? null : data;
};