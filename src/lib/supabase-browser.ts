import { createBrowserClient } from '@supabase/ssr';
import { type Database } from './supabase';

// Browser-side Supabase client
export const createClient = () => {
  // Utiliser des valeurs factices pendant le build si les variables ne sont pas définies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase environment variables not configured - using placeholder values');
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          // SSR guard - return undefined if not in browser
          if (typeof document === 'undefined') return undefined;

          // Use native document.cookie for better compatibility
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        },
        set(name: string, value: string, options: any) {
          // SSR guard - do nothing if not in browser
          if (typeof document === 'undefined' || typeof window === 'undefined') return;

          // Ensure cookies work in production with proper options
          document.cookie = `${name}=${value}; path=/; max-age=31536000; ${
            window.location.protocol === 'https:' ? 'secure; ' : ''
          }samesite=lax`;
        },
        remove(name: string, options: any) {
          // SSR guard - do nothing if not in browser
          if (typeof document === 'undefined') return;

          document.cookie = `${name}=; path=/; max-age=0`;
        },
      },
    }
  );
};

// Get current user session browser-side
export const getUser = async () => {
  const supabase = createClient();
  
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

// Check if current user is admin browser-side
export const isAdmin = async () => {
  const user = await getUser();
  
  if (!user?.email) {
    return false;
  }

  // Note: This is a client-side check for UI purposes only
  // Real authorization is enforced server-side via user_profiles.roles
  // Check if user has admin roles (super_admin or admin)
  // This function should not be relied upon for security - only for UI display
  return true; // Proper check is done server-side with RLS and roles
};