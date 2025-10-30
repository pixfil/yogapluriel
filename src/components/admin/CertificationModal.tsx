'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/modal';
import { X, Plus } from 'lucide-react';
import { Certification } from '@/app/actions/certifications';
import { createClient } from '@/lib/supabase-browser';

const certificationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  logo_url: z.string().url('URL invalide').or(z.literal('')).optional(),
  category: z.enum(['quality', 'expertise', 'territorial', 'network']),
  description: z.string().min(1, 'La description est requise'),
  benefits: z.array(z.string()).min(1, 'Au moins un avantage est requis'),
  published: z.boolean().default(true),
});

type CertificationFormData = z.infer<typeof certificationSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certification?: Certification | null;
  onSuccess: () => void;
}

const categoryOptions = [
  { value: 'quality', label: 'Qualité', color: 'bg-blue-100 text-blue-800' },
  { value: 'expertise', label: 'Expertise', color: 'bg-green-100 text-green-800' },
  { value: 'territorial', label: 'Territorial', color: 'bg-amber-100 text-amber-800' },
  { value: 'network', label: 'Réseau', color: 'bg-purple-100 text-purple-800' },
];

export default function CertificationModal({ isOpen, onClose, certification, onSuccess }: Props) {
  const isEditing = !!certification;
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      category: 'quality',
      description: '',
      benefits: [''],
      published: true,
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (isOpen && certification) {
      reset({
        name: certification.name,
        logo_url: certification.logo_url || '',
        category: certification.category,
        description: certification.description,
        benefits: certification.benefits,
        published: certification.published,
      });
      setBenefits(certification.benefits.length > 0 ? certification.benefits : ['']);
      setLogoPreview(certification.logo_url || null);
    } else if (isOpen && !certification) {
      reset({
        name: '',
        logo_url: '',
        category: 'quality',
        description: '',
        benefits: [''],
        published: true,
      });
      setBenefits(['']);
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [isOpen, certification, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits.length > 0 ? newBenefits : ['']);
    setValue('benefits', newBenefits.filter(b => b.trim()));
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
    setValue('benefits', newBenefits.filter(b => b.trim()));
  };

  const onSubmit = async (data: CertificationFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      let logoUrl = data.logo_url || '';

      // Upload du logo si un fichier est sélectionné
      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certification-logos')
          .upload(fileName, logoFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('certification-logos')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      // Déterminer la couleur selon la catégorie
      const categoryColor = categoryOptions.find(c => c.value === data.category)?.color || 'bg-gray-100 text-gray-800';

      const certificationData = {
        name: data.name,
        logo_url: logoUrl,
        category: data.category,
        category_color: categoryColor,
        description: data.description,
        benefits: data.benefits.filter(b => b.trim()),
        published: data.published,
      };

      if (isEditing && certification) {
        // Mise à jour
        const { error } = await supabase
          .from('certifications')
          .update(certificationData)
          .eq('id', certification.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('certifications')
          .insert([certificationData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Modifier : ${certification?.name}` : 'Nouvelle certification'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la certification *
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: RGE QualiPV"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="w-20 h-20 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WebP, SVG - Max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryOptions.find(c => c.value === selectedCategory)?.color}`}>
                Aperçu: {categoryOptions.find(c => c.value === selectedCategory)?.label}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description courte de la certification..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Avantages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avantages *
          </label>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Avantage ${index + 1}`}
                />
                {benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addBenefit}
            className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter un avantage
          </button>
          {errors.benefits && (
            <p className="mt-1 text-sm text-red-600">{errors.benefits.message}</p>
          )}
        </div>

        {/* Statut */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            {...register('published')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Publier immédiatement
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
