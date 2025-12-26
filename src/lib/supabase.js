import { createClient } from '@supabase/supabase-js'

// !!! IMPORTANT: PASTE YOUR ACTUAL ANON KEY FROM SUPABASE DASHBOARD HERE !!!
const SUPABASE_URL = 'https://nppsoluxqsmntotxbetq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcHNvbHV4cXNtbnRvdHhiZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjQxMzIsImV4cCI6MjA4MjMwMDEzMn0.XmTol0YMzAGRaVWpm1TkQycmLIsUm5Obm_InlwXCu4M'

console.log('Using Supabase Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...'); // 加一行日志方便调试

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
