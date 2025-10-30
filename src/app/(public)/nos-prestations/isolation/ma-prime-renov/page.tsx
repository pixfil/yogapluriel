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
  Calculator,
  FileText,
  Euro,
  Shield,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Building2,
  BrickWall,
  Warehouse,
  Square as WindowIcon,
  Sun,
  Wind,
  ClipboardCheck,
  Wrench,
  Search,
  FileCheck,
  Send,
  Hammer,
  CheckSquare,
  Info
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MaPrimeRénov' 2025 - Financez votre Isolation | Formdetoit Bas-Rhin",
  description: "Guide complet MaPrimeRénov' 2025 : barèmes officiels, éligibilité, montants des aides. Jusqu'à 90% de financement pour votre isolation. Formdetoit certifié RGE.",
  keywords: "MaPrimeRénov 2025, aide isolation, financement travaux, barèmes 2025, RGE, CEE, éco-PTZ",
};

export default function MaPrimeRenovPage() {
  // Icon mapping function
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      'home': <Home className="w-5 h-5" />,
      'building2': <Building2 className="w-5 h-5" />,
      'brickwall': <BrickWall className="w-5 h-5" />,
      'warehouse': <Warehouse className="w-5 h-5" />,
      'window': <WindowIcon className="w-5 h-5" />,
      'sun': <Sun className="w-5 h-5" />,
      'wind': <Wind className="w-5 h-5" />,
      'clipboardcheck': <ClipboardCheck className="w-5 h-5" />,
      'search': <Search className="w-5 h-5" />,
      'euro': <Euro className="w-5 h-5" />,
      'filecheck': <FileCheck className="w-5 h-5" />,
      'send': <Send className="w-5 h-5" />,
      'hammer': <Hammer className="w-5 h-5" />,
      'checksquare': <CheckSquare className="w-5 h-5" />
    };
    return icons[iconName] || null;
  };

  const baremes2025 = {
    isolation: [
      {
        type: "Rampants de toiture / Combles",
        techReq: "R ≥ 6",
        bleu: "25€/m²",
        jaune: "20€/m²",
        violet: "15€/m²",
        icon: "home"
      },
      {
        type: "Murs par l'extérieur (ITE)*",
        techReq: "R ≥ 3,7 (max 100m²)",
        bleu: "75€/m²",
        jaune: "60€/m²",
        violet: "40€/m²",
        icon: "building2"
      },
      {
        type: "Murs par l'intérieur (ITI)*",
        techReq: "R ≥ 3,7 (fin 31/12/2025)",
        bleu: "25€/m²",
        jaune: "20€/m²",
        violet: "15€/m²",
        icon: "brickwall"
      },
      {
        type: "Toiture-terrasse",
        techReq: "R ≥ 4,5",
        bleu: "75€/m²",
        jaune: "60€/m²",
        violet: "40€/m²",
        icon: "warehouse"
      }
    ],
    autres: [
      {
        type: "Fenêtres (simple → double vitrage)*",
        techReq: "Uw ≤ 1,3 / Sw ≥ 0,3",
        bleu: "100€/unité",
        jaune: "80€/unité",
        violet: "40€/unité",
        icon: "window"
      },
      {
        type: "Fenêtres de toit (Velux)",
        techReq: "Uw ≤ 1,5 / Sw ≤ 0,36",
        bleu: "100€/unité",
        jaune: "80€/unité",
        violet: "40€/unité",
        icon: "sun"
      },
      {
        type: "VMC double flux*",
        techReq: "Avec geste isolation (maison)",
        bleu: "2 500€",
        jaune: "2 000€",
        violet: "1 500€",
        icon: "wind"
      },
      {
        type: "Audit énergétique*",
        techReq: "Par professionnel certifié",
        bleu: "500€",
        jaune: "400€",
        violet: "300€",
        icon: "clipboardcheck"
      }
    ]
  };

  const plafondsRevenus = {
    idf: [
      { personnes: 1, bleu: "23 768€", jaune: "28 933€", violet: "40 404€" },
      { personnes: 2, bleu: "34 884€", jaune: "42 463€", violet: "59 394€" },
      { personnes: 3, bleu: "41 893€", jaune: "51 000€", violet: "71 060€" },
      { personnes: 4, bleu: "48 914€", jaune: "59 549€", violet: "83 637€" },
      { personnes: 5, bleu: "55 961€", jaune: "68 123€", violet: "95 758€" }
    ],
    province: [
      { personnes: 1, bleu: "17 173€", jaune: "22 015€", violet: "30 844€" },
      { personnes: 2, bleu: "25 115€", jaune: "32 197€", violet: "45 340€" },
      { personnes: 3, bleu: "30 206€", jaune: "38 719€", violet: "54 592€" },
      { personnes: 4, bleu: "35 285€", jaune: "45 234€", violet: "63 844€" },
      { personnes: 5, bleu: "40 388€", jaune: "51 775€", violet: "73 098€" }
    ]
  };

  const processFormdetoit = [
    {
      step: "1",
      title: "Déclaration Qualibat",
      description: "Tous nos chantiers sont déclarés sur la plateforme Qualibat en fin d'année",
      icon: "filecheck"
    },
    {
      step: "2",
      title: "Audit indépendant",
      description: "Contrôle tous les 2 ans par un organisme certificateur agréé",
      icon: "search"
    },
    {
      step: "3",
      title: "Exigences techniques",
      description: "Vérification du respect des normes (R ≥ 6, matériaux certifiés)",
      icon: "checksquare"
    },
    {
      step: "4",
      title: "Contrôle documentaire",
      description: "Validation des qualifications, assurances et garanties décennales",
      icon: "clipboardcheck"
    },
    {
      step: "5",
      title: "Formation continue",
      description: "Nos équipes suivent des formations obligatoires régulières",
      icon: "hammer"
    },
    {
      step: "6",
      title: "Traçabilité complète",
      description: "Documentation avant/après et fiches techniques pour chaque chantier",
      icon: "filecheck"
    }
  ];

  const faq = [
    {
      question: "Qui est éligible à MaPrimeRénov' 2025 ?",
      answer: "Tous les propriétaires (occupants ou bailleurs) dont le logement a plus de 15 ans. Les ménages aux revenus 'bleu', 'jaune' et 'violet' sont éligibles au parcours par geste. Les revenus supérieurs ne peuvent accéder qu'au parcours accompagné (rénovation d'ampleur)."
    },
    {
      question: "Quel est le montant maximum de l'aide ?",
      answer: "Le plafond total de MaPrimeRénov' est de 20 000€ sur 5 ans pour le parcours par geste. Les montants dépendent de votre catégorie de revenus et du type de travaux. L'aide cumulée (MPR + CEE) ne peut dépasser 90% (bleu), 75% (jaune) ou 60% (violet) du coût des travaux."
    },
    {
      question: "Puis-je cumuler MaPrimeRénov' avec d'autres aides ?",
      answer: "Oui ! Vous pouvez cumuler MaPrimeRénov' avec les Certificats d'Économie d'Énergie (CEE), la TVA réduite à 5,5%, et l'Éco-PTZ (prêt à taux zéro). Attention, le total de toutes les aides ne peut dépasser 100% du coût des travaux."
    },
    {
      question: "Pourquoi choisir un artisan RGE comme Formdetoit ?",
      answer: "La certification RGE (Reconnu Garant de l'Environnement) est OBLIGATOIRE pour bénéficier de MaPrimeRénov'. Formdetoit est certifié Qualibat RGE, ce qui vous garantit des travaux conformes aux exigences techniques et l'accès à toutes les aides disponibles."
    },
    {
      question: "Combien de temps prend le versement de l'aide ?",
      answer: "Après validation de vos travaux, le versement de MaPrimeRénov' intervient sous 2 à 3 mois. Les CEE sont généralement versées plus rapidement (1 mois). Formdetoit vous accompagne dans toutes les démarches pour accélérer le processus."
    },
    {
      question: "Attention : Fin de l'ITI au 31 décembre 2025",
      answer: "L'isolation des murs par l'intérieur (ITI) ne sera plus éligible aux primes par geste à partir du 1er janvier 2026. Si vous envisagez ce type d'isolation, déposez votre demande avant fin 2025 !"
    }
  ];

  const cumulAides = [
    {
      aide: "MaPrimeRénov'",
      montant: "25€ à 75€/m²",
      condition: "Travaux par artisan RGE",
      color: "bg-blue-100 text-blue-800"
    },
    {
      aide: "CEE (Certificats Énergie)",
      montant: "10€ à 12€/m²",
      condition: "Selon fournisseur énergie",
      color: "bg-green-100 text-green-800"
    },
    {
      aide: "TVA Réduite",
      montant: "5,5% au lieu de 20%",
      condition: "Sur matériaux et main d'œuvre",
      color: "bg-purple-100 text-purple-800"
    },
    {
      aide: "Éco-PTZ",
      montant: "Jusqu'à 50 000€",
      condition: "Prêt à taux zéro sur 20 ans",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="MaPrimeRénov' 2025"
        subtitle="Financez jusqu'à 90% de votre isolation"
      />

      {/* Breadcrumb */}
      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <span>›</span>
            <Link href="/nos-prestations" className="hover:text-yellow">Nos prestations</Link>
            <span>›</span>
            <Link href="/nos-prestations/isolation" className="hover:text-yellow">Isolation</Link>
            <span>›</span>
            <span className="text-yellow">MaPrimeRénov' 2025</span>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="bg-gradient-to-br from-slate-100 to-gray-50 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-yellow/10 text-yellow px-6 py-2 rounded-full mb-6 font-semibold">
                <Shield className="w-5 h-5" />
                Barèmes officiels 2025 - Version FFB du 30 septembre 2025
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Qu'est-ce que <span className="text-yellow">MaPrimeRénov'</span> ?
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                MaPrimeRénov' est l'aide principale de l'État pour financer vos travaux
                de rénovation énergétique. Accessible à tous les propriétaires, elle permet
                de réduire significativement le coût de votre isolation et d'améliorer le
                confort de votre logement tout en réalisant des économies d'énergie.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow mb-2">90%</div>
                  <div className="text-sm text-gray-600">Taux de financement max<br/>(revenus très modestes)</div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow mb-2">20 000€</div>
                  <div className="text-sm text-gray-600">Plafond d'aide total<br/>sur 5 ans</div>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow mb-2">15 ans</div>
                  <div className="text-sm text-gray-600">Ancienneté minimum<br/>du logement</div>
                </GlassCard>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <CTAButton size="lg" glow href="/calculateur-aides">
                  <Calculator className="w-5 h-5" />
                  Calculer mes aides 2025
                </CTAButton>
                <CTAButton size="lg" variant="outline" href="#baremes">
                  <ChevronDown className="w-5 h-5" />
                  Voir les barèmes
                </CTAButton>
              </div>

              {/* Compact Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-3xl mx-auto mt-10">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <p className="text-xs text-gray-700">
                    <strong>Outil gratuit Formdetoit</strong> • Barèmes officiels 2025 • Résultats indicatifs et non contractuels •
                    Législation susceptible d'évoluer
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Les 2 parcours */}
      <AnimatedSection>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Les <span className="text-yellow">2 Parcours</span> MaPrimeRénov'
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choisissez le parcours adapté à votre projet de rénovation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <AnimatedSection delay={0.1}>
                <GlassCard className="p-8 h-full border-2 border-yellow">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Parcours par geste</h3>
                    <p className="text-gray-600">Travaux ponctuels d'isolation</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-1" />
                      <span>Isolation (combles, murs, toiture)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-1" />
                      <span>Remplacement menuiseries</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-1" />
                      <span>Ventilation VMC double flux</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-1" />
                      <span>Démarches simplifiées</span>
                    </div>
                  </div>

                  <div className="bg-yellow/10 rounded-lg p-4 text-center">
                    <div className="font-semibold mb-1">Éligibilité</div>
                    <div className="text-sm text-gray-700">Revenus bleu, jaune, violet</div>
                  </div>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <GlassCard className="p-8 h-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Parcours accompagné</h3>
                    <p className="text-gray-600">Rénovation d'ampleur (globale)</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                      <span>Logements DPE E, F ou G</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                      <span>Gain minimum 2 classes DPE</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                      <span>Accompagnateur obligatoire</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                      <span>Plafond 30 000€ à 40 000€ HT</span>
                    </div>
                  </div>

                  <div className="bg-slate-100 rounded-lg p-4 text-center">
                    <div className="font-semibold mb-1">Éligibilité</div>
                    <div className="text-sm text-gray-700">Tous revenus (y compris rose)</div>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                <strong>Formdetoit</strong> vous accompagne principalement sur le{" "}
                <span className="text-yellow font-semibold">parcours par geste</span>
                {" "}pour vos travaux d'isolation.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Barèmes détaillés 2025 */}
      <section id="baremes" className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Barèmes <span className="text-yellow">2025</span> - Parcours par geste
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Montants officiels MaPrimeRénov' selon votre catégorie de revenus
              </p>
            </div>

            {/* Explication catégories de revenus */}
            <AnimatedSection delay={0.1}>
              <div className="bg-white border-2 border-yellow/20 rounded-xl p-6 mb-12 max-w-4xl mx-auto">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-3">Comment fonctionne le système de catégories ?</h3>
                    <p className="text-gray-700 mb-4">
                      MaPrimeRénov' classe les ménages en 3 catégories selon votre Revenu Fiscal de Référence (RFR).
                      Les montants des aides varient selon votre catégorie :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="font-bold text-blue-900 mb-1">Bleu - Très modestes</div>
                        <div className="text-sm text-blue-800">Aides maximales (90%)</div>
                        <div className="text-xs text-blue-700 mt-1">Ex: jusqu'à 17 173€ (1 pers, hors IDF)</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="font-bold text-yellow-700 mb-1">Jaune - Modestes</div>
                        <div className="text-sm text-yellow-600">Aides intermédiaires (75%)</div>
                        <div className="text-xs text-yellow-600 mt-1">Ex: jusqu'à 22 015€ (1 pers, hors IDF)</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="font-bold text-purple-900 mb-1">Violet - Intermédiaires</div>
                        <div className="text-sm text-purple-800">Aides réduites (60%)</div>
                        <div className="text-xs text-purple-700 mt-1">Ex: jusqu'à 30 844€ (1 pers, hors IDF)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Isolation */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-yellow" />
                </div>
                <h3 className="text-2xl font-bold">Travaux d'Isolation</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Type de travaux</th>
                      <th className="px-6 py-4 text-left">Exigence technique</th>
                      <th className="px-6 py-4 text-center bg-blue-600">Bleu<br/>(Très modestes)</th>
                      <th className="px-6 py-4 text-center bg-yellow-400">Jaune<br/>(Modestes)</th>
                      <th className="px-6 py-4 text-center bg-purple-600">Violet<br/>(Intermédiaires)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {baremes2025.isolation.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                              {getIcon(item.icon)}
                            </div>
                            {item.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.techReq}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-900 bg-blue-50">{item.bleu}</td>
                        <td className="px-6 py-4 text-center font-bold text-yellow-700 bg-yellow-50">{item.jaune}</td>
                        <td className="px-6 py-4 text-center font-bold text-purple-900 bg-purple-50">{item.violet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Autres travaux */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-yellow" />
                </div>
                <h3 className="text-2xl font-bold">Autres Travaux Éligibles</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Type de travaux</th>
                      <th className="px-6 py-4 text-left">Exigence technique</th>
                      <th className="px-6 py-4 text-center bg-blue-600">Bleu</th>
                      <th className="px-6 py-4 text-center bg-yellow-400">Jaune</th>
                      <th className="px-6 py-4 text-center bg-purple-600">Violet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {baremes2025.autres.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                              {getIcon(item.icon)}
                            </div>
                            {item.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.techReq}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-900 bg-blue-50">{item.bleu}</td>
                        <td className="px-6 py-4 text-center font-bold text-yellow-700 bg-yellow-50">{item.jaune}</td>
                        <td className="px-6 py-4 text-center font-bold text-purple-900 bg-purple-50">{item.violet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note explicative astérisque */}
            <AnimatedSection delay={0.1}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto mb-12">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    <strong>* Service non proposé par Formdetoit</strong> - Ces informations sont données à titre indicatif sur les aides MaPrimeRénov' disponibles.
                    Pour ces travaux spécifiques, nous vous invitons à contacter un professionnel RGE qualifié dans le domaine concerné.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Alerte ITI */}
            <AnimatedSection>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-800 mb-2">Attention : Fin de l'ITI le 31/12/2025</h4>
                    <p className="text-red-700">
                      L'isolation des murs par l'intérieur (ITI) ne sera plus éligible aux primes
                      par geste à partir du <strong>1er janvier 2026</strong>. Si vous envisagez
                      ces travaux, déposez votre demande avant la fin d'année 2025 !
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </AnimatedSection>
        </div>
      </section>

      {/* Plafonds de revenus */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Êtes-vous <span className="text-yellow">Éligible</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Plafonds de revenus 2025 selon votre composition familiale
                <br/><span className="text-sm">(Revenu Fiscal de Référence - RFR)</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Île-de-France */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Île-de-France</h3>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Personnes</th>
                        <th className="px-4 py-3 text-center">Bleu</th>
                        <th className="px-4 py-3 text-center">Jaune</th>
                        <th className="px-4 py-3 text-center">Violet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {plafondsRevenus.idf.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold">{item.personnes}</td>
                          <td className="px-4 py-3 text-center text-blue-900 bg-blue-50 font-semibold">{item.bleu}</td>
                          <td className="px-4 py-3 text-center text-yellow-700 bg-yellow-50 font-semibold">{item.jaune}</td>
                          <td className="px-4 py-3 text-center text-purple-900 bg-purple-50 font-semibold">{item.violet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Autres régions (Bas-Rhin) */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Autres régions (Bas-Rhin)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Personnes</th>
                        <th className="px-4 py-3 text-center">Bleu</th>
                        <th className="px-4 py-3 text-center">Jaune</th>
                        <th className="px-4 py-3 text-center">Violet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {plafondsRevenus.province.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold">{item.personnes}</td>
                          <td className="px-4 py-3 text-center text-blue-900 bg-blue-50 font-semibold">{item.bleu}</td>
                          <td className="px-4 py-3 text-center text-yellow-700 bg-yellow-50 font-semibold">{item.jaune}</td>
                          <td className="px-4 py-3 text-center text-purple-900 bg-purple-50 font-semibold">{item.violet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center">
              <CTAButton size="lg" glow href="/calculateur-aides">
                <Calculator className="w-5 h-5" />
                Calculer mon éligibilité
              </CTAButton>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Cumul des aides */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-yellow/5 to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cumulez les <span className="text-yellow">Aides</span> !
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Optimisez votre financement en combinant plusieurs dispositifs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {cumulAides.map((aide, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <GlassCard className="p-6 h-full text-center">
                    <div className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${aide.color}`}>
                      {aide.aide}
                    </div>
                    <div className="text-2xl font-bold text-yellow mb-2">{aide.montant}</div>
                    <div className="text-sm text-gray-600">{aide.condition}</div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-center">Exemple de financement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">Coût total travaux isolation 80m²</span>
                  <span className="font-bold">4 800€</span>
                </div>
                <div className="flex justify-between items-center text-blue-700">
                  <span>MaPrimeRénov' (bleu - 25€/m²)</span>
                  <span className="font-bold">- 2 000€</span>
                </div>
                <div className="flex justify-between items-center text-green-700">
                  <span>CEE (10€/m²)</span>
                  <span className="font-bold">- 800€</span>
                </div>
                <div className="flex justify-between items-center text-purple-700">
                  <span>TVA réduite 5,5%</span>
                  <span className="font-bold">- 350€</span>
                </div>
                <div className="flex justify-between items-center border-t-2 pt-3 text-lg font-bold text-yellow">
                  <span>Reste à charge</span>
                  <span>1 650€</span>
                </div>
                <div className="text-center text-sm text-gray-600 pt-2">
                  Soit <strong className="text-yellow">65% de prise en charge</strong> pour ce ménage aux revenus très modestes
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Processus Formdetoit */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Le processus de certification <span className="text-yellow">RGE</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprendre les exigences et contrôles de notre certification Qualibat RGE
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {processFormdetoit.map((item, index) => (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <GlassCard className="p-6 text-center h-full">
                    <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <div className="text-yellow scale-150">
                        {getIcon(item.icon)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>

            <div className="mt-16 mb-20 text-center">
              <div className="bg-yellow/10 border-2 border-yellow rounded-xl p-8 max-w-2xl mx-auto">
                <Shield className="w-12 h-12 text-yellow mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Certification RGE Qualibat</h3>
                <p className="text-gray-700 mb-6">
                  Grâce à ces exigences strictes et contrôles réguliers, Formdetoit vous garantit
                  des travaux conformes et l'accès à <strong>toutes les aides MaPrimeRénov'</strong>.
                </p>
                <CTAButton size="lg" glow href="/contact">
                  <Phone className="w-5 h-5" />
                  Demander mon devis gratuit
                </CTAButton>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection>
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions <span className="text-yellow">Fréquentes</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur MaPrimeRénov' 2025
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {faq.map((item, index) => (
                <AnimatedSection key={index} delay={0.05 * index}>
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                      <span className="text-yellow flex-shrink-0">Q.</span>
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-7">{item.answer}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Detailed Disclaimer */}
      <AnimatedSection>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-7 h-7 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Informations importantes sur cet outil de simulation</h3>
                  <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                      <strong>Outil gratuit proposé par Formdetoit :</strong> Ce simulateur et les informations
                      présentées sur cette page sont fournis gratuitement par Formdetoit, artisan certifié RGE Qualibat,
                      pour vous aider à comprendre les aides MaPrimeRénov' 2025.
                    </p>
                    <p>
                      <strong>Barèmes officiels 2025 :</strong> Les montants affichés sont basés sur les barèmes
                      officiels publiés par la Fédération Française du Bâtiment (FFB) le 30 septembre 2025. Ces barèmes
                      proviennent directement du document officiel MaPrimeRénov' version n°2.
                    </p>
                    <p>
                      <strong>Résultats indicatifs et non contractuels :</strong> Les estimations fournies par le
                      calculateur sont indicatives et basées sur les informations que vous avez saisies. Elles ne constituent
                      pas un engagement ferme de notre part ni de l'État. Le montant définitif de vos aides sera déterminé
                      lors du dépôt officiel de votre dossier auprès de l'ANAH (Agence Nationale de l'Habitat).
                    </p>
                    <p>
                      <strong>Législation susceptible d'évoluer :</strong> La réglementation MaPrimeRénov' peut être
                      modifiée à tout moment par l'État. Les conditions d'éligibilité, les montants des aides et les exigences
                      techniques peuvent changer sans préavis. Nous nous efforçons de maintenir ces informations à jour,
                      mais nous ne pouvons garantir leur exactitude à 100%.
                    </p>
                    <p>
                      <strong>Pour une estimation personnalisée :</strong> Contactez Formdetoit pour un{" "}
                      <a href="/contact" className="text-yellow hover:underline font-semibold">audit gratuit</a> et
                      une simulation précise de vos aides. Nous vous accompagnerons dans toutes vos démarches administratives
                      pour maximiser vos subventions et garantir la conformité de vos travaux.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à financer votre <span className="text-yellow">Isolation</span> ?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Profitez des aides MaPrimeRénov' 2025 avec Formdetoit, artisan certifié RGE.
                Calculez vos aides ou demandez un devis gratuit dès maintenant.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton size="lg" glow href="/calculateur-aides">
                  <Calculator className="w-5 h-5" />
                  Simuler mes aides
                </CTAButton>
                <CTAButton size="lg" variant="outline" href="/contact">
                  <Phone className="w-5 h-5" />
                  Demander un devis
                </CTAButton>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Source officielle : Fédération Française du Bâtiment (FFB) -
                  Document MaPrimeRénov' version n°2 du 30 septembre 2025
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
