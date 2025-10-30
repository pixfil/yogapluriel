import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type Database } from './supabase';
import { env } from './env';

// Server-side Supabase client for App Router
export const createClient = async () => {
  const cookieStore = await cookies();

  // ✅ Utilisation de variables validées (crash si manquantes)
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        // Évite les erreurs "Invalid Refresh Token" sur les pages publiques
        // Le middleware gère déjà le refresh des sessions utilisateur
        autoRefreshToken: false,
        persistSession: false,
        // Détecte automatiquement la session depuis les cookies
        detectSessionInUrl: false,
      },
    }
  );
};

// Get current user session server-side
export const getUser = async () => {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
};

// Check if current user is admin
export const isAdmin = async () => {
  const user = await getUser();

  if (!user?.email || !env.ADMIN_EMAIL) {
    return false;
  }

  return user.email === env.ADMIN_EMAIL;
};

// Server-side admin operations with service role key
export const getAdminClient = () => {
  // ✅ Utilisation de variables validées (crash si manquantes)
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for service role client
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};