import { createClient } from '@supabase/supabase-js';

// Hardcode your known URL directly so it can never be undefined
const supabaseUrl = 'https://bknrtardzwrkvuouxcza.supabase.com';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);