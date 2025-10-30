import { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import DevisForm from "@/components/ui/devis-form";
import {
  Home,
  CheckCircle,
  Phone,
  ArrowLeft,
  Clock,
  Euro,
  Shield,
  Wrench,
  Target,
  Handshake
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zinguerie - Formdetoit | Étanchéité Gouttières Bas-Rhin",
  description: "Spécialiste zinguerie dans le Bas-Rhin. Gouttières, cheminées, habillages sur-mesure. Artisan Qualibat RGE. Devis gratuit.",
};

export default function ZingueriePage() {
  const avantages = [
    "Étanchéité parfaite garantie",
    "Évacuation optimale des eaux pluviales",
    "Finitions esthétiques sur-mesure",
    "Protection des façades",
    "Artisan Qualibat RGE certifié",
    "Techniques traditionnelles préservées"
  ];

  const services = [
    {
      nom: "Gouttières",
      description: "Installation et remplacement gouttières",
      details: ["Zinc, aluminium, cuivre", "Évacuation eaux pluviales", "Sur-mesure"]
    },
    {
      nom: "Cheminées",
      description: "Habillage et étanchéité cheminées",
      details: ["Solin étanche", "Habillage esthétique", "Raccords parfaits"]
    },
    {
      nom: "Bordures fenêtres",
      description: "Encadrements et protections",
      details: ["Étanchéité renforcée", "Finitions soignées", "Durabilité optimale"]
    },
    {
      nom: "Rives de toit",
      description: "Protection et finition des arêtes",
      details: ["Étanchéité périmètre", "Esthétique préservée", "Résistance vent"]
    }
  ];

  const materiaux = ["Zinc naturel", "Aluminium", "Cuivre"];

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
      {/* Hero Section avec image */}
      <PageHero 
        title="Zinguerie"
        subtitle="L'étanchéité est le résultat d'une zinguerie de qualité"
      />

      {/* Breadcrumb */}
      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <span>›</span>
            <Link href="/nos-prestations" className="hover:text-yellow">Nos prestations</Link>
            <span>›</span>
            <span className="text-yellow">Zinguerie</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="bg-gradient-to-br from-slate-100 to-gray-50 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="space-y-6">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow rounded-full mb-6">
                  <Image 
                    src="/picto-services/imgi_4_gouttière-jaune.png"
                    alt=""
                    width={32}
                    height={32}
                    className="filter brightness-0"
                  />
                </div>
                <p className="text-xl text-gray-700 leading-relaxed">
                  La zinguerie regroupe les éléments métalliques qui assurent 
                  l'étanchéité et l'évacuation des eaux pluviales de votre toiture. 
                  Gouttières, habillages de cheminées, bordures de fenêtres, rives 
                  de toit : nous créons des solutions sur-mesure alliant fonctionnel 
                  et esthétique. Certification Qualibat RGE.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <CTAButton size="lg" glow href="/contact">
                    <Phone className="w-5 h-5" />
                    Devis gratuit
                  </CTAButton>
                  <Link href="/nos-prestations" className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux prestations
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className="relative">
                <Image
                  src="/prestations/a la une/zinguerie.webp"
                  alt="Zinguerie - Formdetoit Bas-Rhin"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 glass rounded-xl p-6 max-w-xs">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow mb-1">✓</div>
                    <div className="text-sm text-gray-700">Qualibat RGE</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Services */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos Services <span className="text-yellow">Zinguerie</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Solutions complètes pour l'étanchéité et l'évacuation des eaux.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <GlassCard className="p-8 h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <Wrench className="w-8 h-8 text-yellow flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-yellow">{service.nom}</h3>
                        <p className="text-gray-700">{service.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {service.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0" />
                          <span className="text-sm text-gray-800">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Materials */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-yellow">Matériaux</span> Disponibles
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choix de matériaux adaptés à votre architecture.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {materiaux.map((materiau, index) => (
                <AnimatedSection key={index} delay={0.2 * index}>
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <Shield className="w-12 h-12 text-yellow mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-3">{materiau}</h3>
                    <p className="text-gray-600 text-sm">
                      {materiau === "Zinc naturel" && "Patine naturelle, résistance optimale"}
                      {materiau === "Aluminium" && "Léger, résistant à la corrosion"}  
                      {materiau === "Cuivre" && "Noble, patine verte unique"}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Advantages */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir notre <span className="text-yellow">Zinguerie</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                L'expertise artisanale pour une protection durable.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {avantages.map((avantage, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="flex items-start gap-3 p-6 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium">{avantage}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Process */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Notre <span className="text-yellow">Démarche d'Accompagnement</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Un processus éprouvé en 4 étapes pour garantir votre satisfaction.
              </p>
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
      </AnimatedSection>

      {/* CTA + Form */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Votre projet de <span className="text-yellow">Zinguerie</span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Confiez vos travaux de zinguerie à nos artisans certifiés. 
                  Solutions neuves, rénovations complètes ou remplacements partiels 
                  d'éléments endommagés. Savoir-faire traditionnel transmis de 
                  génération en génération.
                </p>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-yellow mx-auto mb-2" />
                    <div className="font-semibold">48h</div>
                    <div className="text-sm text-gray-600">Réponse contact</div>
                  </div>
                  <div className="text-center">
                    <Handshake className="w-8 h-8 text-yellow mx-auto mb-2" />
                    <div className="font-semibold">100%</div>
                    <div className="text-sm text-gray-600">Accompagnement & transparence</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-yellow mx-auto mb-2" />
                    <div className="font-semibold">10 ans</div>
                    <div className="text-sm text-gray-600">Garantie décennale</div>
                  </div>
                </div>

                <CTAButton size="lg" glow href="tel:0388756653">
                  <Phone className="w-5 h-5" />
                  03 88 75 66 53
                </CTAButton>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <DevisForm className="max-w-lg" />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}