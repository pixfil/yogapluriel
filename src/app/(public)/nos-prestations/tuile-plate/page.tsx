import { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import DevisForm from "@/components/ui/devis-form";
import { Home, CheckCircle, Phone, ArrowLeft, Clock, Euro, Shield, Target, Wrench, Handshake } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tuile Plate - Formdetoit | Couverture Traditionnelle Alsacienne Bas-Rhin",
  description: "Spécialiste tuile plate en Alsace. Couverture traditionnelle pour toitures à forte pente. Pose, réparation, rénovation. Devis gratuit sous 24h.",
};

export default function TuilePlatePage() {
  const avantages = [
    "Signature incontestable tradition alsacienne",
    "Terre cuite respectueuse de l'environnement", 
    "Ventilation naturelle sans compromettre l'étanchéité",
    "Trois modèles : 18/38, 16/38, Saint-Thomas",
    "Forme Biberschwanz (queue de castor)",
    "Cannelures pour évacuation eaux de pluie"
  ];

  const modeles = [
    {
      nom: "Tuile 18/38",
      description: "Rouge ou nuancée, format standard",
      usage: "Constructions traditionnelles et contemporaines"
    },
    {
      nom: "Tuile 16/38",
      description: "Rouge ou nuancée, format compact",
      usage: "Toitures résidentielles courantes"
    },
    {
      nom: "Tuile Saint-Thomas",
      description: "Spécifique aux bâtiments historiques",
      usage: "Monuments historiques et restaurations"
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
      {/* Hero Section avec image */}
      <PageHero
        title="Tuile Plate"
        subtitle="Couverture traditionnelle alsacienne"
        backgroundImage="/background/tuile-plate.webp"
      />

      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <span>›</span>
            <Link href="/nos-prestations" className="hover:text-yellow">Nos prestations</Link>
            <span>›</span>
            <span className="text-yellow">Tuile Plate</span>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-slate-100 to-gray-50 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="space-y-6">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow rounded-full mb-6">
                  <Image 
                    src="/picto-services/imgi_16_picto-tuile-plate-jaune.png"
                    alt=""
                    width={32}
                    height={32}
                    className="filter brightness-0"
                  />
                </div>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Signature incontestable de notre tradition régionale alsacienne, la tuile 
                  plate "Biberschwanz" (queue de castor) en terre cuite est un matériau 
                  authentique et naturel. Trois modèles principaux : 18/38 rouge ou nuancée, 
                  16/38 rouge ou nuancée, et Saint-Thomas pour les bâtiments historiques. 
                  Elle combine résistance, étanchéité et ventilation naturelle.
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
                  src="/prestations/a la une/tuile plate.webp"
                  alt="Tuile plate traditionnelle - Formdetoit Alsace"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 glass rounded-xl p-6 max-w-xs">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow mb-1">50+</div>
                    <div className="text-sm text-gray-700">Ans de durabilité</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Avantages de la <span className="text-yellow">Tuile Plate</span>
              </h2>
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

      {/* Models Section */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Les <span className="text-yellow">Modèles</span> Biberschwanz
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trois modèles principaux pour répondre à tous vos projets alsaciens.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {modeles.map((modele, index) => (
                <AnimatedSection key={index} delay={0.2 * index}>
                  <GlassCard className="p-8 text-center h-full">
                    <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-8 h-8 text-yellow" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-yellow">{modele.nom}</h3>
                    <p className="text-gray-700 mb-4">{modele.description}</p>
                    <p className="text-sm text-gray-600 italic">{modele.usage}</p>
                  </GlassCard>
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

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Votre projet en <span className="text-yellow">Tuiles Plates</span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Optez pour l'authenticité alsacienne avec nos tuiles plates traditionnelles. 
                  Nos experts vous conseillent et réalisent votre projet dans les règles de l'art.
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