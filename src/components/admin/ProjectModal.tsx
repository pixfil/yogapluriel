"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Info, 
  Image as ImageIcon, 
  Settings,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import Modal from '@/components/ui/modal';
import ImageUpload from './ImageUpload';
import { projectSchema, ProjectFormData, generateSlug } from '@/lib/validations/project';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  description: string;
  isMain: boolean;
  order: number;
  imageType?: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
}

interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order_index: number;
}

interface Project {
  id?: string;
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
  categories: string[];
  gallery_layout?: 'grid' | 'before-after';
  project_images?: ProjectImage[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  categories: Category[];
  onSave: (data: ProjectFormData, images: ImageFile[]) => Promise<void>;
}

const tabs = [
  { id: 'info', name: 'Informations', icon: Info },
  { id: 'images', name: 'Images', icon: ImageIcon },
  { id: 'technical', name: 'Technique', icon: Settings },
];

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  project, 
  categories,
  onSave 
}: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [technicalDetails, setTechnicalDetails] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!project?.id;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      slug: '',
      subtitle: '',
      location: '',
      date: new Date().getFullYear().toString(),
      description: '',
      technical_details: [],
      materials: [],
      duration: '',
      published: false,
      featured: false,
      categories: [],
      gallery_layout: 'grid',
    }
  });

  const watchTitle = watch('title');
  const watchGalleryLayout = watch('gallery_layout');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !isEditing) {
      const newSlug = generateSlug(watchTitle);
      setValue('slug', newSlug, { shouldDirty: true, shouldValidate: false, shouldTouch: false });
    }
  }, [watchTitle, setValue, isEditing]);

  // Initialize form when project changes
  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        slug: project.slug,
        subtitle: project.subtitle || '',
        location: project.location,
        date: project.date,
        description: project.description,
        technical_details: project.technical_details || [],
        materials: project.materials || [],
        duration: project.duration || '',
        published: project.published,
        featured: project.featured,
        categories: project.categories,
        gallery_layout: project.gallery_layout || 'grid',
      });
      setTechnicalDetails(project.technical_details || []);
      setMaterials(project.materials || []);

      // Load existing project images
      if (project.project_images && project.project_images.length > 0) {
        const loadedImages: ImageFile[] = project.project_images.map((img, index) => ({
          id: img.id,
          url: img.url,
          description: img.alt || img.caption || '',
          isMain: index === 0, // First image is main
          order: img.order_index,
          imageType: img.type,
        }));
        setImages(loadedImages);
      } else {
        setImages([]);
      }
    } else {
      reset();
      setTechnicalDetails([]);
      setMaterials([]);
      setImages([]);
    }
    setActiveTab('info');
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const formDataWithArrays = {
        ...data,
        technical_details: technicalDetails,
        materials: materials,
      };
      await onSave(formDataWithArrays, images);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTechnicalDetail = () => {
    setTechnicalDetails([...technicalDetails, '']);
  };

  const removeTechnicalDetail = (index: number) => {
    setTechnicalDetails(technicalDetails.filter((_, i) => i !== index));
  };

  const updateTechnicalDetail = (index: number, value: string) => {
    const updated = [...technicalDetails];
    updated[index] = value;
    setTechnicalDetails(updated);
  };

  const addMaterial = () => {
    setMaterials([...materials, '']);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, value: string) => {
    const updated = [...materials];
    updated[index] = value;
    setMaterials(updated);
  };

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du projet *
                </label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                  placeholder="Rénovation toiture..."
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  {...register('slug')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                  placeholder="renovation-toiture"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sous-titre
              </label>
              <input
                {...register('subtitle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                placeholder="Description courte du projet"
              />
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation *
                </label>
                <input
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                  placeholder="Strasbourg, Bas-Rhin"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Année *
                </label>
                <input
                  {...register('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                  placeholder="2024"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories *
              </label>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categories.map((category) => (
                      <label 
                        key={category.id} 
                        className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, category.id]);
                            } else {
                              field.onChange(field.value.filter(id => id !== category.id));
                            }
                          }}
                          className="rounded border-gray-300 text-yellow focus:ring-yellow"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.categories && (
                <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description complète *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                placeholder="Décrivez le projet en détail..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  {...register('published')}
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <span className="text-sm font-medium">Projet publié</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  {...register('featured')}
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <span className="text-sm font-medium">Projet à la une</span>
              </label>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            {/* Gallery Layout Selector */}
            <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de galerie
              </label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register('gallery_layout')}
                    type="radio"
                    value="grid"
                    className="mt-1 rounded border-gray-300 text-yellow focus:ring-yellow"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Galerie classique</div>
                    <div className="text-sm text-gray-500">
                      Grille d'images adaptative. Idéal pour montrer plusieurs angles et détails du projet.
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register('gallery_layout')}
                    type="radio"
                    value="before-after"
                    className="mt-1 rounded border-gray-300 text-yellow focus:ring-yellow"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Avant / Pendant / Après</div>
                    <div className="text-sm text-gray-500">
                      Mise en page en 3 colonnes pour montrer l'évolution du chantier. Les images doivent être nommées avec "avant", "pendant" ou "apres".
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
              galleryLayout={watchGalleryLayout as 'grid' | 'before-after'}
            />
          </div>
        );

      case 'technical':
        return (
          <div className="space-y-6">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée des travaux
              </label>
              <input
                {...register('duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                placeholder="3 semaines"
              />
            </div>

            {/* Technical Details */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Détails techniques
                </label>
                <button
                  type="button"
                  onClick={addTechnicalDetail}
                  className="flex items-center gap-1 text-sm text-yellow hover:text-yellow-600"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {technicalDetails.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={detail}
                      onChange={(e) => updateTechnicalDetail(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                      placeholder="Détail technique..."
                    />
                    <button
                      type="button"
                      onClick={() => removeTechnicalDetail(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Matériaux utilisés
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="flex items-center gap-1 text-sm text-yellow hover:text-yellow-600"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={material}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-yellow"
                      placeholder="Matériau..."
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, register, control, categories, errors, images, setImages, technicalDetails, materials, updateTechnicalDetail, removeTechnicalDetail, addTechnicalDetail, updateMaterial, removeMaterial, addMaterial, watchGalleryLayout]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Modifier : ${project?.title}` : 'Nouveau projet'}
      size="xl"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-yellow text-yellow'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 py-6 overflow-y-auto">
          {tabContent}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && '• Modifications non sauvegardées'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}