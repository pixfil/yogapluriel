/**
 * Système de détection anti-spam intelligent
 *
 * Fonctionnalités:
 * - Détection de langue (anglais marketing)
 * - Filtrage par mots-clés (SEO, marketing, crypto, etc.)
 * - Détection de doublons (même email dans les 24h)
 * - Calcul de score de spam (0-100)
 *
 * @author FormDeToit
 * @date 2025-10-28
 */

import { createClient } from '@/lib/supabase/server';

// ============================================
// CONFIGURATION DES MOTS-CLÉS SPAM
// ============================================

/**
 * Liste des mots-clés spam par catégorie
 * Note: Les mots sont en minuscules pour comparaison insensible à la casse
 */
const SPAM_KEYWORDS = {
  // SEO & Link Building
  seo: [
    'backlinks', 'backlink', 'link building', 'guest post', 'guest posting',
    'outreach', 'serp', 'domain authority', 'da', 'pr', 'page rank',
    'link exchange', 'reciprocal link', 'anchor text', 'dofollow',
    'keyword ranking', 'organic traffic', 'search engine optimization',
    'white label seo', 'seo services', 'link insertion', 'niche edit',
  ],

  // Marketing Automation & Cold Email
  marketing: [
    'cold email', 'cold outreach', 'lead generation', 'b2b leads',
    'email campaign', 'mass email', 'bulk email', 'email blast',
    'drip campaign', 'marketing automation', 'email marketing',
    'sales funnel', 'conversion optimization', 'digital marketing',
    'social media marketing', 'smm services', 'ppc management',
  ],

  // Services Web Génériques (offshore/outsource)
  webServices: [
    'web development', 'web design', 'app development', 'mobile app',
    'software development', 'outsource', 'offshore', 'hire developers',
    'wordpress development', 'shopify expert', 'ecommerce solution',
    'custom software', 'saas development', 'api integration',
  ],

  // Crypto & Finance Suspect
  crypto: [
    'cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'blockchain',
    'forex', 'forex trading', 'trading bot', 'investment opportunity',
    'earn money', 'make money online', 'passive income', 'roi guarantee',
    'nft', 'defi', 'ico', 'token sale',
  ],

  // Spam Générique
  generic: [
    'payday loan', 'casino', 'viagra', 'cialis', 'lottery', 'prize',
    'congratulations', 'you won', 'click here', 'act now', 'limited time',
    '100% free', 'no credit card', 'risk free', 'guaranteed', 'miracle',
  ],

  // Patterns Suspects (phrases complètes)
  patterns: [
    'increase your ranking',
    'improve your seo',
    'rank higher on google',
    'first page of google',
    'want to work with you',
    'business proposal',
    'partnership opportunity',
    'collaboration inquiry',
    'interested in your website',
    'noticed your website',
    'we can help you',
    'we specialize in',
    'our company offers',
  ],
};

/**
 * Mots-clés indiquant un contenu en anglais marketing
 * (Pour détecter les messages en anglais sans bloquer le français)
 */
const ENGLISH_MARKETING_INDICATORS = [
  // Verbes marketing anglais
  'we offer', 'we provide', 'we specialize', 'we can help',
  'let us help', 'contact us', 'reach out', 'get in touch',

  // Noms marketing anglais
  'our company', 'our team', 'our services', 'our agency',
  'your business', 'your website', 'your company',

  // Phrases marketing typiques
  'i am writing to', 'i would like to', 'i am reaching out',
  'i came across', 'i noticed that', 'i found your',
  'hope this email finds you well',
  'i hope you are doing well',
];

// ============================================
// FONCTIONS DE DÉTECTION
// ============================================

/**
 * Normalise le texte pour comparaison
 * - Minuscules
 * - Suppression des accents
 * - Suppression des caractères spéciaux multiples
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ') // Normalise les espaces
    .trim();
}

/**
 * Vérifie si le texte contient des mots-clés spam
 * Retourne: { hasKeywords: boolean, matchedKeywords: string[], category: string }
 */
