"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPES
// =============================================

type SoftDeleteAction = 'delete' | 'restore' | 'permanent';
type AllowedTable =
  | 'projects'
  | 'certifications'
  | 'lexique_terms'
  | 'faq_questions'
  | 'contacts'
  | 'email_logs'
  | 'calculator_submissions'
  | 'quote_requests'
  | 'detailed_quotes'
  | 'job_applications'
  | 'redirects';

interface SoftDeleteRequest {
  table: AllowedTable;
  ids: string[];
  action: SoftDeleteAction;
}

interface SoftDeleteResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// =============================================
// SERVER ACTIONS
// =============================================

export async function softDeleteItems({
  table,
  ids,
  action
}: SoftDeleteRequest): Promise<SoftDeleteResult> {
  const supabase = await createClient();

  try {
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized: You must be logged in'
      };
    }

    // Verify admin access (admin or super_admin role)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found'
      };
    }

    const roles = Array.isArray(profile.roles) ? profile.roles : [];
    const hasPermission = roles.some((role: string) => ['admin', 'super_admin'].includes(role));

    if (!hasPermission) {
      return {
        success: false,
        error: 'Forbidden: Admin or Super Admin access required'
      };
    }

    // Validate input
    if (!table || !ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return {
        success: false,
        error: 'Missing required fields: table, ids, action'
      };
    }

    // Validate action
    if (!['delete', 'restore', 'permanent'].includes(action)) {
      return {
        success: false,
        error: 'Invalid action. Must be: delete, restore, or permanent'
      };
    }

    // Validate table
    const allowedTables: AllowedTable[] = [
      'projects',
      'certifications',
      'lexique_terms',
      'faq_questions',
      'contacts',
      'email_logs',
      'calculator_submissions',
      'quote_requests',
      'detailed_quotes',
      'job_applications',
      'redirects'
    ];

    if (!allowedTables.includes(table)) {
      return {
        success: false,
        error: `Invalid table. Allowed: ${allowedTables.join(', ')}`
      };
    }

    let result;

    // Tables with deleted_by column (others only have deleted_at)
    const tablesWithDeletedBy: AllowedTable[] = [
      'projects',
      'certifications',
      'lexique_terms',
      'faq_questions',
      'contacts',
      'calculator_submissions',
      'quote_requests',
      'email_logs',
      'job_applications',
      'redirects'
    ];
    const hasDeletedBy = tablesWithDeletedBy.includes(table);

    switch (action) {
      case 'delete': {
        // Soft delete: set deleted_at to current timestamp (and deleted_by if column exists)
        const updateData: any = {
          deleted_at: new Date().toISOString(),
        };

        if (hasDeletedBy) {
          updateData.deleted_by = user.id;
        }

        const { data, error } = await supabase
          .from(table)
          .update(updateData)
          .in('id', ids)
          .is('deleted_at', null) // Only delete items that are not already deleted
          .select();

        if (error) {
          console.error(`Error soft deleting from ${table}:`, error);
          return {
            success: false,
            error: error.message
          };
        }

        result = data;
        break;
      }

      case 'restore': {
        // Restore: set deleted_at to null (and deleted_by if column exists)
        const updateData: any = {
          deleted_at: null,
        };

        if (hasDeletedBy) {
          updateData.deleted_by = null;
        }

        const { data, error } = await supabase
          .from(table)
          .update(updateData)
          .in('id', ids)
          .not('deleted_at', 'is', null) // Only restore items that are deleted
          .select();

        if (error) {
          console.error(`Error restoring from ${table}:`, error);
          return {
            success: false,
            error: error.message
          };
        }

        result = data;
        break;
      }

      case 'permanent': {
        // Permanent delete: actually remove from database
        // WARNING: This cannot be undone!
        const { data, error } = await supabase
          .from(table)
          .delete()
          .in('id', ids)
          .select();

        if (error) {
          console.error(`Error permanently deleting from ${table}:`, error);
          return {
            success: false,
            error: error.message
          };
        }

        result = data;
        break;
      }

      default:
        return {
          success: false,
          error: 'Invalid action'
        };
    }

    // Revalidate relevant paths
    revalidatePath(`/admin/${table}`);
    revalidatePath('/admin');

    return {
      success: true,
      message: `Successfully ${action === 'delete' ? 'soft deleted' : action === 'restore' ? 'restored' : 'permanently deleted'} ${result?.length || 0} item(s) from ${table}`,
      data: result
    };

  } catch (error) {
    console.error('Error in softDeleteItems:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}
