import { createClient } from '@supabase/supabase-js';

// ✅ Import des types générés automatiquement depuis le schéma Supabase
// Pour régénérer : npx supabase gen types typescript --project-id ssavyibgujrvwvvhaahk > src/lib/database.types.ts
export type { Database } from './database.types';

// Public client for browser use (with anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);