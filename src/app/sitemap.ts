import { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/supabase-queries';

/**
 * Génère un sitemap dynamique pour le référencement SEO
 *
 * Ce fichier crée automatiquement un sitemap.xml accessible à /sitemap.xml
 * qui liste toutes les pages publiques du site avec leurs métadonnées :
 * - URL complète
 * - Date de dernière modification
 * - Fréquence de changement estimée
 * - Priorité relative (0.0 à 1.0)
 *
 * Le sitemap est régénéré à chaque build et aide Google à :
 * - Découvrir toutes les pages du site
 * - Comprendre la structure du site
 * - Prioriser l'indexation des pages importantes
 *
 * Référence : AUDIT_DERNIER_KILOMETRE.md Section 5.1
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://formdetoit.fr';

  // Récupérer tous les projets publiés depuis la base de données
  const projects = await getPublishedProjects();

  // Générer les URLs des projets dynamiquement
  const projectUrls: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/nos-realisations/${project.slug}`,
    lastModified: new Date(project.date || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/prestations`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nos-realisations`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/notre-equipe`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/devis`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    },
  ];

  // Combiner toutes les URLs
  return [...staticPages, ...projectUrls];
}
