"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPES
// =============================================

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
  is_published: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JobOpening = {
  id: string;
  title: string;
  description: string;
  contract_type: string | null;
  location: string;
  requirements: string | null;
  is_active: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

// =============================================
// TEAM MEMBERS - READ
// =============================================

export async function getAllTeamMembers(showDeleted = false): Promise<TeamMember[]> {
  const supabase = await createClient();

  let query = supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching team members:', error);
    throw new Error('Failed to fetch team members');
  }

  return data || [];
}

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error('Error fetching published team members:', error);
    return [];
  }

  return data || [];
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return null;
  }

  return data;
}

export async function getTeamStats() {
  const supabase = await createClient();

  const [allMembers, deletedMembers] = await Promise.all([
    supabase.from("team_members").select("id, is_published", { count: 'exact' }).is("deleted_at", null),
    supabase.from("team_members").select("id", { count: 'exact' }).not("deleted_at", "is", null),
  ]);

  const total = allMembers.data?.length || 0;
  const published = allMembers.data?.filter(m => m.is_published).length || 0;
  const drafts = allMembers.data?.filter(m => !m.is_published).length || 0;
  const deleted = deletedMembers.count || 0;

  return { total, published, drafts, deleted };
}

// =============================================
// TEAM MEMBERS - CREATE
// =============================================

export async function createTeamMember(data: {
  name: string;
  position: string;
  bio?: string;
  photo_url?: string;
  display_order?: number;
  is_published?: boolean;
}) {
  const supabase = await createClient();

  // Get next display order if not provided
  let displayOrder = data.display_order;
  if (displayOrder === undefined) {
    const { data: maxOrder } = await supabase
      .from("team_members")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    displayOrder = (maxOrder?.display_order || 0) + 1;
  }

  const { data: member, error } = await supabase
    .from("team_members")
    .insert({
      name: data.name,
      position: data.position,
      bio: data.bio || null,
      photo_url: data.photo_url || null,
      display_order: displayOrder,
      is_published: data.is_published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team member:', error);
    throw new Error('Failed to create team member');
  }

  revalidatePath('/admin/team');
  revalidatePath('/notre-equipe');

  return member;
}

// =============================================
// TEAM MEMBERS - UPDATE
// =============================================

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("team_members")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team member:', error);
    throw new Error('Failed to update team member');
  }

  revalidatePath('/admin/team');
  revalidatePath('/notre-equipe');

  return member;
}

export async function toggleTeamMemberPublished(id: string, isPublished: boolean) {
  return updateTeamMember(id, { is_published: isPublished });
}

export async function reorderTeamMembers(orderedIds: string[]) {
  const supabase = await createClient();

  // Update display_order for each member
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("team_members")
      .update({ display_order: index + 1 })
      .eq("id", id)
  );

  await Promise.all(updates);

  revalidatePath('/admin/team');
  revalidatePath('/notre-equipe');
}

// =============================================
// TEAM MEMBERS - DELETE
// =============================================

export async function deleteTeamMember(id: string, permanent = false) {
  const supabase = await createClient();

  if (permanent) {
    // Delete photo from storage first
    const member = await getTeamMember(id);
    if (member?.photo_url) {
      const fileName = member.photo_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('team-photos').remove([fileName]);
      }
    }

    // Permanent delete
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error('Error permanently deleting team member:', error);
      throw new Error('Failed to delete team member');
    }
  } else {
    // Soft delete
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("team_members")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
      })
      .eq("id", id);

    if (error) {
      console.error('Error soft deleting team member:', error);
      throw new Error('Failed to delete team member');
    }
  }

  revalidatePath('/admin/team');
  revalidatePath('/notre-equipe');
}

export async function restoreTeamMember(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_members")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) {
    console.error('Error restoring team member:', error);
    throw new Error('Failed to restore team member');
  }

  revalidatePath('/admin/team');
  revalidatePath('/notre-equipe');
}

export async function bulkDeleteTeamMembers(ids: string[], permanent = false) {
  for (const id of ids) {
    await deleteTeamMember(id, permanent);
  }
}

// =============================================
// TEAM PHOTOS - UPLOAD
// =============================================

export async function uploadTeamPhoto(file: File): Promise<string> {
  const supabase = await createClient();

  // Generate unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('team-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading team photo:', error);
    throw new Error('Failed to upload photo');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('team-photos')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteTeamPhoto(photoUrl: string) {
  const supabase = await createClient();

  const fileName = photoUrl.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from('team-photos')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting team photo:', error);
  }
}

