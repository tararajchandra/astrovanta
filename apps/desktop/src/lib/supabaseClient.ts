import { createClient } from '@supabase/supabase-js';

// In a real Tauri app, these should come from environment variables or secure storage
// For now, we will use the local Supabase instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
