import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// These should normally come from import.meta.env
// We'll leave them empty or pointed to localhost for development.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
