import { z } from 'zod';

/**
 * Schéma de validation pour le formulaire de contact
 * Utilisé par /api/contact/route.ts
 */
export const contactFormSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),

  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email est trop long'),

  telephone: z.string()
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? val.replace(/[\s\-\.]/g, '') : ''), // Nettoyer espaces, tirets, points

  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
    .trim(),

  recaptchaToken: z.string()
    .nullish(), // Accepte null, undefined, ou string

  // Tracking source (optionnel)
  sourceUrl: z.string().max(500).optional(),
  sourceFormType: z.string().max(100).optional(),
  referrer: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