export function checkSpamKeywords(text: string): {
  hasKeywords: boolean;
  matchedKeywords: string[];
  categories: string[];
} {
  const normalized = normalizeText(text);
  const matchedKeywords: string[] = [];
  const categories: string[] = [];

  // Vérifier chaque catégorie
  for (const [category, keywords] of Object.entries(SPAM_KEYWORDS)) {
    const matches = keywords.filter(keyword =>
      normalized.includes(keyword.toLowerCase())
    );

    if (matches.length > 0) {
      matchedKeywords.push(...matches);
      categories.push(category);
    }
  }

  return {
    hasKeywords: matchedKeywords.length > 0,
    matchedKeywords: [...new Set(matchedKeywords)], // Dédupliquer
    categories: [...new Set(categories)],
  };
}

/**
 * Détecte si le message est en anglais marketing
 * (Approche modérée : ne bloque que les patterns marketing évidents)
 */
export function detectEnglishMarketing(text: string): {
  isEnglishMarketing: boolean;
  confidence: number; // 0-100
  indicators: string[];
} {
  const normalized = normalizeText(text);
  const foundIndicators: string[] = [];

  // Vérifier les indicateurs marketing anglais
  for (const indicator of ENGLISH_MARKETING_INDICATORS) {
    if (normalized.includes(indicator.toLowerCase())) {
      foundIndicators.push(indicator);
    }
  }

  // Calcul de confiance basé sur le nombre d'indicateurs
  const confidence = Math.min(100, foundIndicators.length * 25);

  return {
    isEnglishMarketing: foundIndicators.length >= 2, // Au moins 2 patterns = suspect
    confidence,
    indicators: foundIndicators,
  };
}

/**
 * Vérifie si l'email a déjà soumis un message dans les 24h
 * (Sur n'importe quelle table de messages)
 */
