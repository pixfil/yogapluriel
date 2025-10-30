import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

type SoftDeleteAction = 'delete' | 'restore' | 'permanent';
type AllowedTable = 'projects' | 'certifications' | 'lexique_terms' | 'faq_questions' | 'contacts' | 'email_logs' | 'calculator_submissions' | 'quote_requests' | 'detailed_quotes' | 'job_applications' | 'redirects';

interface SoftDeleteRequest {
  table: AllowedTable;
  ids: string[];
  action: SoftDeleteAction;
}

export async function POST(request: NextRequest) {
  try {
    const body: SoftDeleteRequest = await request.json();
    const { table, ids, action } = body;

    // Validate input
    if (!table || !ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: table, ids, action' },
        { status: 400 }
      );
    }

    // Check authentication using regular client (has access to cookies/session)
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Verify admin access using admin client to bypass RLS
    const adminClient = getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    console.log('[soft-delete] User ID:', user.id);
    console.log('[soft-delete] Profile:', profile);
    console.log('[soft-delete] Profile error:', profileError);

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: User profile not found' },
        { status: 403 }
      );
    }

    const roles = Array.isArray(profile.roles) ? profile.roles : [];
    console.log('[soft-delete] Roles:', roles);

    const hasPermission = roles.some((role: string) => ['admin', 'super_admin'].includes(role));
    console.log('[soft-delete] Has permission:', hasPermission);

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Use admin client to bypass RLS for the actual operation
    const supabase = getAdminClient();

    // Perform the action
    let result;
    const now = new Date().toISOString();

    console.log('[soft-delete] Action:', action, 'Table:', table, 'IDs:', ids);

    if (action === 'delete') {
      // Soft delete
      result = await supabase
        .from(table)
        .update({
          deleted_at: now,
          deleted_by: user.id,
        })
        .in('id', ids);

      if (result.error) {
        console.error('[soft-delete] Error soft-deleting table:', table, 'Error:', result.error);
        return NextResponse.json(
          { success: false, error: `Failed to delete from ${table}: ${result.error.message}` },
          { status: 500 }
        );
      }

      console.log('[soft-delete] Successfully deleted from', table);

    } else if (action === 'restore') {
      // Restore
      result = await supabase
        .from(table)
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .in('id', ids);

      if (result.error) {
        console.error('Error restoring:', result.error);
        return NextResponse.json(
          { success: false, error: `Failed to restore: ${result.error.message}` },
          { status: 500 }
        );
      }

    } else if (action === 'permanent') {
      // Permanent delete
      result = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (result.error) {
        console.error('Error permanently deleting:', result.error);
        return NextResponse.json(
          { success: false, error: `Failed to permanently delete: ${result.error.message}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Revalidate paths
    revalidatePath('/admin/inbox');
    revalidatePath('/admin/projects');
    revalidatePath('/admin/redirections');
    revalidatePath('/admin/faq');
    revalidatePath('/admin/lexique');
    revalidatePath('/admin/certifications');

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${ids.length} item(s)`,
    });

  } catch (error) {
    console.error('Error in soft-delete API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
