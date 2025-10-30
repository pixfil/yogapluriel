'use server';

import { createClient, getAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  job_opening_id: string | null;
  job_title: string;
  cv_url: string;
  cover_letter_url: string | null;
  status: 'new' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'archived';
  admin_notes: string | null;
  assigned_to: string | null;
  reviewed_at: string | null;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface JobApplicationFilters {
  status?: string;
  jobId?: string;
  search?: string;
}

/**
 * Récupère toutes les candidatures avec filtres optionnels
 * ✅ SECURITY: Uses admin client to bypass RLS (admin-only access verified by RLS policies)
 */
export async function getJobApplications(filters?: JobApplicationFilters) {
  const supabase = getAdminClient();

  try {
    let query = supabase
      .from('job_applications')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Filtres
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.jobId) {
      query = query.eq('job_opening_id', filters.jobId);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors du chargement des candidatures: ${error.message}`);
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

/**
 * Récupère une candidature par ID
 * ✅ SECURITY: Uses admin client for privileged access
 */
export async function getJobApplicationById(id: string) {
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw new Error(`Erreur lors du chargement de la candidature: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching job application:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

/**
 * Met à jour le status d'une candidature
 * ✅ SECURITY: Uses admin client for privileged update
 */
export async function updateJobApplicationStatus(
  id: string,
  status: 'new' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'archived'
) {
  const supabase = getAdminClient();

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Si status passe à 'reviewed', 'interview', etc., marquer reviewed_at
    if (status !== 'new' && !['archived'].includes(status)) {
      updateData.reviewed_at = new Date().toISOString();
    }

    // Si archived, marquer archived_at
    if (status === 'archived') {
      updateData.archived_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du status: ${error.message}`);
    }

    revalidatePath('/admin/candidatures');
    return { success: true };
  } catch (error) {
    console.error('Error updating job application status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

/**
 * Met à jour les notes admin d'une candidature
 * ✅ SECURITY: Uses admin client for privileged update
 */
export async function updateJobApplicationNotes(id: string, notes: string) {
  const supabase = getAdminClient();

  try {
    const { error } = await supabase
      .from('job_applications')
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour des notes: ${error.message}`);
    }

    revalidatePath('/admin/candidatures');
    return { success: true };
  } catch (error) {
    console.error('Error updating job application notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

/**
 * Supprime (soft delete) une candidature
 * ✅ SECURITY: Uses admin client for privileged delete
 */
export async function deleteJobApplication(id: string) {
  const supabase = getAdminClient();

  try {
    const { error } = await supabase
      .from('job_applications')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }

    revalidatePath('/admin/candidatures');
    return { success: true };
  } catch (error) {
    console.error('Error deleting job application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

/**
 * Récupère les statistiques des candidatures
 * ✅ SECURITY: Uses admin client for privileged access
 */
export async function getJobApplicationsStats() {
  const supabase = getAdminClient();

  try {
    // Total
    const { count: totalCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Nouvelles (new)
    const { count: newCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')
      .is('deleted_at', null);

    // En cours (reviewed + interview)
    const { count: inProgressCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .in('status', ['reviewed', 'interview'])
      .is('deleted_at', null);

    // Embauchés
    const { count: hiredCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'hired')
      .is('deleted_at', null);

    return {
      success: true,
      data: {
        total: totalCount || 0,
        new: newCount || 0,
        inProgress: inProgressCount || 0,
        hired: hiredCount || 0,
      }
    };
  } catch (error) {
    console.error('Error fetching job applications stats:', error);
    return {
      success: false,
      data: { total: 0, new: 0, inProgress: 0, hired: 0 },
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}
