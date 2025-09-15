import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/// <reference types="vite/client" />
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  // ここで throw するとバンドル読込時に白画面になるため抑止し、後段でガードする
  // eslint-disable-next-line no-console
  console.error('[Config] Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Auth features are disabled.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
export default supabase