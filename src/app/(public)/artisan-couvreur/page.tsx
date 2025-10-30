import { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import GoogleReviewsCarousel from "@/components/home/google-reviews-carousel";
import {
  Award,
  CheckCircle,
  Phone,
  Target,
  Users,
  Clock,
  Shield,
  Heart,
  Home,
  Wrench
} from "lucide-react";

export const metadata: Metadata = {
  title: "Artisan Couvreur Certifié RGE - Formdetoit | Bas-Rhin Strasbourg",
  description: "Formdetoit, artisan couvreur-zingueur certifié RGE Qualibat depuis 20 ans. Expertise, savoir-faire et accompagnement personnalisé dans le Bas-Rhin.",
  keywords: ["artisan couvreur", "RGE", "Qualibat", "Compagnons du Devoir", "Bas-Rhin", "Strasbourg", "expertise toiture"],
};

export default function ArtisanCouvreurPage() {
  const expertisePoints = [
    {
      icon: Target,
      title: "Nos valeurs",
      description: "Ouverture d'esprit • Recherche d'excellence • Engagement • Transparence"
    },
    {
      icon: Users,
      title: "Formation d'excellence",
      description: "Équipe formée aux Compagnons du Devoir, garantissant un artisanat de haute qualité."
    },
    {
      icon: Shield,
      title: "Certifications RGE Qualibat",
      description: "Reconnu Garant de l'Environnement pour des travaux éligibles aux aides financières."
    },
    {
      icon: Heart,
      title: "Passion du métier",
      description: "Un amour du travail bien fait transmis de génération en génération."
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: "1er échange téléphonique",
      points: [
        "Présentation de votre projet",
        "Identification de vos besoins",
        "Première estimation budgétaire"
      ],
      icon: Phone
    },
    {
      number: "02",
      title: "Visite technique sur place",
      points: [
        "Diagnostic complet de votre toiture",
        "Prise de mesures précises",
        "Conseils personnalisés sur les matériaux"
      ],
      icon: Target
    },
    {
      number: "03",
      title: "Devis et RDV d'explication",
      points: [
        "Présentation détaillée du devis dans nos locaux",
        "Information sur les aides disponibles (MaPrimeRénov', Éco-PTZ, CEE)",
        "Aide au montage des dossiers de financement",
        "Transparence totale sur les coûts et délais"
      ],
      icon: CheckCircle
    },
    {
      number: "04",
      title: "3ème RDV - Conclusion et engagement",
      points: [
        "Signature du contrat",
        "Planification des travaux",
        "Garantie décennale et assurance tous risques",
        "Suivi personnalisé tout au long du projet"
      ],
      icon: Wrench
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Artisan Couvreur"
        subtitle="Expertise, savoir-faire & accompagnement personnalisé"
        backgroundImage="/background/bg-artisan.webp"
      />

      {/* Introduction */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Un Artisanat <span className="text-yellow">d'Excellence</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                <strong>Formdetoit</strong> est bien plus qu'une entreprise de couverture : c'est l'histoire
                d'une <strong>passion transmise</strong>, d'un <strong>savoir-faire préservé</strong> et
                d'un <strong>engagement environnemental</strong> constant.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Fondée par <strong>Maryan LHUILLIER</strong>, artisan formé aux <strong>Compagnons du Devoir</strong>,
                notre entreprise perpétue les traditions de l'artisanat français tout en intégrant les techniques
                modernes et les enjeux écologiques actuels.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Expertise Points */}
      <AnimatedSection>
        <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertisePoints.map((point, index) => {
                const IconComponent = point.icon;
                return (
                  <AnimatedSection key={index} delay={0.1 * index}>
                    <GlassCard hover className="p-6 text-center h-full bg-white">
                      <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-yellow" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                      <p className="text-gray-600 text-sm">{point.description}</p>
                    </GlassCard>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Notre Démarche Qualité */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Notre <span className="text-yellow">Démarche d'Accompagnement</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Un processus éprouvé en 4 étapes pour garantir votre satisfaction.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="p-8 relative overflow-hidden group bg-white hover:bg-yellow border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    {/* Number Badge */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-125 transition-all duration-300">
                      <span className="text-xl font-bold text-yellow">{step.number}</span>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:scale-125 transition-all duration-300">
                        <IconComponent className="w-6 h-6 text-yellow" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-white pt-2 transition-colors duration-300">{step.title}</h3>
                    </div>

                    <ul className="space-y-2 pl-16">
                      {step.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-2 text-gray-700 group-hover:text-white transition-colors duration-300">
                          <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0 mt-1" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zone d'intervention */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <div className="inline-block p-4 bg-yellow/10 rounded-full mb-6">
                <Home className="w-12 h-12 text-yellow" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nous intervenons dans un <span className="text-yellow">rayon de 35 km</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Basés à <strong>Eschau</strong>, nous avons fait le choix d'une zone d'intervention de proximité
                pour garantir une <strong>exécution rapide</strong>, une <strong>réactivité optimale</strong> et
                un <strong>suivi de qualité</strong> sur tous nos chantiers. Cette proximité nous permet d'assurer
                un service personnalisé et d'intervenir rapidement en cas de besoin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 mx-auto mb-2 text-yellow" />
                  <div className="text-lg font-medium">Contact sous 48h</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-yellow" />
                  <div className="text-lg font-medium">Intervention rapide</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-yellow" />
                  <div className="text-lg font-medium">Garantie décennale</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Avis Google */}
      <AnimatedSection>
        <section className="py-12 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ils nous font <span className="text-yellow">confiance</span>
              </h2>
            </div>
            <GoogleReviewsCarousel />
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Final */}
      <AnimatedSection>
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Confiez Votre Projet à un Artisan Passionné
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Plus qu'un prestataire, un partenaire qui vous accompagne de A à Z
              pour la réussite de votre projet de couverture.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton size="lg" glow href="/contact">
                <Phone className="w-5 h-5" />
                03 88 75 66 53
              </CTAButton>
              <CTAButton variant="outline" size="lg" href="/nos-realisations">
                Voir nos réalisations
              </CTAButton>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}