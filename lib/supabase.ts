import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://fednnljfnffdtdxscbhr.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZG5ubGpmbmZmZHRkeHNjYmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA1NjUsImV4cCI6MjA1OTcwNjU2NX0.QBR22naUyHM9kT2sdcQBQAjbIH4wILniScbjXq82H2M;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}; 