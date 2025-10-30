"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  Archive,
  Grid3x3,
  ArrowLeftRight,
  Search,
  Tags,
  Megaphone,
  Bell,
  X
} from 'lucide-react';
import Image from 'next/image';
import ProjectModal from './ProjectModal';
import { createProject, updateProject, deleteProject, toggleProjectStatus, toggleProjectHighlight } from '@/app/actions/projects';
import { ProjectFormData } from '@/lib/validations/project';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from './BulkActionsBar';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order_index: number;
}

interface ProjectCategory {
  category_id: string;
}

interface Project {
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
  is_highlighted?: boolean;
  main_image?: string | null;
  gallery_layout?: 'grid' | 'before-after';
  project_images?: ProjectImage[];
  project_categories?: ProjectCategory[];
  created_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  description: string;
  isMain: boolean;
  order: number;
}

interface AdminProjectsClientProps {
  initialProjects: Project[];
  categories: Category[];
}

export default function AdminProjectsClient({
  initialProjects,
  categories
}: AdminProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Extract unique years from projects
  const availableYears = Array.from(
    new Set(
      projects
        .filter(p => !p.deleted_at)
        .map(p => new Date(p.date).getFullYear())
    )
  ).sort((a, b) => b - a);

  // Filter projects based on deleted status, search, category, year, and featured
  const filteredProjects = projects
    .filter(p => showDeleted ? p.deleted_at : !p.deleted_at)
    .filter(p => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query)
      );
    })
    .filter(p => {
      if (selectedCategory === 'all') return true;
      return p.project_categories?.some(pc => pc.category_id === selectedCategory);
    })
    .filter(p => {
      if (selectedYear === 'all') return true;
      return new Date(p.date).getFullYear().toString() === selectedYear;
    })
    .filter(p => {
      if (!showFeaturedOnly) return true;
      return p.featured;
    });

  // Bulk selection hook
  const bulkSelect = useBulkSelect({
    items: filteredProjects,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      const action = showDeleted ? 'permanent' : 'delete';
      const response = await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'projects',
          ids,
          action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete projects');
      }

      // Refresh page to show updated data
      window.location.reload();
    },
    onRestore: showDeleted ? async (ids: string[]) => {
      const response = await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'projects',
          ids,
          action: 'restore'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to restore projects');
      }

      // Refresh page to show updated data
      window.location.reload();
    } : undefined
  });

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (data: ProjectFormData, images: ImageFile[]) => {
    setIsLoading(true);
    try {
      if (editingProject) {
        const result = await updateProject(editingProject.id, data, images);
        if (result.success) {
          // Refresh the projects list
          window.location.reload();
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await createProject(data, images);
        if (result.success) {
          // Refresh the projects list
          window.location.reload();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteProject(projectId);
      if (result.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (projectId: string, field: 'published' | 'featured') => {
    setIsLoading(true);
    try {
      const result = await toggleProjectStatus(projectId, field);
      if (result.success) {
        setProjects(projects.map(p =>
          p.id === projectId
            ? { ...p, [field]: result.newStatus }
            : p
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHighlight = async (projectId: string, currentValue: boolean) => {
    setIsLoading(true);
    try {
      const result = await toggleProjectHighlight(projectId, currentValue);
      if (result.success) {
        setProjects(projects.map(p =>
          p.id === projectId
            ? { ...p, is_highlighted: !currentValue }
            : p
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error toggling highlight:', error);
      alert('Erreur lors du changement de mise en avant. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert project data for the modal
  const getModalProject = (project: Project | null) => {
    if (!project) return null;

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      subtitle: project.subtitle,
      location: project.location,
      date: project.date,
      description: project.description,
      technical_details: project.technical_details,
      materials: project.materials,
      duration: project.duration,
      published: project.published,
      featured: project.featured,
      categories: project.project_categories?.map(pc => pc.category_id) || [],
      gallery_layout: project.gallery_layout || 'grid',
      project_images: project.project_images || [],
    };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des projets</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos projets et réalisations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Tags className="w-4 h-4 mr-2" />
              Gérer catégories
            </Link>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
                showDeleted
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Archive className="w-4 h-4 mr-2" />
              {showDeleted ? 'Masquer la corbeille' : 'Voir la corbeille'}
            </button>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total actifs</p>
                <p className="text-2xl font-bold text-gray-900">{projects.filter(p => !p.deleted_at).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.published && !p.deleted_at).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow/20">
                <Star className="w-6 h-6 text-yellow" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favoris</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.featured && !p.deleted_at).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Archive className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Supprimés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.deleted_at).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent bg-white"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent bg-white"
            >
              <option value="all">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            {/* Featured Toggle */}
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
              <Star className="w-4 h-4 text-yellow" />
              <span className="text-sm font-medium text-gray-700">Favoris</span>
              <button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showFeaturedOnly ? 'bg-yellow' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showFeaturedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <BulkSelectCheckbox
                        checked={bulkSelect.isAllSelected}
                        indeterminate={bulkSelect.isSomeSelected}
                        onChange={bulkSelect.toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Catégories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut & Options
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => {
                    const imageCount = project.project_images?.length || 0;

                    return (
                      <tr key={project.id} className={`hover:bg-gray-50 ${project.deleted_at ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4">
                          <BulkSelectCheckbox
                            checked={bulkSelect.isSelected(project.id)}
                            onChange={() => bulkSelect.toggleSelect(project.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {project.main_image ? (
                              <div
                                className="flex-shrink-0 h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setLightboxImage({ url: project.main_image!, title: project.title })}
                                title="Cliquer pour agrandir"
                              >
                                <Image
                                  src={project.main_image}
                                  alt={project.title}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="ml-4 max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {project.title}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                {project.featured && (
                                  <Star className="w-3 h-3 text-yellow fill-current" />
                                )}
                                <span>ID: {project.id.slice(0, 8)}</span>
                                {/* Gallery Layout Indicator */}
                                {(project as any).gallery_layout === 'before-after' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700" title="Galerie avant/après">
                                    <ArrowLeftRight className="w-3 h-3" />
                                    Avant/Après
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600" title="Galerie classique">
                                    <Grid3x3 className="w-3 h-3" />
                                    Grille
                                  </span>
                                )}
                                {project.deleted_at && <DeletedBadge deletedAt={project.deleted_at} />}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {project.project_categories && project.project_categories.length > 0 ? (
                              project.project_categories.map((pc) => {
                                const category = categories.find(c => c.id === pc.category_id);
                                return category ? (
                                  <span
                                    key={pc.category_id}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {category.name}
                                  </span>
                                ) : null;
                              })
                            ) : (
                              <span className="text-sm text-gray-400 italic">Aucune</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {project.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {project.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleStatus(project.id, 'published')}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                project.published
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                              disabled={isLoading}
                            >
                              {project.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {project.published ? 'Publié' : 'Brouillon'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(project.id, 'featured')}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                project.featured
                                  ? 'bg-yellow text-black hover:bg-yellow/90'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              disabled={isLoading}
                              title={project.featured ? 'Retirer des favoris' : 'Mettre en favori'}
                            >
                              <Star className={`w-3 h-3 ${project.featured ? 'fill-current' : ''}`} />
                              {project.featured ? 'Favori' : 'Normal'}
                            </button>
                            <button
                              onClick={() => handleToggleHighlight(project.id, project.is_highlighted || false)}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                project.is_highlighted
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              disabled={isLoading || !!project.deleted_at}
                              title={project.is_highlighted ? 'Désactiver la popup' : 'Activer la popup'}
                            >
                              <Bell className={`w-3 h-3 ${project.is_highlighted ? '' : 'opacity-50'}`} />
                              Popup {project.is_highlighted ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {imageCount} image{imageCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={`/nos-realisations/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Voir sur le site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-yellow hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              disabled={isLoading || !!project.deleted_at}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre premier projet.
              </p>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un projet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={getModalProject(editingProject)}
        categories={categories}
        onSave={handleSaveProject}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkSelect.selectedCount}
        onDelete={bulkSelect.deleteSelected}
        onRestore={showDeleted ? bulkSelect.restoreSelected : undefined}
        onDeselectAll={bulkSelect.deselectAll}
        isLoading={bulkSelect.isLoading}
        showRestore={showDeleted}
      />

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Fermer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="flex flex-col items-center gap-4 max-w-full max-h-full">
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.title}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">
                {lightboxImage.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}