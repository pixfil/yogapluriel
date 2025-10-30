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
  FileText,
  Calculator,
  Building2,
  SquareStack as WindowIcon,
  Info,
  AlertCircle,
  Target,
  Wrench,
  Handshake
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Isolation Biosourcée - Formdetoit | Économies Énergie Bas-Rhin",
  description: "Spécialiste isolation biosourcée RGE dans le Bas-Rhin. Cellulose, fibre de bois, économies 30%. Éligible aux aides. Devis gratuit.",
};

export default function IsolationPage() {
  const avantages = [
    "Matériaux biosourcés 100% écologiques",
    "Certification RGE - Éligible aux aides",
    "Économies d'énergie jusqu'à 30%",
    "Confort thermique été comme hiver",
    "Régulation naturelle de l'humidité",
    "Excellente performance acoustique"
  ];

  const materiaux = [
    {
      nom: "Ouate de Cellulose",
      description: "Isolation de comble perdu en ouate de cellulose soufflée. La ouate de cellulose est un isolant biosourcé issu du recyclage de papier journaux. Issue du recyclage, elle s'adapte à de nombreux cas de pose d'isolation tout en respectant les critères exigeants de performance.",
      avantages: ["Excellent confort d'été", "Très bon régulateur d'humidité intérieure", "Peu sensible au feu", "Bonne performance acoustique"]
    },
    {
      nom: "Laine de Bois",
      description: "La laine de bois est le premier isolant écologique du marché. Sa forte densité associée à une capacité thermique importante fait que la fibre de bois joue un rôle important sur le confort d'été. Elle conviendra donc parfaitement aux maisons à faible inertie de type ossature bois.",
      avantages: ["Déphasage thermique exceptionnel", "Confort d'été optimal", "Idéale pour maisons ossature bois", "Régulation naturelle de l'humidité"]
    },
    {
      nom: "Zéro Laine de Verre",
      description: "Soucieux de l'environnement, nous n'utilisons plus de laine de verre. Ce composant minéral, difficilement recyclable consomme 3 à 8 fois plus d'énergie qu'un isolant biosourcé lors de la fabrication. Il est nocif pour nos équipes de poseurs et pour votre habitat.",
      avantages: ["Engagement écologique", "Protection de nos équipes", "Habitat plus sain", "Énergie grise réduite"],
      isNegative: true
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
        title="Isolation Biosourcée"
        subtitle="Confort et économies durables"
        backgroundImage="/background/bg-isolation.webp"
      />

      {/* Breadcrumb */}
      <div className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <span>›</span>
            <Link href="/nos-prestations" className="hover:text-yellow">Nos prestations</Link>
            <span>›</span>
            <span className="text-yellow">Isolation</span>
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
                    src="/picto-services/imgi_6_Capture3.png"
                    alt=""
                    width={32}
                    height={32}
                    className="filter brightness-0"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  L'isolation, principale source de déperdition énergétique
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  La toiture, c'est la surface la plus exposée aux intempéries de votre
                  habitation. Chaleur élevée en été ou froid glacial en hiver : une toiture
                  mal isolée engendre de fortes dépenses énergétiques.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Isoler correctement ses combles et sa toiture, c'est augmenter leur étanchéité,
                  réduire les entrées d'air été comme hiver et s'assurer de limiter les déperditions
                  de chaleur. En été, l'isolation limite la transmission de chaleur d'une toiture brûlante.
                </p>
                <div className="bg-yellow/10 border-l-4 border-yellow p-4 rounded-r-lg mb-6">
                  <h3 className="font-bold text-lg mb-2">Notre savoir-faire</h3>
                  <p className="text-gray-700 leading-relaxed">
                    C'est en alliant compétences et rigueur que Formdetoit répond à vos besoins :
                    à l'écoute de nos clients, nous vous conseillons de l'étude de votre projet
                    au choix des matériaux. Vous profitez ainsi d'une isolation performante qui
                    correspond à vos attentes et vous économisez jusqu'à 30% sur votre facture d'électricité.
                  </p>
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
                  src="/background/isolation.webp"
                  alt="Isolation biosourcée - Formdetoit Bas-Rhin"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 glass rounded-xl p-6 max-w-xs">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow mb-1">30%</div>
                    <div className="text-sm text-gray-700">D'économies d'énergie</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* MaPrimeRénov' 2025 Section */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-br from-yellow/5 to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow/20 text-yellow-800 px-6 py-2 rounded-full mb-4 font-semibold">
                <Shield className="w-5 h-5" />
                Nouveau - Barèmes 2025
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Financez votre isolation avec <span className="text-yellow">MaPrimeRénov' 2025</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Profitez des aides de l'État pour réduire significativement le coût de vos travaux d'isolation.
                Ces aides sont accessibles uniquement avec un artisan certifié <strong className="text-yellow">RGE (Reconnu Garant de l'Environnement)</strong>.
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Image
                  src="/certifications/rge-garant.webp"
                  alt="Logo RGE - Reconnu Garant de l'Environnement"
                  width={120}
                  height={80}
                  className="object-contain"
                />
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-800">Formdetoit est certifié RGE</p>
                  <p className="text-sm text-gray-600">Condition obligatoire pour l'éligibilité aux aides</p>
                </div>
              </div>
            </div>

            {/* Grid 1/2 - 1/2 : Explication puis Tableau */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Colonne 1/2 : Explication catégories */}
              <AnimatedSection delay={0.1}>
                <div className="bg-white border-2 border-yellow/20 rounded-xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                    <div className="w-full">
                      <h3 className="font-bold text-lg mb-3">Comment fonctionne le système de catégories ?</h3>
                      <p className="text-gray-700 mb-4">
                        MaPrimeRénov' classe les ménages en 3 catégories selon votre Revenu Fiscal de Référence (RFR).
                        Les montants des aides varient selon votre catégorie :
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="font-bold text-blue-900 mb-1">Bleu - Très modestes</div>
                          <div className="text-sm text-blue-800">Aides maximales</div>
                          <div className="text-xs text-blue-700 mt-1">Ex: jusqu'à 17 173€ (1 pers, hors IDF)</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="font-bold text-yellow-900 mb-1">Jaune - Modestes</div>
                          <div className="text-sm text-yellow-800">Aides intermédiaires</div>
                          <div className="text-xs text-yellow-700 mt-1">Ex: jusqu'à 22 015€ (1 pers, hors IDF)</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="font-bold text-purple-900 mb-1">Violet - Intermédiaires</div>
                          <div className="text-sm text-purple-800">Aides réduites</div>
                          <div className="text-xs text-purple-700 mt-1">Ex: jusqu'à 30 844€ (1 pers, hors IDF)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Colonne 1/2 : Tableau Combles & Rampants */}
              <AnimatedSection delay={0.2}>
                <GlassCard className="p-8 text-center h-full border-2 border-yellow/20 hover:border-yellow transition-all">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-yellow" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-4">Combles & Rampants</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm bg-blue-50 rounded-lg px-4 py-2">
                      <span className="text-blue-900 font-semibold">Bleu</span>
                      <span className="font-bold text-blue-900">25€/m²</span>
                    </div>
                    <div className="flex justify-between text-sm bg-yellow-50 rounded-lg px-4 py-2">
                      <span className="text-yellow-900 font-semibold">Jaune</span>
                      <span className="font-bold text-yellow-900">20€/m²</span>
                    </div>
                    <div className="flex justify-between text-sm bg-purple-50 rounded-lg px-4 py-2">
                      <span className="text-purple-900 font-semibold">Violet</span>
                      <span className="font-bold text-purple-900">15€/m²</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">Isolation rampants R≥6</div>
                </GlassCard>
              </AnimatedSection>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <CTAButton size="lg" glow href="/nos-prestations/isolation/ma-prime-renov">
                <FileText className="w-5 h-5" />
                Barèmes complets 2025
              </CTAButton>
              <CTAButton size="lg" variant="outline" href="/calculateur-aides">
                <Calculator className="w-5 h-5" />
                Calculer mes aides
              </CTAButton>
            </div>

            {/* TVA Banner */}
            <AnimatedSection delay={0.4}>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">TVA Réduite à 5,5%</h4>
                    <p className="text-green-800 text-sm">
                      En plus de MaPrimeRénov', bénéficiez automatiquement de la TVA réduite
                      sur vos travaux d'isolation et profitez d'une économie supplémentaire de 14,5%.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Disclaimer */}
            <AnimatedSection delay={0.5}>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 max-w-4xl mx-auto mt-10">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900 mb-2">Outil de simulation gratuit proposé par Formdetoit</p>
                    <p>
                      Les montants affichés sont indicatifs et basés sur les barèmes officiels MaPrimeRénov' 2025.
                      La législation peut évoluer à tout moment. Ces résultats sont non contractuels et fournis
                      à titre de simulation uniquement. Pour une estimation définitive personnalisée et un accompagnement
                      dans vos démarches, <a href="/contact" className="text-yellow hover:underline font-semibold">contactez-nous</a>.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>

      {/* Déphasage Thermique Section */}
      <AnimatedSection>
        <section className="py-24 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Isolation contre la <span className="text-orange-600">Chaleur</span>
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Avec le déphasage thermique, vous isolez complètement votre toiture de la chaleur estivale.
                </p>
              </div>

              <GlassCard className="p-8 bg-white/80">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">Le déphasage thermique</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Nous étudions la capacité de chaque matériau qui compose l'enveloppe de votre maison
                      pour ralentir les transferts de chaleur et diminuer la surchauffe du rayonnement solaire
                      sur votre toiture.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      En été, l'isolation limite la transmission de chaleur d'une toiture brûlante vers l'intérieur
                      de votre habitation. Un bon déphasage thermique peut retarder de plusieurs heures l'entrée
                      de la chaleur, assurant un confort optimal même lors des canicules.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <strong>Bon à savoir :</strong> Les isolants biosourcés comme la ouate de cellulose et la laine
                    de bois offrent un déphasage thermique supérieur aux isolants minéraux traditionnels, garantissant
                    un confort d'été exceptionnel.
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Materials */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos <span className="text-yellow">Matériaux</span> Biosourcés
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez nos solutions d'isolation écologiques et performantes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {materiaux.map((materiau, index) => (
                <AnimatedSection key={index} delay={0.2 * index}>
                  <GlassCard className={`p-8 ${(materiau as any).isNegative ? 'border-2 border-red-200 bg-red-50/50' : ''}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${(materiau as any).isNegative ? 'text-red-600' : 'text-yellow'}`}>
                      {materiau.nom}
                    </h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">{materiau.description}</p>
                    <div className="space-y-3">
                      {materiau.avantages.map((avantage, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${(materiau as any).isNegative ? 'text-red-600' : 'text-yellow'}`} />
                          <span className="text-gray-800">{avantage}</span>
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

      {/* Advantages */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir l'<span className="text-yellow">Isolation Biosourcée</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tous les avantages d'une isolation écologique et performante.
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

      {/* Certification & Subventions */}
      <AnimatedSection>
        <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-8 bg-white border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold">Certification RGE Qualibat</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Formdetoit est qualifiée <strong>QUALIBAT RGE</strong>, label Reconnu Garant de l'Environnement,
                    exclusivement réservé aux artisans et entreprises spécialisés dans le secteur de la
                    transition énergétique.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    En faisant appel à nos services, vous bénéficiez de nombreux avantages fiscaux pour
                    financer vos travaux d'économies d'énergie.
                  </p>
                </GlassCard>

                <GlassCard className="p-8 bg-white border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h3 className="text-2xl font-bold">Conformité RT</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Toutes nos prestations sont conformes à la <strong>réglementation thermique</strong> en vigueur.
                    Nous vous garantissons une installation aux normes, réalisée dans les règles de l'art.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      ✓ Respect des normes RT<br />
                      ✓ Garantie décennale<br />
                      ✓ Assurance responsabilité civile
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Process */}
      <AnimatedSection>
        <section className="py-24 bg-white">
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
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Votre projet d'<span className="text-yellow">Isolation</span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Améliorer l'efficacité thermique de votre habitation avec nos 
                  solutions biosourcées. Bénéficiez de notre certification RGE 
                  pour accéder aux aides financières disponibles.
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