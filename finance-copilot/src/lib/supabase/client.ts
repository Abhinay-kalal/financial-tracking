import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwkfefezsdgimhubusrl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3a2ZlZmV6c2RnaW1odWJ1c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Nzg4MTgsImV4cCI6MjA5NzU1NDgxOH0.-JlQq8BRDsMbS2s3vOsXrg8TNG37We1uZZ2SajpxaO8';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