export async function checkDuplicateSubmission(
  email: string,
  excludeId?: string
): Promise<{
  isDuplicate: boolean;
  lastSubmission?: Date;
  tableName?: string;
}> {
  const supabase = await createClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Vérifier dans contacts
  const { data: contactData } = await supabase
    .from('contacts')
    .select('id, email, created_at')
    .eq('email', email)
    .gte('created_at', twentyFourHoursAgo)
    .is('deleted_at', null)
    .neq('id', excludeId || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (contactData) {
    return {
      isDuplicate: true,
      lastSubmission: new Date(contactData.created_at),
      tableName: 'contacts',
    };
  }

  // Vérifier dans quote_requests
  const { data: quoteData } = await supabase
    .from('quote_requests')
    .select('id, email, created_at')
    .eq('email', email)
    .gte('created_at', twentyFourHoursAgo)
    .is('deleted_at', null)
    .neq('id', excludeId || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (quoteData) {
    return {
      isDuplicate: true,
      lastSubmission: new Date(quoteData.created_at),
      tableName: 'quote_requests',
    };
  }

  // Vérifier dans detailed_quotes
  const { data: detailedData } = await supabase
    .from('detailed_quotes')
    .select('id, email, created_at')
    .eq('email', email)
    .gte('created_at', twentyFourHoursAgo)
    .is('deleted_at', null)
    .neq('id', excludeId || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (detailedData) {
    return {
      isDuplicate: true,
      lastSubmission: new Date(detailedData.created_at),
      tableName: 'detailed_quotes',
    };
  }

  return { isDuplicate: false };
}

/**
 * Calcule un score de spam (0-100)
 * Plus le score est élevé, plus le message est suspect
 */
export function calculateSpamScore(data: {
  keywordMatches: number;
  englishMarketingConfidence: number;
  isDuplicate: boolean;
  messageLength: number;
}): number {
  let score = 0;

  // Mots-clés spam détectés (0-40 points)
  score += Math.min(40, data.keywordMatches * 10);

  // Confiance anglais marketing (0-30 points)
  score += Math.round(data.englishMarketingConfidence * 0.3);

  // Duplicate dans les 24h (0-20 points)
  if (data.isDuplicate) {
    score += 20;
  }

  // Message trop court ou trop long (0-10 points)
  if (data.messageLength < 20) {
    score += 5; // Suspect si message très court
  } else if (data.messageLength > 2000) {
    score += 10; // Suspect si message très long (spam détaillé)
  }

  return Math.min(100, score);
}

// ============================================
// FONCTION PRINCIPALE D'ANALYSE
// ============================================

export interface SpamAnalysisResult {
  isSpam: boolean;
  score: number; // 0-100
  reason: string; // Raison lisible
  details: {
    hasKeywords: boolean;
    matchedKeywords: string[];
    keywordCategories: string[];
    isEnglishMarketing: boolean;
    englishIndicators: string[];
    isDuplicate: boolean;
    duplicateTable?: string;
  };
}

/**
 * Analyse complète d'un message pour détecter le spam
 *
 * @param data - Données du formulaire (name, email, message, phone optionnel)
 * @param excludeId - ID du message à exclure (pour édition)
 * @returns Résultat de l'analyse avec flag isSpam, score, et raison
 */
export async function analyzeMessage(data: {
  name?: string;
  email: string;
  message: string;
  phone?: string;
  excludeId?: string;
}): Promise<SpamAnalysisResult> {
  const { email, message, excludeId } = data;

  // Combiner tous les champs texte pour analyse
  const fullText = [data.name, message, data.phone]
    .filter(Boolean)
    .join(' ');

  // 1. Vérifier mots-clés spam
  const keywordCheck = checkSpamKeywords(fullText);

  // 2. Détecter anglais marketing
  const englishCheck = detectEnglishMarketing(fullText);

  // 3. Vérifier doublons
  const duplicateCheck = await checkDuplicateSubmission(email, excludeId);

  // 4. Calculer score
  const score = calculateSpamScore({
    keywordMatches: keywordCheck.matchedKeywords.length,
    englishMarketingConfidence: englishCheck.confidence,
    isDuplicate: duplicateCheck.isDuplicate,
    messageLength: message.length,
  });

  // 5. Déterminer si spam (seuil: score >= 50)
  const isSpam = score >= 50;

  // 6. Construire raison lisible
  const reasons: string[] = [];

  if (keywordCheck.hasKeywords) {
    const categories = keywordCheck.categories.join(', ');
    reasons.push(`Mots-clés suspects (${categories})`);
  }

  if (englishCheck.isEnglishMarketing) {
    reasons.push('Contenu marketing en anglais');
  }

  if (duplicateCheck.isDuplicate) {
    reasons.push(`Email déjà soumis dans les 24h (${duplicateCheck.tableName})`);
  }

  const reason = reasons.length > 0
    ? reasons.join(' + ')
    : 'Score de spam élevé';

  return {
    isSpam,
    score,
    reason,
    details: {
      hasKeywords: keywordCheck.hasKeywords,
      matchedKeywords: keywordCheck.matchedKeywords,
      keywordCategories: keywordCheck.categories,
      isEnglishMarketing: englishCheck.isEnglishMarketing,
      englishIndicators: englishCheck.indicators,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateTable: duplicateCheck.tableName,
    },
  };
}

/**
 * Fonction utilitaire pour vérifier si le spam filter est activé
 * Lit depuis les settings de sécurité dans la base de données
 * Désactivable via toggle admin dans Paramètres > Sécurité
 * Fallback: Activé par défaut (true)
 */
export async function isSpamFilterEnabled(): Promise<boolean> {
  try {
    // Import dynamique pour éviter circular dependency
    const { getSecuritySettings } = await import('@/app/actions/settings');
    const settings = await getSecuritySettings();
    return settings.spam_filter_enabled ?? true; // Activé par défaut
  } catch (error) {
    console.error('[SPAM FILTER] Erreur lecture settings, désactivation temporaire:', error);
    return false; // En cas d'erreur, désactiver pour ne pas bloquer les soumissions
  }
}