// =============================================
// JOB OPENINGS - READ
// =============================================

export async function getAllJobOpenings(showDeleted = false): Promise<JobOpening[]> {
  const supabase = await createClient();

  let query = supabase
    .from("job_openings")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching job openings:', error);
    throw new Error('Failed to fetch job openings');
  }

  return data || [];
}

export async function getActiveJobOpenings(): Promise<JobOpening[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_openings")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Error fetching active job openings:', error);
    return [];
  }

  return data || [];
}

export async function getJobOpening(id: string): Promise<JobOpening | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_openings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error('Error fetching job opening:', error);
    return null;
  }

  return data;
}

export async function getJobOpeningsStats() {
  const supabase = await createClient();

  const [allJobs, deletedJobs] = await Promise.all([
    supabase.from("job_openings").select("id, is_active", { count: 'exact' }).is("deleted_at", null),
    supabase.from("job_openings").select("id", { count: 'exact' }).not("deleted_at", "is", null),
  ]);

  const total = allJobs.data?.length || 0;
  const active = allJobs.data?.filter(j => j.is_active).length || 0;
  const inactive = allJobs.data?.filter(j => !j.is_active).length || 0;
  const deleted = deletedJobs.count || 0;

  return { total, active, inactive, deleted };
}

// =============================================
// JOB OPENINGS - CREATE
// =============================================

export async function createJobOpening(data: {
  title: string;
  description: string;
  contract_type?: string;
  location?: string;
  requirements?: string;
  is_active?: boolean;
}) {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("job_openings")
    .insert({
      title: data.title,
      description: data.description,
      contract_type: data.contract_type || null,
      location: data.location || 'Bas-Rhin, Alsace',
      requirements: data.requirements || null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job opening:', error);
    throw new Error('Failed to create job opening');
  }

  revalidatePath('/admin/jobs');
  revalidatePath('/notre-equipe');

  return job;
}

// =============================================
// JOB OPENINGS - UPDATE
// =============================================

export async function updateJobOpening(id: string, data: Partial<JobOpening>) {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("job_openings")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error('Error updating job opening:', error);
    throw new Error('Failed to update job opening');
  }

  revalidatePath('/admin/jobs');
  revalidatePath('/notre-equipe');

  return job;
}

export async function toggleJobOpeningActive(id: string, isActive: boolean) {
  return updateJobOpening(id, { is_active: isActive });
}

// Toggle job highlight (mise en avant)
export async function toggleJobHighlight(id: string, isHighlighted: boolean) {
  const supabase = await createClient();

  // If activating highlight, first deactivate all other highlighted jobs
  if (isHighlighted === true) {
    const { error: deactivateError } = await supabase
      .from('job_openings')
      .update({ is_highlighted: false })
      .neq('id', id)
      .eq('is_highlighted', true);

    if (deactivateError) {
      console.error('Error deactivating other highlighted jobs:', deactivateError);
      throw new Error(`Erreur lors de la désactivation des autres offres: ${deactivateError.message}`);
    }
  }

  // Now toggle the target job
  const { data: job, error } = await supabase
    .from('job_openings')
    .update({ is_highlighted: isHighlighted })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling job highlight:', error);
    throw new Error('Failed to toggle job highlight');
  }

  revalidatePath('/admin/jobs');
  revalidatePath('/');

  return job;
}

// =============================================
// JOB OPENINGS - DELETE
// =============================================

export async function deleteJobOpening(id: string, permanent = false) {
  const supabase = await createClient();

  if (permanent) {
    const { error } = await supabase
      .from("job_openings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error('Error permanently deleting job opening:', error);
      throw new Error('Failed to delete job opening');
    }
  } else {
    // Soft delete
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("job_openings")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
      })
      .eq("id", id);

    if (error) {
      console.error('Error soft deleting job opening:', error);
      throw new Error('Failed to delete job opening');
    }
  }

  revalidatePath('/admin/jobs');
  revalidatePath('/notre-equipe');
}

export async function restoreJobOpening(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("job_openings")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) {
    console.error('Error restoring job opening:', error);
    throw new Error('Failed to restore job opening');
  }

  revalidatePath('/admin/jobs');
  revalidatePath('/notre-equipe');
}

export async function bulkDeleteJobOpenings(ids: string[], permanent = false) {
  for (const id of ids) {
    await deleteJobOpening(id, permanent);
  }
}
