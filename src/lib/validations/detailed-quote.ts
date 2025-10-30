import { z } from 'zod';

/**
 * Schéma de validation pour le formulaire de devis détaillé
 * Utilisé par /api/detailed-quote/route.ts
 */

const travauxItemSchema = z.object({
  categorie: z.string(),
  items: z.array(z.string()),
});

const fichierJointSchema = z.object({
  nom: z.string(),
  url: z.string().url(),
  type: z.string(),
  taille: z.number().positive(),
});

export const detailedQuoteFormSchema = z.object({
  // Informations client
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),

  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email est trop long'),

  telephone: z.string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide'),

  // Adresse du chantier
  adresseChantier: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(300, 'L\'adresse est trop longue'),

  codePostalChantier: z.string()
    .regex(/^[0-9]{5}$/, 'Code postal français invalide (5 chiffres)'),

  villeChantier: z.string()
    .min(2, 'Le nom de la ville doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la ville est trop long'),

  // Informations du projet
  typeBatiment: z.enum(['maison_individuelle', 'immeuble', 'local_commercial', 'autre'], {
    errorMap: () => ({ message: 'Type de bâtiment invalide' }),
  }),

  surfaceToiture: z.number()
    .positive('La surface doit être positive')
    .max(10000, 'La surface est trop grande')
    .optional(),

  anneeConstruction: z.number()
    .int('L\'année doit être un nombre entier')
    .min(1800, 'Année invalide')
    .max(new Date().getFullYear(), 'L\'année ne peut pas être dans le futur')
    .optional(),

  // Travaux souhaités
  travauxSouhaites: z.array(travauxItemSchema)
    .min(1, 'Au moins une catégorie de travaux doit être sélectionnée'),

  urgence: z.enum(['immediat', 'sous_1_mois', 'sous_3_mois', 'plus_de_3_mois'], {
    errorMap: () => ({ message: 'Urgence invalide' }),
  }),

  budget: z.string()
    .optional(),

  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(3000, 'La description ne peut pas dépasser 3000 caractères')
    .trim(),

  fichiersJoints: z.array(fichierJointSchema)
    .max(5, 'Maximum 5 fichiers')
    .optional(),

  recaptchaToken: z.string()
    .min(1, 'Token reCAPTCHA manquant'),
});

export type DetailedQuoteFormData = z.infer<typeof detailedQuoteFormSchema>;
