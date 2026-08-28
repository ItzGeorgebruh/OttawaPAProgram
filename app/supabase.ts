import { createClient } from '@supabase/supabase-js';

// Must end in .co (NOT .com)
const supabaseUrl = 'https://bknrtardzwrkvuouxcza.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);