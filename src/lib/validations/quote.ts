import { z } from 'zod';

/**
 * Schéma de validation pour le formulaire de devis simple
 * Utilisé par /api/quote/route.ts
 */
export const quoteFormSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email est trop long'),

  telephone: z.string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide'),

  adresse: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(300, 'L\'adresse est trop longue')
    .optional()
    .or(z.literal('')),

  codePostal: z.string()
    .regex(/^[0-9]{5}$/, 'Code postal français invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),

  ville: z.string()
    .min(2, 'Le nom de la ville doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la ville est trop long')
    .optional()
    .or(z.literal('')),

  typePrestation: z.string()
    .min(1, 'Le type de prestation est requis')
    .max(100, 'Le type de prestation est trop long'),

  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim(),

  recaptchaToken: z.string()
    .min(1, 'Token reCAPTCHA manquant'),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
