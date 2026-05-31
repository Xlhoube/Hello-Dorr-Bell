import { createClient } from '@supabase/supabase-js';

// As chaves fornecidas no prompt inicial:
// URL: https://wmskixxrxqnbwrsryrtu.supabase.co
// ANON KEY: sb_publishable_mbFVAA4nWyfiE-Rl2fLe9g_mq8zqQdz

const supabaseUrl = 'https://wmskixxrxqnbwrsryrtu.supabase.co';
const supabaseAnonKey = 'sb_publishable_mbFVAA4nWyfiE-Rl2fLe9g_mq8zqQdz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
