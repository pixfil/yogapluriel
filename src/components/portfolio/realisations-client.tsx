"use client";

import { useState } from "react";
import AnimatedSection from "@/components/ui/animated-section";
import CTAButton from "@/components/ui/cta-button";
import ProjectCard from "@/components/portfolio/project-card";
import CategoryFilter from "@/components/portfolio/category-filter";
import { Phone } from "lucide-react";
import type { Project, Category } from "@/lib/supabase-queries";

interface RealisationsClientProps {
  projects: Project[];
  categories: Category[];
}

export default function RealisationsClient({ projects, categories }: RealisationsClientProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  
  // Filter projects based on selected categories
  const filteredProjects = projects.filter(project => {
    if (activeCategories.length === 0) return true;
    return project.category.some(cat => activeCategories.includes(cat));
  });

  // Sort projects: featured first, then by date (newest first)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return parseInt(b.date) - parseInt(a.date);
  });

  const handleFilterChange = (categoryIds: string[]) => {
    // Convert category IDs to slugs for compatibility
    const categorySlugs = categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category?.slug || id;
    });
    setActiveCategories(categorySlugs);
  };

  const totalProjects = projects.length;

  return (
    <>
      {/* Stats Section */}
      <section className="bg-gradient-to-br from-slate-100 to-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow mb-2">500+</div>
                <div className="text-gray-700">Projets réalisés</div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow mb-2">15</div>
                <div className="text-gray-700">Ans d'expérience</div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow mb-2">100%</div>
                <div className="text-gray-700">Clients satisfaits</div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow mb-2">{totalProjects}</div>
                <div className="text-gray-700">Réalisations en ligne</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <CategoryFilter 
            onFilterChange={handleFilterChange}
            activeCategories={activeCategories}
            categories={categories}
          />
          
          {/* Results Summary */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-gray-600">
                {sortedProjects.length === totalProjects 
                  ? `${totalProjects} réalisation${totalProjects > 1 ? 's' : ''} au total`
                  : `${sortedProjects.length} réalisation${sortedProjects.length > 1 ? 's' : ''} trouvée${sortedProjects.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </AnimatedSection>
          
          {/* Projects Grid */}
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProjects.map((project, index) => (
                <AnimatedSection key={project.id} delay={0.1 * index}>
                  <ProjectCard project={project} index={index} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <AnimatedSection>
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucune réalisation trouvée
                </h3>
                <p className="text-gray-500 mb-6">
                  Essayez de modifier vos filtres ou consultez toutes nos réalisations.
                </p>
                <button
                  onClick={() => setActiveCategories([])}
                  className="px-6 py-3 bg-yellow text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  Afficher toutes les réalisations
                </button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Votre projet sera notre prochaine réalisation
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Rejoignez nos clients satisfaits et confiez-nous votre projet de toiture. 
              Expertise garantie et résultat à la hauteur de vos attentes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton size="lg" glow href="/contact">
                <Phone className="w-5 h-5" />
                Demander un devis
              </CTAButton>
              <CTAButton variant="outline" size="lg" href="/notre-equipe">
                Rencontrer l'équipe
              </CTAButton>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}