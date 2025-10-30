'use server';

import { createClient, getAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface Popup {
  id: string;
  title: string;
  internal_name: string;
  is_active: boolean;

  // Content tab
  heading: string | null;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;

  // Appearance tab
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  overlay_color: string;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  width_px: number;
  border_radius: number;

  // Rules tab
  trigger_type: 'on_load' | 'on_exit' | 'on_scroll' | 'timed';
  trigger_delay: number;
  scroll_percentage: number;
  show_once_per_session: boolean;
  show_once_per_user: boolean;
  excluded_paths: string[] | null;
  included_paths: string[] | null;
  start_date: string | null;
  end_date: string | null;

  // Statistics
  view_count: number;
  click_count: number;
  close_count: number;

  // Management
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePopupData {
  title: string;
  internal_name: string;
  is_active?: boolean;

  // Content
  heading?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;

  // Appearance
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  overlay_color?: string;
  background_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
  width_px?: number;
  border_radius?: number;

  // Rules
  trigger_type?: 'on_load' | 'on_exit' | 'on_scroll' | 'timed';
  trigger_delay?: number;
  scroll_percentage?: number;
  show_once_per_session?: boolean;
  show_once_per_user?: boolean;
  excluded_paths?: string[];
  included_paths?: string[];
  start_date?: string;
  end_date?: string;
}

/**
 * Get all popups (optionally including deleted ones)
 */
export async function getAllPopups(showDeleted = false): Promise<Popup[]> {
  const supabase = getAdminClient();

  let query = supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });

  if (!showDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching popups:', error);
    throw new Error('Failed to fetch popups');
  }

  return data || [];
}

/**
 * Get a single popup by ID
 */
export async function getPopup(id: string): Promise<Popup | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching popup:', error);
    return null;
  }

  return data;
}

/**
 * Get active popups for public display
 * Filters by is_active, dates, and deleted_at
 */
export async function getActivePopups(): Promise<Popup[]> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`);

  if (error) {
    console.error('Error fetching active popups:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new popup
 */
export async function createPopup(
  data: CreatePopupData,
  imageFile?: File
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Get authenticated user
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Use admin client for database operations
    const supabase = getAdminClient();
    let image_url: string | null = null;

    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('popup-images')
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, error: 'Failed to upload image' };
      }

      const { data: urlData } = supabase.storage
        .from('popup-images')
        .getPublicUrl(filePath);

      image_url = urlData.publicUrl;
    }

    // Insert popup
    const { data: insertData, error: insertError } = await supabase
      .from('popups')
      .insert({
        ...data,
        image_url: image_url || data.image_url,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating popup:', insertError);
      return { success: false, error: 'Failed to create popup' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/'); // Revalidate all public pages

    return { success: true, id: insertData.id };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Update an existing popup
 */
export async function updatePopup(
  id: string,
  data: Partial<CreatePopupData>,
  imageFile?: File
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Use admin client for database operations
    const supabase = getAdminClient();

    let updateData: any = {
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Upload new image if provided
    if (imageFile) {
      // Delete old image if exists
      const { data: oldData } = await supabase
        .from('popups')
        .select('image_url')
        .eq('id', id)
        .single();

      if (oldData?.image_url) {
        const oldPath = oldData.image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('popup-images').remove([oldPath]);
      }

      // Upload new image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('popup-images')
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, error: 'Failed to upload image' };
      }

      const { data: urlData } = supabase.storage
        .from('popup-images')
        .getPublicUrl(filePath);

      updateData.image_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('popups')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating popup:', updateError);
      return { success: false, error: 'Failed to update popup' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/'); // Revalidate all public pages

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Toggle active status
 */
export async function toggleActive(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Use admin client for database operations
    const supabase = getAdminClient();

    const { data: current } = await supabase
      .from('popups')
      .select('is_active')
      .eq('id', id)
      .single();

    if (!current) {
      return { success: false, error: 'Popup not found' };
    }

    const { error } = await supabase
      .from('popups')
      .update({
        is_active: !current.is_active,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error toggling active:', error);
      return { success: false, error: 'Failed to toggle active status' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Soft delete a popup
 */
export async function deletePopup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('popups')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting popup:', error);
      return { success: false, error: 'Failed to delete popup' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Restore a soft-deleted popup
 */
export async function restorePopup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('popups')
      .update({
        deleted_at: null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error restoring popup:', error);
      return { success: false, error: 'Failed to restore popup' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Permanently delete a popup
 */
export async function permanentlyDeletePopup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient();

    // Delete image from storage if exists
    const { data: popup } = await supabase
      .from('popups')
      .select('image_url')
      .eq('id', id)
      .single();

    if (popup?.image_url) {
      const filePath = popup.image_url.split('/').slice(-2).join('/');
      await supabase.storage.from('popup-images').remove([filePath]);
    }

    // Permanently delete from database
    const { error } = await supabase
      .from('popups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting popup:', error);
      return { success: false, error: 'Failed to permanently delete popup' };
    }

    revalidatePath('/admin/popups');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Increment view count (public - called from front-end)
 */
export async function incrementPopupView(popupId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    await supabase.rpc('increment_popup_view', { popup_id: popupId });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing view:', error);
    return { success: false };
  }
}

/**
 * Increment click count (public - called when CTA is clicked)
 */
export async function incrementPopupClick(popupId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    await supabase.rpc('increment_popup_click', { popup_id: popupId });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing click:', error);
    return { success: false };
  }
}

/**
 * Increment close count (public - called when popup is closed)
 */
export async function incrementPopupClose(popupId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    await supabase.rpc('increment_popup_close', { popup_id: popupId });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing close:', error);
    return { success: false };
  }
}
