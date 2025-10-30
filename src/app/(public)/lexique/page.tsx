import { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import { BookOpen, Phone, Search } from "lucide-react";
import { getLexiqueGroupedByLetter } from "@/app/actions/lexique";

export const metadata: Metadata = {
  title: "Lexique - Formdetoit | Termes Techniques Couverture Toiture Bas-Rhin",
  description: "Découvrez le vocabulaire technique de la couverture et de la toiture. Lexique complet des termes utilisés par les couvreurs professionnels.",
};

export default async function LexiquePage() {
  // Fetch lexique terms from database (only published, non-deleted ones)
  const lexiqueTerms = await getLexiqueGroupedByLetter(false);

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Lexique"
        subtitle="Termes techniques de la couverture expliqués"
        backgroundImage="/background/bg-lexique.webp"
      />

      {/* Lexique Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-yellow" />
                <span className="text-yellow font-semibold text-sm uppercase tracking-wider">
                  Lexique Technique
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Vocabulaire de la <span className="text-yellow">couverture</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez et comprenez les termes techniques utilisés dans le domaine
                de la couverture et de la charpente.
              </p>
            </div>
          </AnimatedSection>

          {/* Index alphabétique */}
          <AnimatedSection>
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {lexiqueTerms.map((letterGroup) => (
                  <a
                    key={letterGroup.letter}
                    href={`#letter-${letterGroup.letter.toLowerCase()}`}
                    className="w-12 h-12 flex items-center justify-center bg-yellow/10 text-yellow font-bold rounded-lg hover:bg-yellow hover:text-black transition-colors"
                  >
                    {letterGroup.letter}
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Termes par lettre */}
          <div className="space-y-12">
            {lexiqueTerms.map((letterGroup, groupIndex) => (
              <AnimatedSection key={letterGroup.letter} delay={0.05 * groupIndex}>
                <div id={`letter-${letterGroup.letter.toLowerCase()}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-yellow rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-black">{letterGroup.letter}</span>
                    </div>
                    <div className="h-0.5 bg-yellow/20 flex-1"></div>
                  </div>

                  <div className="grid gap-4">
                    {letterGroup.terms.map((termItem) => (
                      <GlassCard key={termItem.id} className="p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold text-yellow mb-2">{termItem.term}</h3>
                        <p className="text-gray-700 leading-relaxed">{termItem.definition}</p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedSection>
            <div className="mt-16 text-center">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Un terme vous échappe ?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Notre équipe d'experts se fera un plaisir de vous expliquer
                  tous les aspects techniques de votre projet de toiture.
                </p>
                <CTAButton size="lg" glow href="/contact">
                  <Phone className="w-5 h-5" />
                  Poser une question
                </CTAButton>
              </GlassCard>
            </div>
          </AnimatedSection>

        </div>
      </section>
    </>
  );
}
