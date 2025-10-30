/**
 * Re-export from parent directory for consistent import paths
 * This allows imports from both:
 * - @/lib/supabase-server (legacy)
 * - @/lib/supabase/server (new)
 */

export { createClient, getUser, isAdmin, getAdminClient } from '../supabase-server';
