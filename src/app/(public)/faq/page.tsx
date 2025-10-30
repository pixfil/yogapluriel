import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import { HelpCircle, Phone } from "lucide-react";
import { getCategoriesWithQuestions } from "@/app/actions/faq";
import FAQList from "@/components/faq/FAQList";

// Metadata moved to layout.tsx or handled by Pages SEO system

export default async function FAQPage() {
  // Fetch FAQ data from database (only published)
  const faqCategories = await getCategoriesWithQuestions(false);

  // Filter to only show published categories and questions
  // Keep icon as string - the Client Component will map it to the actual icon
  const publishedCategories = faqCategories
    .filter((cat) => cat.published && !cat.deleted_at)
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter((q) => q.published && !q.deleted_at),
    }))
    .filter((cat) => cat.questions.length > 0); // Only show categories with questions

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="FAQ"
        subtitle="Réponses à vos questions fréquentes"
        backgroundImage="/background/bg-faq.webp"
      />

      {/* FAQ Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-yellow" />
                <span className="text-yellow font-semibold text-sm uppercase tracking-wider">
                  Questions Fréquentes
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Toutes les réponses à vos <span className="text-yellow">questions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Retrouvez ici les réponses aux questions les plus fréquemment posées
                sur nos services de couverture et nos méthodes de travail.
              </p>
            </div>
          </AnimatedSection>

          {/* FAQ Categories - Client Component for Interactivity */}
          <FAQList categories={publishedCategories} />

          {/* CTA Section */}
          <AnimatedSection>
            <div className="mt-16 text-center">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Votre question n'est pas dans la liste ?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  N'hésitez pas à nous contacter directement. Notre équipe se fera
                  un plaisir de répondre à toutes vos questions spécifiques.
                </p>
                <CTAButton size="lg" glow href="/contact">
                  <Phone className="w-5 h-5" />
                  Nous contacter
                </CTAButton>
              </GlassCard>
            </div>
          </AnimatedSection>

        </div>
      </section>
    </>
  );
}
