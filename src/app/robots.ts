import { MetadataRoute } from 'next';

/**
 * Génère un fichier robots.txt pour contrôler l'indexation des moteurs de recherche
 *
 * Ce fichier crée automatiquement un robots.txt accessible à /robots.txt
 * qui indique aux moteurs de recherche (Google, Bing, etc.) :
 * - Quelles pages peuvent être explorées (allow)
 * - Quelles pages doivent être ignorées (disallow)
 * - Où trouver le sitemap XML
 *
 * Configuration actuelle :
 * - ✅ Autoriser l'exploration de toutes les pages publiques
 * - ❌ Bloquer l'exploration des pages admin et API
 * - 📍 Sitemap : /sitemap.xml
 *
 * Référence : AUDIT_DERNIER_KILOMETRE.md Section 5.2
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://formdetoit.fr/sitemap.xml',
  };
}
