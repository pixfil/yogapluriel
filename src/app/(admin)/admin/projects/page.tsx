import { createClient, getAdminClient } from '@/lib/supabase-server';
import AdminProjectsClient from '@/components/admin/AdminProjectsClient';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getProjects() {
  // Use admin client to bypass RLS and fetch deleted projects too
  const supabase = getAdminClient();

  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        slug,
        subtitle,
        location,
        date,
        description,
        technical_details,
        materials,
        duration,
        published,
        featured,
        is_highlighted,
        main_image,
        gallery_layout,
        created_at,
        deleted_at,
        deleted_by,
        project_images(id, url, alt, type, order_index),
        project_categories(category_id)
      `)
      .order('created_at', { ascending: false });

    console.log('[getProjects] Fetched', projects?.length || 0, 'projects');
    console.log('[getProjects] Deleted projects:', projects?.filter(p => p.deleted_at).length || 0);

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return projects || [];
  } catch (error) {
    console.error('Error in getProjects:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return categories || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export default async function AdminProjectsPage() {
  const [projects, categories] = await Promise.all([
    getProjects(),
    getCategories()
  ]);

  return (
    <AdminProjectsClient 
      initialProjects={projects} 
      categories={categories}
    />
  );
}