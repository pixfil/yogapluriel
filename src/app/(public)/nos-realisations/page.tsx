import PageHero from "@/components/ui/page-hero";
import RealisationsClient from "@/components/portfolio/realisations-client";
import { getPublishedProjects, getCategories } from "@/lib/supabase-queries";
import type { Metadata } from 'next';

// ISR: Revalider toutes les heures (projets ajoutés/modifiés)
export const revalidate = 3600; // 1 heure

// Métadonnées SEO + OpenGraph
export const metadata: Metadata = {
  title: 'Nos Réalisations - Portfolio Toiture Strasbourg',
  description: 'Découvrez nos réalisations de toiture dans le Bas-Rhin : ardoise, zinc, tuiles, isolation, Velux. Plus de 100 chantiers réussis depuis 2010.',
  openGraph: {
    title: 'Nos Réalisations - FormDeToit | Portfolio Toiture Strasbourg',
    description: 'Découvrez nos réalisations de toiture dans le Bas-Rhin : ardoise, zinc, tuiles, isolation, Velux. Plus de 100 chantiers réussis depuis 2010.',
    images: [{
      url: '/background/realisations.webp',
      width: 1200,
      height: 630,
      alt: 'FormDeToit - Nos réalisations de toiture',
    }],
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FormDeToit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nos Réalisations - FormDeToit | Portfolio Toiture Strasbourg',
    description: 'Découvrez nos réalisations de toiture dans le Bas-Rhin : ardoise, zinc, tuiles, isolation, Velux.',
    images: ['/background/realisations.webp'],
  },
};

export default async function NosRealisationsPage() {
  const [projects, categories] = await Promise.all([
    getPublishedProjects(),
    getCategories()
  ]);

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Nos Réalisations"
        subtitle="Portfolio de nos projets toiture dans le Bas-Rhin"
        backgroundImage="/background/realisations.webp"
      />

      {/* Client-side interactive content */}
      <RealisationsClient 
        projects={projects}
        categories={categories}
      />
    </>
  );
}