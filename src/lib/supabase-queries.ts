import { createClient } from '@/lib/supabase-server';

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  count?: number;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order_index: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  location: string;
  date: string;
  description: string;
  technical_details?: string[];
  materials?: string[];
  duration?: string;
  published: boolean;
  featured: boolean;
  mainImage?: string;
  category: string[]; // Array of category slugs for compatibility
  project_images?: ProjectImage[];
  project_categories?: { category_id: string }[];
}

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images(id, url, alt, type, order_index),
        project_categories(category_id)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    if (!projects) return [];

    // Also fetch categories to get slugs
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug');

    const categoryMap = new Map(categories?.map(cat => [cat.id, cat.slug]) || []);

    // Transform data to match frontend expectations
    return projects.map(project => {
      return {
        ...project,
        mainImage: project.main_image,
        category: project.project_categories?.map(pc => categoryMap.get(pc.category_id)).filter(Boolean) || [],
      };
    });
  } catch (error) {
    console.error('Error in getPublishedProjects:', error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
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

    if (!categories) return [];

    // Get project counts for each category
    const { data: projects } = await supabase
      .from('projects')
      .select(`
        id,
        published,
        project_categories(category_id)
      `)
      .eq('published', true);

    // Count projects per category
    const categoryCounts = new Map<string, number>();
    projects?.forEach(project => {
      project.project_categories?.forEach(pc => {
        const current = categoryCounts.get(pc.category_id) || 0;
        categoryCounts.set(pc.category_id, current + 1);
      });
    });

    // Add color mapping (matching the original JSON)
    const colorMap: Record<string, string> = {
      'ardoise': '#374151',
      'tuile-plate': '#DC2626',
      'tuile-mecanique': '#B91C1C',
      'zinc': '#6B7280',
      'cuivre': '#B45309',
      'alu-prefa': '#4B5563',
      'velux': '#2563EB',
      'isolation': '#059669',
      'epdm': '#1E293B',
      'zinguerie': '#7C2D12',
      'patrimoine': '#7C3AED'
    };

    return categories.map(category => ({
      ...category,
      color: colorMap[category.slug] || '#6B7280',
      count: categoryCounts.get(category.id) || 0,
    })).filter(category => category.count > 0);
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
  const supabase = await createClient();
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images(id, url, alt, type, order_index),
        project_categories(category_id)
      `)
      .eq('published', true)
      .eq('featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }

    if (!projects) return [];

    // Also fetch categories to get slugs
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug');

    const categoryMap = new Map(categories?.map(cat => [cat.id, cat.slug]) || []);

    // Transform data to match frontend expectations
    return projects.map(project => {
      return {
        ...project,
        mainImage: project.main_image,
        category: project.project_categories?.map(pc => categoryMap.get(pc.category_id)).filter(Boolean) || [],
      };
    });
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    return [];
  }
}

// ============================================
// Highlighted Items (Notifications)
// ============================================

export async function getHighlightedProject(): Promise<Project | null> {
  try {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_highlighted', true)
      .eq('published', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return projects && projects.length > 0 ? projects[0] : null;
  } catch (error) {
    console.error('Error in getHighlightedProject:', error);
    return null;
  }
}

export async function getHighlightedJob(): Promise<any | null> {
  try {
    const supabase = await createClient();

    const { data: jobs, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('is_highlighted', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return jobs && jobs.length > 0 ? jobs[0] : null;
  } catch (error) {
    console.error('Error in getHighlightedJob:', error);
    return null;
  }
}