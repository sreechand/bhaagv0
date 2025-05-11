import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Create a single supabase client for interacting with your database
export const supabase = createClientComponentClient<Database>({
  options: {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
}) 