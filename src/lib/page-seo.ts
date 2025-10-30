import { Metadata } from 'next';
import { getPageSEO } from '@/app/actions/pages';

/**
 * Get page metadata with fallback
 *
 * Usage in page.tsx:
 *
 * export async function generateMetadata(): Promise<Metadata> {
 *   return getPageMetadata('/contact', {
 *     title: 'Contact - FormDeToit',
 *     description: 'Fallback description...'
 *   })
 * }
 */
export async function getPageMetadata(
  path: string,
  fallback: {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  }
): Promise<Metadata> {
  // Try to get SEO from database
  const pageSEO = await getPageSEO(path);

  // Use DB data if available, otherwise fallback
  const title = pageSEO?.title || fallback.title;
  const description = pageSEO?.description || fallback.description;
  const keywords = pageSEO?.keywords || fallback.keywords;
  const ogTitle = pageSEO?.og_title || fallback.ogTitle || title;
  const ogDescription = pageSEO?.og_description || fallback.ogDescription || description;
  const ogImage = pageSEO?.og_image || fallback.ogImage || '/og-default.jpg';
  const canonicalUrl = pageSEO?.canonical_url;
  const robots = pageSEO?.robots || 'index, follow';

  const metadata: Metadata = {
    title,
    description,
    ...(keywords && { keywords }),

    // Open Graph
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: (pageSEO?.og_type as any) || 'website',
      images: [ogImage],
      siteName: 'FormDeToit',
      locale: 'fr_FR',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },

    // Canonical URL
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),

    // Robots
    robots: {
      index: robots.includes('index'),
      follow: robots.includes('follow'),
    },
  };

  // Add structured data if available
  if (pageSEO?.structured_data) {
    metadata.other = {
      'script:ld+json': JSON.stringify(pageSEO.structured_data),
    };
  }

  return metadata;
}

/**
 * Generate basic organization structured data
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: 'FormDeToit',
    image: 'https://formdetoit.fr/logo.png',
    '@id': 'https://formdetoit.fr',
    url: 'https://formdetoit.fr',
    telephone: '+33388756653',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Adresse',
      addressLocality: 'Strasbourg',
      postalCode: '67000',
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.5734,
      longitude: 7.7521,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    sameAs: [
      // Add social media URLs here
    ],
  };
}

/**
 * Generate breadcrumb structured data
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate service structured data
 */
export function getServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name,
    provider: {
      '@type': 'RoofingContractor',
      name: 'FormDeToit',
    },
    areaServed: {
      '@type': 'State',
      name: 'Bas-Rhin',
    },
    description: service.description,
    url: service.url,
    ...(service.image && { image: service.image }),
  };
}

/**
 * Helper to validate SEO completeness
 */
export function validateSEO(page: {
  title?: string | null;
  description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
}): {
  isComplete: boolean;
  warnings: string[];
  score: number;
} {
  const warnings: string[] = [];
  let score = 0;

  // Title checks
  if (!page.title) {
    warnings.push('Titre manquant');
  } else {
    score += 25;
    if (page.title.length < 30 || page.title.length > 60) {
      warnings.push(`Titre ${page.title.length} caractères (recommandé: 30-60)`);
    }
  }

  // Description checks
  if (!page.description) {
    warnings.push('Description manquante');
  } else {
    score += 25;
    if (page.description.length < 120 || page.description.length > 160) {
      warnings.push(`Description ${page.description.length} caractères (recommandé: 120-160)`);
    }
  }

  // Open Graph checks
  if (!page.og_title) {
    warnings.push('OG Title manquant');
  } else {
    score += 25;
  }

  if (!page.og_description) {
    warnings.push('OG Description manquante');
  } else {
    score += 25;
  }

  return {
    isComplete: score === 100,
    warnings,
    score,
  };
}
