/**
 * 🔧 Application Configuration
 *
 * Centralise toute la configuration de l'application.
 * Utilise les variables d'environnement et fournit des valeurs par défaut.
 *
 * USAGE:
 * ```typescript
 * import { appConfig } from '@/config/app.config';
 *
 * console.log(appConfig.site.name); // "Mon Application"
 * ```
 */

import { z } from 'zod';

// =============================================================================
// SCHÉMA DE VALIDATION (Zod)
// =============================================================================

const AppConfigSchema = z.object({
  site: z.object({
    name: z.string().min(1, "Site name is required"),
    url: z.string().url("Site URL must be a valid URL"),
    description: z.string().optional(),
    tagline: z.string().optional(),
  }),

  company: z.object({
    name: z.string().min(1, "Company name is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),

  features: z.object({
    blog: z.boolean().default(false),
    chatbot: z.boolean().default(false),
    newsletter: z.boolean().default(true),
    darkMode: z.boolean().default(true),
    jobs: z.boolean().default(false),
    calculator: z.boolean().default(false),
  }),

  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
    logo: z.string().optional(),
    favicon: z.string().default('/favicon.ico'),
  }),

  social: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),

  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
    googleTagManagerId: z.string().optional(),
    microsoftClarityId: z.string().optional(),
  }).optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// =============================================================================
// CONFIGURATION PAR DÉFAUT
// =============================================================================

const defaultConfig: AppConfig = {
  // Informations du site
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Yoga Pluriel',
    url: process.env.NEXT_PUBLIC_SITE_URL ||
         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    description: 'Association de yoga à Strasbourg Neudorf - Cours, ateliers et formations pour tous niveaux',
    tagline: 'Pratique du yoga accessible à tous - Strasbourg Neudorf',
  },

  // Informations entreprise
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Association Yoga Pluriel',
    email: process.env.RESEND_FROM_EMAIL || 'contact@yogapluriel.com',
    phone: undefined,
    address: '10 rue du Rhin, 67100 Strasbourg',
  },

  // Features activées
  features: {
    blog: true,
    chatbot: false,
    newsletter: true,
    darkMode: true,
    jobs: false,
    calculator: false,
  },

  // Branding
  branding: {
    primaryColor: '#8B5CF6', // Tailwind violet-500 (yoga)
    logo: undefined,
    favicon: '/favicon.ico',
  },

  // Réseaux sociaux (optionnel)
  social: {
    twitter: undefined,
    linkedin: undefined,
    facebook: undefined,
    instagram: undefined,
    github: undefined,
  },

  // Analytics (optionnel)
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID,
    microsoftClarityId: process.env.NEXT_PUBLIC_CLARITY_ID,
  },
};

// =============================================================================
// VALIDATION & EXPORT
// =============================================================================

/**
 * Configuration validée de l'application
 *
 * @throws {z.ZodError} Si la configuration est invalide
 */
export const appConfig = AppConfigSchema.parse(defaultConfig);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Vérifie si une feature est activée
 *
 * @param feature - Nom de la feature
 * @returns true si la feature est activée
 *
 * @example
 * ```typescript
 * if (isFeatureEnabled('blog')) {
 *   // Afficher le blog
 * }
 * ```
 */
export function isFeatureEnabled(
  feature: keyof typeof appConfig.features
): boolean {
  return appConfig.features[feature];
}

/**
 * Retourne l'URL complète d'un chemin
 *
 * @param path - Chemin relatif
 * @returns URL complète
 *
 * @example
 * ```typescript
 * getFullUrl('/about') // → "https://myapp.com/about"
 * ```
 */
export function getFullUrl(path: string): string {
  const baseUrl = appConfig.site.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Retourne les métadonnées SEO par défaut
 *
 * @param overrides - Valeurs à override
 * @returns Métadonnées complètes
 *
 * @example
 * ```typescript
 * export const metadata = getDefaultMetadata({
 *   title: 'À propos',
 *   description: 'Notre histoire...'
 * });
 * ```
 */
export function getDefaultMetadata(overrides?: {
  title?: string;
  description?: string;
  image?: string;
}) {
  const title = overrides?.title
    ? `${overrides.title} | ${appConfig.site.name}`
    : appConfig.site.name;

  const description = overrides?.description || appConfig.site.description;

  const image = overrides?.image
    ? getFullUrl(overrides.image)
    : getFullUrl('/og-image.png');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: appConfig.site.url,
      siteName: appConfig.site.name,
      images: [{ url: image }],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Retourne les couleurs du thème
 *
 * @returns Objet avec les couleurs principales
 */
export function getThemeColors() {
  return {
    primary: appConfig.branding.primaryColor,
    // Ajoutez d'autres couleurs ici si besoin
  };
}

// =============================================================================
// CONSTANTES UTILES
// =============================================================================

/**
 * Nom de l'application (raccourci)
 */
export const APP_NAME = appConfig.site.name;

/**
 * URL de l'application (raccourci)
 */
export const APP_URL = appConfig.site.url;

/**
 * Email de contact (raccourci)
 */
export const CONTACT_EMAIL = appConfig.company.email;

/**
 * Nom de l'entreprise (raccourci)
 */
export const COMPANY_NAME = appConfig.company.name;

// =============================================================================
// CONFIGURATION SERVEUR (NON EXPOSÉE AU CLIENT)
// =============================================================================

/**
 * Configuration côté serveur uniquement
 * ⚠️ NE JAMAIS utiliser dans un composant client
 */
export const serverConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    testMode: process.env.EMAIL_TEST_MODE === 'true',
    testRecipient: process.env.EMAIL_TEST_RECIPIENT,
  },

  security: {
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },

  admin: {
    superAdminEmails: (process.env.SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim())
      .filter(Boolean),
  },
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Feature = keyof typeof appConfig.features;
export type SocialPlatform = keyof NonNullable<typeof appConfig.social>;
