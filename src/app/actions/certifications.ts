'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

// Type depuis la BDD Supabase
type CertificationRow = Database['public']['Tables']['certifications']['Row'];

// Interface étendue avec les types corrects
export interface Certification {
  id: string;
  name: string;
  logo_url: string | null;
  category: string; // BDD n'a pas de contrainte enum
  category_color: string;
  description: string;
  benefits: string[] | null;
  display_order: number;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

// Type pour la création (garde les validations côté client)
export type CertificationCategory = 'quality' | 'expertise' | 'territorial' | 'network';

export interface CreateCertificationData {
  name: string;
  category: CertificationCategory;
  category_color: string;
  description: string;
  benefits: string[];
  published?: boolean;
}

/**
 * Get all certifications (optionally including deleted ones)
 */
export async function getCertifications(showDeleted = false): Promise<Certification[]> {
  const supabase = await createClient();

  let query = supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true });

  if (!showDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching certifications:', error);
    throw new Error('Failed to fetch certifications');
  }

  return data || [];
}

/**
 * Get a single certification by ID
 */
export async function getCertification(id: string): Promise<Certification | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching certification:', error);
    return null;
  }

  return data;
}

/**
 * Create a new certification
 */
export async function createCertification(
  data: CreateCertificationData,
  logoFile?: File
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient();

    // Get max display_order
    const { data: maxOrderData } = await supabase
      .from('certifications')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.display_order || 0) + 1;

    let logo_url: string | null = null;

    // Upload logo if provided
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `certifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certification-logos')
        .upload(filePath, logoFile, {
          contentType: logoFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return { success: false, error: 'Failed to upload logo' };
      }

      const { data: urlData } = supabase.storage
        .from('certification-logos')
        .getPublicUrl(filePath);

      logo_url = urlData.publicUrl;
    }

    // Insert certification
    const { data: insertData, error: insertError } = await supabase
      .from('certifications')
      .insert({
        ...data,
        logo_url,
        display_order: nextOrder,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating certification:', insertError);
      return { success: false, error: 'Failed to create certification' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true, id: insertData.id };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Update an existing certification
 */
export async function updateCertification(
  id: string,
  data: Partial<CreateCertificationData>,
  logoFile?: File
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    let updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Upload new logo if provided
    if (logoFile) {
      // Delete old logo if exists
      const { data: oldData } = await supabase
        .from('certifications')
        .select('logo_url')
        .eq('id', id)
        .single();

      if (oldData?.logo_url) {
        const oldPath = oldData.logo_url.split('/').slice(-2).join('/');
        await supabase.storage.from('certification-logos').remove([oldPath]);
      }

      // Upload new logo
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `certifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certification-logos')
        .upload(filePath, logoFile, {
          contentType: logoFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return { success: false, error: 'Failed to upload logo' };
      }

      const { data: urlData } = supabase.storage
        .from('certification-logos')
        .getPublicUrl(filePath);

      updateData.logo_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('certifications')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating certification:', updateError);
      return { success: false, error: 'Failed to update certification' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Toggle published status
 */
export async function togglePublished(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: current } = await supabase
      .from('certifications')
      .select('published')
      .eq('id', id)
      .single();

    if (!current) {
      return { success: false, error: 'Certification not found' };
    }

    const { error } = await supabase
      .from('certifications')
      .update({
        published: !current.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error toggling published:', error);
      return { success: false, error: 'Failed to toggle published status' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Update display order for multiple certifications
 */
export async function updateDisplayOrder(
  certifications: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update each certification's display_order
    for (const cert of certifications) {
      const { error } = await supabase
        .from('certifications')
        .update({
          display_order: cert.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cert.id);

      if (error) {
        console.error('Error updating display order:', error);
        return { success: false, error: 'Failed to update display order' };
      }
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Soft delete a certification
 */
export async function deleteCertification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('certifications')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting certification:', error);
      return { success: false, error: 'Failed to delete certification' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Restore a soft-deleted certification
 */
export async function restoreCertification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('certifications')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error restoring certification:', error);
      return { success: false, error: 'Failed to restore certification' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Permanently delete a certification
 */
export async function permanentlyDeleteCertification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Delete logo from storage if exists
    const { data: cert } = await supabase
      .from('certifications')
      .select('logo_url')
      .eq('id', id)
      .single();

    if (cert?.logo_url) {
      const filePath = cert.logo_url.split('/').slice(-2).join('/');
      await supabase.storage.from('certification-logos').remove([filePath]);
    }

    // Permanently delete from database
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting certification:', error);
      return { success: false, error: 'Failed to permanently delete certification' };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/nos-labels-certifications');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
