/**
 * Rate Limiting avec Upstash Redis
 *
 * Protection contre les attaques par:
 * - Spam de formulaires
 * - Brute force (tentatives répétées)
 * - Abus d'API
 *
 * Configuration Upstash (gratuit jusqu'à 10k requêtes/jour):
 * 1. Créer compte sur https://console.upstash.com
 * 2. Créer une database Redis (région: Europe pour FormDeToit)
 * 3. Copier REST URL et REST TOKEN dans .env.local
 *
 * Usage:
 * import { contactFormLimiter } from '@/lib/rate-limit';
 * const { success } = await contactFormLimiter.limit(ip);
 * if (!success) return error('Trop de tentatives');
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isRateLimitingEnabled, env } from './env';

// =============================================
// CONFIGURATION REDIS
// =============================================

/**
 * Client Redis Upstash
 * Utilise les variables d'environnement validées
 */
function createRedisClient() {
  if (!isRateLimitingEnabled()) {
    console.warn('⚠️ Rate limiting désactivé : UPSTASH_REDIS variables manquantes');
    return null;
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const redis = createRedisClient();

// =============================================
// LIMITERS PAR ENDPOINT
// =============================================

/**
 * Formulaire de contact
 * Limite: 3 soumissions par heure par IP
 *
 * Raison: Formulaire simple, peu de raison de soumettre plus de 3 fois
 */
export const contactFormLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1h"),
      analytics: true,
      prefix: "ratelimit:contact",
    })
  : null;

/**
 * Demande de devis simple
 * Limite: 5 soumissions par heure par IP
 *
 * Raison: Permet plusieurs essais (ex: oubli d'un champ)
 */
export const quoteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1h"),
      analytics: true,
      prefix: "ratelimit:quote",
    })
  : null;

/**
 * Demande de devis détaillé
 * Limite: 2 soumissions par heure par IP
 *
 * Raison: Formulaire complexe, moins de soumissions répétées attendues
 */
export const detailedQuoteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "1h"),
      analytics: true,
      prefix: "ratelimit:detailed_quote",
    })
  : null;

/**
 * Chatbot AI
 * Limite: 20 messages par minute par IP
 *
 * Raison: Permet conversation fluide mais limite abus (coût tokens AI)
 */
export const chatbotLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1m"),
      analytics: true,
      prefix: "ratelimit:chatbot",
    })
  : null;

/**
 * Routes admin (global)
 * Limite: 100 requêtes par minute par IP
 *
 * Raison: Protection contre brute force sur /admin/login
 */
export const adminLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1m"),
      analytics: true,
      prefix: "ratelimit:admin",
    })
  : null;

/**
 * Login admin (spécifique)
 * Limite: 5 tentatives par 15 minutes par IP
 *
 * Raison: Protection contre brute force de mot de passe
 */
export const adminLoginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15m"),
      analytics: true,
      prefix: "ratelimit:admin_login",
    })
  : null;

/**
 * Candidatures emploi
 * Limite: 3 soumissions par heure par IP
 *
 * Raison: Upload de fichiers, formulaire complexe, éviter spam
 */
export const jobApplicationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1h"),
      analytics: true,
      prefix: "ratelimit:job_application",
    })
  : null;

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Récupère l'IP du client depuis la requête
 *
 * Ordre de priorité:
 * 1. request.ip (Vercel)
 * 2. x-forwarded-for (proxy/CDN)
 * 3. x-real-ip (nginx)
 * 4. "unknown" (fallback)
 */
export function getClientIP(request: Request): string {
  // @ts-expect-error - request.ip existe dans l'environnement Vercel
  const ip = request.ip
    || request.headers.get("x-forwarded-for")?.split(',')[0].trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  return ip;
}

/**
 * Applique le rate limiting et retourne le résultat
 *
 * @param limiter - Le limiter à utiliser (contactFormLimiter, quoteLimiter, etc.)
 * @param identifier - L'identifiant (généralement l'IP)
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 *
 * @example
 * const result = await applyRateLimit(contactFormLimiter, ip);
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
) {
  // Si rate limiting désactivé (pas de Redis configuré)
  if (!limiter) {
    console.warn(`⚠️ Rate limiting bypass (Redis non configuré) - IP: ${identifier}`);
    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: -1,
      pending: Promise.resolve(),
    };
  }

  // Appliquer le rate limiting
  const result = await limiter.limit(identifier);

  // Logger les tentatives bloquées
  if (!result.success) {
    console.warn(`🚫 Rate limit exceeded - IP: ${identifier} - Reset in ${Math.ceil((result.reset - Date.now()) / 1000)}s`);
  }

  return result;
}

/**
 * Crée une réponse HTTP 429 (Too Many Requests) standardisée
 *
 * @param reset - Timestamp (ms) de réinitialisation du compteur
 * @param customMessage - Message personnalisé (optionnel)
 */
export function createRateLimitResponse(reset: number, customMessage?: string) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      success: false,
      error: customMessage || "Trop de tentatives. Veuillez réessayer plus tard.",
      retryAfter: retryAfter,
      retryAfterFormatted: `${Math.ceil(retryAfter / 60)} minute${retryAfter > 60 ? 's' : ''}`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    }
  );
}

// =============================================
// CONFIGURATION SUMMARY (pour logs/debug)
// =============================================

export const RATE_LIMIT_CONFIG = {
  enabled: isRateLimitingEnabled(),
  limits: {
    contact: "3 soumissions/heure",
    quote: "5 soumissions/heure",
    detailedQuote: "2 soumissions/heure",
    chatbot: "20 messages/minute",
    admin: "100 requêtes/minute",
    adminLogin: "5 tentatives/15min",
  },
} as const;

// Logger la configuration au démarrage
if (isRateLimitingEnabled()) {
  console.log("✅ Rate limiting activé");
  console.log("📊 Configuration:", RATE_LIMIT_CONFIG.limits);
} else {
  console.warn("⚠️ Rate limiting DÉSACTIVÉ (UPSTASH_REDIS variables manquantes)");
  console.warn("⚠️ Le site est vulnérable aux attaques spam/brute force");
}
