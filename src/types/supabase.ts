export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  project_categories?: ProjectCategory[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  type: string;
  order_index: number;
}

export interface ProjectCategory {
  project_id: string;
  category_id: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  location: string;
  date: string;
  description: string;
  main_image?: string;
  technical_details?: string[];
  materials?: string[];
  duration?: string;
  published: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  project_images?: ProjectImage[];
  project_categories?: ProjectCategory[];
}

// Extended types for frontend use
export interface ProjectWithDetails extends Project {
  mainImage?: string;
  gallery?: GalleryImage[];
  category: string[]; // Array of category slugs
  projectCategories?: Category[]; // Full category objects
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order: number;
}

export interface CategoryWithCount extends Category {
  count?: number;
}

// Dashboard stats types
export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  featuredProjects: number;
  categoriesCount: number;
  recentProjects: Project[];
}