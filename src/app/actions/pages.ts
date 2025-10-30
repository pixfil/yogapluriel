'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface Page {
  id: string;
  path: string;
  parent_path: string | null;
  is_dynamic: boolean;
  display_order: number;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  canonical_url: string | null;
  robots: string;
  structured_data: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface PageSEOData {
  title?: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  canonical_url?: string;
  robots?: string;
  structured_data?: any;
}

export interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
}

/**
 * Get all pages (optionally including deleted ones)
 */
export async function getAllPages(showDeleted = false): Promise<Page[]> {
  const supabase = await createClient();

  let query = supabase
    .from('pages')
    .select('*')
    .order('parent_path', { ascending: true, nullsFirst: true })
    .order('display_order', { ascending: true });

  if (!showDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pages:', error);
    throw new Error('Failed to fetch pages');
  }

  return data || [];
}

/**
 * Get SEO metadata for a specific page
 */
export async function getPageSEO(path: string): Promise<Page | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('path', path)
    .is('deleted_at', null)
    .single();

  if (error) {
    // Page not found in DB is OK (will use fallback)
    return null;
  }

  return data;
}

/**
 * Update SEO metadata for a page
 */
export async function updatePageSEO(
  path: string,
  seoData: PageSEOData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('pages')
      .update({
        ...seoData,
        updated_at: new Date().toISOString(),
      })
      .eq('path', path);

    if (error) {
      console.error('Error updating page SEO:', error);
      return { success: false, error: 'Failed to update page SEO' };
    }

    // Revalidate the specific page and admin pages
    revalidatePath(path);
    revalidatePath('/admin/pages');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Get pages tree (hierarchical structure)
 */
export async function getPageTree(showDeleted = false): Promise<PageTreeNode[]> {
  const pages = await getAllPages(showDeleted);

  const buildTree = (parentPath: string | null): PageTreeNode[] => {
    return pages
      .filter((page) => page.parent_path === parentPath)
      .map((page) => ({
        page,
        children: buildTree(page.path),
      }));
  };

  return buildTree(null);
}

/**
 * Get page statistics
 */
export async function getPageStats(): Promise<{
  total: number;
  withTitle: number;
  withDescription: number;
  withOG: number;
  optimized: number;
  deleted: number;
}> {
  const supabase = await createClient();

  const { data: allPages } = await supabase.from('pages').select('*');

  if (!allPages) {
    return { total: 0, withTitle: 0, withDescription: 0, withOG: 0, optimized: 0, deleted: 0 };
  }

  const activePages = allPages.filter((p) => !p.deleted_at);

  return {
    total: activePages.length,
    withTitle: activePages.filter((p) => p.title).length,
    withDescription: activePages.filter((p) => p.description).length,
    withOG: activePages.filter((p) => p.og_title && p.og_description).length,
    optimized: activePages.filter(
      (p) => p.title && p.description && p.og_title && p.og_description
    ).length,
    deleted: allPages.filter((p) => p.deleted_at).length,
  };
}

/**
 * Soft delete a page
 */
export async function deletePage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('pages')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('path', path);

    if (error) {
      console.error('Error deleting page:', error);
      return { success: false, error: 'Failed to delete page' };
    }

    revalidatePath('/admin/pages');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Restore a soft-deleted page
 */
export async function restorePage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('pages')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('path', path);

    if (error) {
      console.error('Error restoring page:', error);
      return { success: false, error: 'Failed to restore page' };
    }

    revalidatePath('/admin/pages');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Create a new page
 */
export async function createPage(
  pageData: Partial<Page>
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('pages')
      .insert(pageData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating page:', error);
      return { success: false, error: 'Failed to create page' };
    }

    revalidatePath('/admin/pages');

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Search pages
 */
export async function searchPages(query: string): Promise<Page[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .or(`path.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
    .is('deleted_at', null)
    .order('path', { ascending: true });

  if (error) {
    console.error('Error searching pages:', error);
    return [];
  }

  return data || [];
}
