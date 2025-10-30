// Utility functions for working with project data

import projectsData from "./projects-data.json";

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  type: 'avant' | 'pendant' | 'apres' | 'detail';
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  category: string[];
  mainImage: string;
  gallery: ProjectImage[];
  description: string;
  technicalDetails?: string[];
  materials?: string[];
  duration?: string;
  featured: boolean;
  published: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Get all published projects
export function getAllProjects(): Project[] {
  return projectsData.projects.filter(project => project.published);
}

// Get project by slug
export function getProjectBySlug(slug: string): Project | null {
  return projectsData.projects.find(project => project.slug === slug) || null;
}

// Get featured projects
export function getFeaturedProjects(): Project[] {
  return projectsData.projects.filter(project => project.published && project.featured);
}

// Get projects by category
export function getProjectsByCategory(categoryId: string): Project[] {
  return projectsData.projects.filter(project => 
    project.published && project.category.includes(categoryId)
  );
}

// Get related projects (same category, excluding current project)
export function getRelatedProjects(project: Project, limit: number = 3): Project[] {
  return projectsData.projects
    .filter(p => 
      p.id !== project.id && 
      p.published && 
      p.category.some(cat => project.category.includes(cat))
    )
    .slice(0, limit);
}

// Get all categories
export function getAllCategories(): Category[] {
  return projectsData.categories;
}

// Get categories with project counts
export function getCategoriesWithCounts(): Array<Category & { count: number }> {
  return projectsData.categories.map(category => {
    const count = projectsData.projects.filter(project => 
      project.category.includes(category.id) && project.published
    ).length;
    return { ...category, count };
  }).filter(category => category.count > 0);
}

// Get category by ID
export function getCategoryById(id: string): Category | null {
  return projectsData.categories.find(category => category.id === id) || null;
}

// Get recent projects
export function getRecentProjects(limit: number = 6): Project[] {
  return projectsData.projects
    .filter(project => project.published)
    .sort((a, b) => parseInt(b.date) - parseInt(a.date))
    .slice(0, limit);
}

// Search projects by term
export function searchProjects(searchTerm: string): Project[] {
  const term = searchTerm.toLowerCase();
  
  return projectsData.projects.filter(project => 
    project.published && (
      project.title.toLowerCase().includes(term) ||
      project.location.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.technicalDetails?.some(detail => detail.toLowerCase().includes(term)) ||
      project.materials?.some(material => material.toLowerCase().includes(term))
    )
  );
}

// Get project statistics
export function getProjectStatistics() {
  const allProjects = getAllProjects();
  const categories = getCategoriesWithCounts();
  
  return {
    total: allProjects.length,
    featured: allProjects.filter(p => p.featured).length,
    categories: categories.length,
    recentYear: Math.max(...allProjects.map(p => parseInt(p.date))),
    locations: [...new Set(allProjects.map(p => p.location))].length
  };
}