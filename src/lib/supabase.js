import { createClient } from '@supabase/supabase-js'

// 这些环境变量将在你连接 Supabase 后自动填充
// 如果你在本地开发且未连接，这些值可能为空，导致功能受限
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
