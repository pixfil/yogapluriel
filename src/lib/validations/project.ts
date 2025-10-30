import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  slug: z.string().min(1, 'Le slug est requis').regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  subtitle: z.string().optional(),
  location: z.string().min(1, 'La localisation est requise').max(100, 'La localisation est trop longue'),
  date: z.string().min(1, 'La date est requise').max(20, 'La date est trop longue'),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères').max(5000, 'La description est trop longue'),
  technical_details: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  duration: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  categories: z.array(z.string().uuid('ID de catégorie invalide')).min(1, 'Au moins une catégorie est requise'),
  gallery_layout: z.enum(['grid', 'before-after']).default('grid'),
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Fichier requis' }),
  alt: z.string().optional(),
  isMain: z.boolean().default(false),
  order: z.number().int().positive().default(1),
});

export const projectImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url('URL d\'image invalide'),
  description: z.string().optional(),
  is_main: z.boolean().default(false),
  display_order: z.number().int().positive().default(1),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type ProjectImageData = z.infer<typeof projectImageSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// Fonction utilitaire pour générer un slug à partir du titre
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Ne garde que lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Évite les tirets multiples
    .replace(/^-|-$/g, ''); // Supprime les tirets en début/fin
}