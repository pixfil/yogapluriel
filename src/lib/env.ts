/**
 * Validation des variables d'environnement avec Zod
 *
 * Ce fichier valide toutes les variables d'environnement requises au démarrage.
 * Si une variable est manquante ou invalide, l'application crashera au build/démarrage
 * plutôt qu'en production (sécurité fail-fast).
 *
 * Usage:
 * import { env } from '@/lib/env';
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
 */

import { z } from 'zod';

// =============================================
// SCHÉMA DE VALIDATION
// =============================================

// Mode strict en production, tolérant en dev et preview
// VERCEL_ENV peut être: 'production', 'preview', 'development'
const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

const envSchema = z.object({
  // ========== Supabase (REQUIS) ==========
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .url('NEXT_PUBLIC_SUPABASE_URL doit être une URL valide')
    .startsWith('https://', 'NEXT_PUBLIC_SUPABASE_URL doit utiliser HTTPS'),

  // En dev/preview : accepter n'importe quelle clé (JWT ancien format ou nouveau format sb_*)
  // En prod : accepter soit JWT (eyJ...) soit nouveau format Supabase (sb_publishable_*)
  NEXT_PUBLIC_SUPABASE_ANON_KEY: isDev
    ? z.string().min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY requise')
    : z.string()
        .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY invalide (trop courte)')
        .refine(
          (val) => val.startsWith('eyJ') || val.startsWith('sb_publishable_') || val.startsWith('sb_'),
          'NEXT_PUBLIC_SUPABASE_ANON_KEY doit être soit un JWT (eyJ...) soit le nouveau format Supabase (sb_publishable_*)'
        ),

  SUPABASE_SERVICE_ROLE_KEY: isDev
    ? z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY requise')
    : z.string()
        .min(20, 'SUPABASE_SERVICE_ROLE_KEY invalide (trop courte)')
        .refine(
          (val) => val.startsWith('eyJ') || val.startsWith('sb_secret_') || val.startsWith('sb_'),
          'SUPABASE_SERVICE_ROLE_KEY doit être soit un JWT (eyJ...) soit le nouveau format Supabase (sb_secret_* ou sb_*)'
        ),

  // ========== Google Maps (OPTIONNEL - carte contact page) ==========
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(20, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY invalide').optional(),

  // ========== Admin (OPTIONNEL - Legacy) ==========
  ADMIN_EMAIL: z.string()
    .email('ADMIN_EMAIL doit être un email valide')
    .optional(),

  // ========== reCAPTCHA (OPTIONNEL) ==========
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string()
    .min(20, 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY invalide')
    .optional(),

  // ========== Upstash Redis (OPTIONNEL - Rate Limiting) ==========
  UPSTASH_REDIS_REST_URL: z.string()
    .url('UPSTASH_REDIS_REST_URL doit être une URL valide')
    .optional(),

  UPSTASH_REDIS_REST_TOKEN: z.string()
    .min(20, 'UPSTASH_REDIS_REST_TOKEN invalide')
    .optional(),

  // ========== Sentry (OPTIONNEL - Monitoring) ==========
  NEXT_PUBLIC_SENTRY_DSN: z.string()
    .url('NEXT_PUBLIC_SENTRY_DSN doit être une URL valide')
    .optional(),

  SENTRY_AUTH_TOKEN: z.string()
    .min(20, 'SENTRY_AUTH_TOKEN invalide')
    .optional(),

  // ========== AI SDK (OPTIONNEL - Chatbot) ==========
  ANTHROPIC_API_KEY: z.string()
    .min(20, 'ANTHROPIC_API_KEY invalide')
    .optional(),

  MISTRAL_API_KEY: z.string()
    .min(20, 'MISTRAL_API_KEY invalide')
    .optional(),

  OPENAI_API_KEY: z.string()
    .min(20, 'OPENAI_API_KEY invalide')
    .optional(),

  // ========== Node Environment ==========
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development'),
});

// =============================================
// VALIDATION & EXPORT
// =============================================

/**
 * Parse et valide les variables d'environnement
 *
 * En cas d'erreur, affiche un message détaillé et crash l'application
 * (comportement voulu pour éviter un démarrage en production avec config invalide)
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Variables d\'environnement invalides:');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    console.error('\n💡 Vérifiez votre fichier .env.local');
    console.error('💡 Consultez .env.example pour la liste des variables requises\n');

    throw new Error('Variables d\'environnement invalides - Impossible de démarrer l\'application');
  }

  return parsed.data;
}

/**
 * Variables d'environnement validées
 *
 * Utiliser cet export plutôt que process.env pour garantir la présence des variables
 *
 * Note: Pendant le build (NEXT_PHASE === 'phase-production-build'),
 * on retourne des placeholders pour permettre la compilation.
 * La validation stricte se fait au runtime (au démarrage du serveur).
 *
 * @example
 * import { env } from '@/lib/env';
 * const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 */
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

export const env = isBuildTime
  ? // Mode build : placeholders pour permettre la compilation
    {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIza_placeholder_key',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'production',
    } as ReturnType<typeof validateEnv>
  : // Mode runtime : validation stricte
    validateEnv();

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Vérifie si une variable optionnelle est définie
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Récupère une variable avec valeur par défaut
 */
export function getEnvOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return isDefined(value) ? value : defaultValue;
}

/**
 * Vérifie si le rate limiting est configuré
 */
export function isRateLimitingEnabled(): boolean {
  return isDefined(env.UPSTASH_REDIS_REST_URL) && isDefined(env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Vérifie si Sentry est configuré
 */
export function isSentryEnabled(): boolean {
  return isDefined(env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Vérifie si le chatbot AI est configuré
 */
export function isAIChatbotEnabled(): boolean {
  return isDefined(env.ANTHROPIC_API_KEY) || isDefined(env.MISTRAL_API_KEY) || isDefined(env.OPENAI_API_KEY);
}
