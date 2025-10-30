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
  Target,
  Wrench,
  Handshake
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Membrane EPDM - Formdetoit | Étanchéité Toit Plat Bas-Rhin",
  description: "Spécialiste membrane EPDM RUBBERCOVER dans le Bas-Rhin. Étanchéité totale toits plats. Compatible végétalisation. Devis gratuit.",
};

export default function EpdmEtancheitePage() {
  const avantages = [
    "Étanchéité totale garantie",
    "Membrane monocouche sans jonctions",
    "Compatible végétalisation extensive",
    "Pose rapide et efficace",
    "Faible impact carbone",
    "Résistance UV et intempéries exceptionnelle"
  ];

  const applications = [
    {
      nom: "Garages",
      description: "Étanchéité parfaite pour toitures de garage",
      icon: Home
    },
    {
      nom: "Extensions",
      description: "Protection optimale des extensions de maison", 
      icon: Home
    },
    {
      nom: "Vérandas",
      description: "Solution idéale pour toitures de vérandas",
      icon: Home
    },
    {
      nom: "Auvents",
      description: "Étanchéité durable pour tous types d'auvents",
      icon: Home
    },
    {
      nom: "Abris de jardin",
      description: "Protection longue durée des abris extérieurs",
      icon: Home
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
        title="Membrane EPDM"
        subtitle="Étanchéité totale pour toits plats"
      />

      {/* Breadcrumb */}
      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <span>›</span>
            <Link href="/nos-prestations" className="hover:text-yellow">Nos prestations</Link>
            <span>›</span>
            <span className="text-yellow">EPDM Étanchéité</span>
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
                    src="/picto-services/imgi_5_zinc.png"
                    alt=""
                    width={32}
                    height={32}
                    className="filter brightness-0"
                  />
                </div>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  EPDM RUBBERCOVER est une membrane synthétique monocouche en caoutchouc
                  vulcanisé Éthylène-Propylène-Diène. Elle permet l'étanchéité totale
                  d'une toiture plate. Principalement pour zones non circulables, elle
                  peut supporter dalles sur plots et caillebotis, compatible avec
                  végétalisation extensive et systèmes photovoltaïques.
                </p>

                <div className="space-y-2 text-gray-700 mb-6">
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                    <span><strong>Bilan carbone supérieur :</strong> L'EPDM possède un impact environnemental meilleur que les membranes bitumineuses.</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                    <span><strong>Grands formats disponibles :</strong> Disponible en très grands formats (jusqu'à 15m), l'EPDM permet de couvrir la plupart des toitures sans jonctions, éliminant tout risque de fuite.</span>
                  </p>
                </div>

                {/* Logo Firestone Certification */}
                <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-yellow/20">
                  <Image
                    src="/certifications/Logo-firestone-mon-toit-terrasse.webp"
                    alt="Certification Firestone"
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                  <div className="text-sm text-gray-700">
                    <strong className="block mb-1">Applicateur certifié Firestone</strong>
                    <span>Formation officielle et expertise reconnue</span>
                  </div>
                </div>

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
                  src="/prestations/a la une/etancheite.webp"
                  alt="Membrane EPDM - Formdetoit Bas-Rhin"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 glass rounded-xl p-6 max-w-xs">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow mb-1">100%</div>
                    <div className="text-sm text-gray-700">Étanche</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Applications */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Applications <span className="text-yellow">EPDM</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez toutes les utilisations possibles de la membrane EPDM.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {applications.map((app, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <GlassCard className="p-6 text-center h-full">
                    <app.icon className="w-12 h-12 text-yellow mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-3 text-yellow">{app.nom}</h3>
                    <p className="text-sm text-gray-700">{app.description}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Advantages */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir l'<span className="text-yellow">EPDM</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tous les avantages de la membrane RUBBERCOVER.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {avantages.map((avantage, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <div className="flex items-start gap-3 p-6 bg-white rounded-lg shadow-sm">
                    <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium">{avantage}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Technical Info */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-yellow">RUBBERCOVER</span> Firestone
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Formdetoit est formé par Firestone, entreprise spécialisée dans 
                  les membranes d'étanchéité. La membrane EPDM RUBBERCOVER offre 
                  un gage de sérénité et de fiabilité avec un processus de 
                  fabrication à faible impact carbone.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <Shield className="w-8 h-8 text-yellow mx-auto mb-3" />
                    <div className="font-semibold mb-1">Sans jonctions</div>
                    <div className="text-sm text-gray-600">Membrane monocouche</div>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-yellow mx-auto mb-3" />
                    <div className="font-semibold mb-1">Firestone</div>
                    <div className="text-sm text-gray-600">Formation certifiée</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow/10 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Compatibilités</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-yellow" />
                      <span className="text-sm">Végétalisation extensive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-yellow" />
                      <span className="text-sm">Systèmes photovoltaïques</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-yellow" />
                      <span className="text-sm">Dalles sur plots</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-yellow" />
                      <span className="text-sm">Caillebotis</span>
                    </div>
                  </div>
                </div>
              </div>
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
                  Votre projet en <span className="text-yellow">EPDM</span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Confiez l'étanchéité de vos toits plats à nos experts formés 
                  Firestone. Membrane EPDM RUBBERCOVER pour une protection 
                  durable et fiable de vos constructions.
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