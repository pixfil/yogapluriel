'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface LexiqueTerm {
  id: string;
  term: string;
  definition: string;
  letter: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface CreateLexiqueTermData {
  term: string;
  definition: string;
  letter: string;
  published?: boolean;
}

export interface LexiqueGroupedByLetter {
  letter: string;
  terms: LexiqueTerm[];
}

/**
 * Get all lexique terms (optionally including deleted ones)
 */
export async function getLexiqueTerms(showDeleted = false): Promise<LexiqueTerm[]> {
  const supabase = await createClient();

  let query = supabase
    .from('lexique_terms')
    .select('*')
    .order('letter', { ascending: true })
    .order('display_order', { ascending: true });

  if (!showDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching lexique terms:', error);
    throw new Error('Failed to fetch lexique terms');
  }

  return data || [];
}

/**
 * Get lexique terms grouped by letter
 */
export async function getLexiqueGroupedByLetter(showDeleted = false): Promise<LexiqueGroupedByLetter[]> {
  const terms = await getLexiqueTerms(showDeleted);

  const grouped: Record<string, LexiqueTerm[]> = {};

  terms.forEach((term) => {
    if (!grouped[term.letter]) {
      grouped[term.letter] = [];
    }
    grouped[term.letter].push(term);
  });

  return Object.entries(grouped)
    .map(([letter, terms]) => ({ letter, terms }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

/**
 * Get a single lexique term by ID
 */
export async function getLexiqueTerm(id: string): Promise<LexiqueTerm | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lexique_terms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lexique term:', error);
    return null;
  }

  return data;
}

/**
 * Create a new lexique term
 */
export async function createLexiqueTerm(
  data: CreateLexiqueTermData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient();

    // Get max display_order for this letter
    const { data: maxOrderData } = await supabase
      .from('lexique_terms')
      .select('display_order')
      .eq('letter', data.letter.toUpperCase())
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.display_order || 0) + 1;

    // Insert term
    const { data: insertData, error: insertError } = await supabase
      .from('lexique_terms')
      .insert({
        ...data,
        letter: data.letter.toUpperCase(),
        display_order: nextOrder,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating lexique term:', insertError);
      return { success: false, error: 'Failed to create term' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true, id: insertData.id };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Update an existing lexique term
 */
export async function updateLexiqueTerm(
  id: string,
  data: Partial<CreateLexiqueTermData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // If letter is changed, reset display_order
    if (data.letter) {
      updateData.letter = data.letter.toUpperCase();

      const { data: maxOrderData } = await supabase
        .from('lexique_terms')
        .select('display_order')
        .eq('letter', updateData.letter)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      updateData.display_order = (maxOrderData?.display_order || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from('lexique_terms')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating lexique term:', updateError);
      return { success: false, error: 'Failed to update term' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

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
      .from('lexique_terms')
      .select('published')
      .eq('id', id)
      .single();

    if (!current) {
      return { success: false, error: 'Term not found' };
    }

    const { error } = await supabase
      .from('lexique_terms')
      .update({
        published: !current.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error toggling published:', error);
      return { success: false, error: 'Failed to toggle published status' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Update display order for multiple terms within same letter
 */
export async function updateDisplayOrder(
  terms: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    for (const term of terms) {
      const { error } = await supabase
        .from('lexique_terms')
        .update({
          display_order: term.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', term.id);

      if (error) {
        console.error('Error updating display order:', error);
        return { success: false, error: 'Failed to update display order' };
      }
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Soft delete a lexique term
 */
export async function deleteLexiqueTerm(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('lexique_terms')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting lexique term:', error);
      return { success: false, error: 'Failed to delete term' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Restore a soft-deleted lexique term
 */
export async function restoreLexiqueTerm(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('lexique_terms')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error restoring lexique term:', error);
      return { success: false, error: 'Failed to restore term' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Permanently delete a lexique term
 */
export async function permanentlyDeleteLexiqueTerm(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('lexique_terms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting lexique term:', error);
      return { success: false, error: 'Failed to permanently delete term' };
    }

    revalidatePath('/admin/lexique');
    revalidatePath('/lexique');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Search lexique terms
 */
export async function searchLexiqueTerms(query: string): Promise<LexiqueTerm[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lexique_terms')
    .select('*')
    .or(`term.ilike.%${query}%,definition.ilike.%${query}%`)
    .is('deleted_at', null)
    .eq('published', true)
    .order('letter', { ascending: true })
    .order('term', { ascending: true });

  if (error) {
    console.error('Error searching lexique terms:', error);
    return [];
  }

  return data || [];
}
