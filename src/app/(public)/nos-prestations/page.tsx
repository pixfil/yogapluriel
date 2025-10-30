import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import { 
  Home, 
  Shield, 
  Wrench,
  Sun,
  Droplets,
  Zap,
  ArrowRight,
  CheckCircle,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nos Prestations - Formdetoit | Couverture, Isolation, Zinguerie Bas-Rhin",
  description: "Découvrez toutes nos prestations : couverture ardoise, tuiles, zinc, isolation biosourcée, Velux, étanchéité EPDM. Artisan RGE dans le Bas-Rhin.",
};

export default function NosPrestationsPage() {
  const prestations = [
    {
      title: "Ardoise",
      description: "Couverture traditionnelle en ardoise naturelle, durable et élégante pour votre toiture.",
      picto: "/picto-services/imgi_15_picto-ardoise-jaune.png",
      href: "/nos-prestations/ardoise",
      image: "/prestations/a la une/ardoise.webp",
      features: ["Naturelle et durable", "Résistante aux intempéries", "Esthétique authentique"]
    },
    {
      title: "Tuile Plate",
      description: "Tuiles plates traditionnelles, idéales pour l'architecture alsacienne et les toitures à forte pente.",
      picto: "/picto-services/imgi_16_picto-tuile-plate-jaune.png",
      href: "/nos-prestations/tuile-plate", 
      image: "/prestations/a la une/tuile plate.webp",
      features: ["Style traditionnel", "Adaptée aux fortes pentes", "Résistance optimale"]
    },
    {
      title: "Tuile Mécanique",
      description: "Solution moderne et économique pour une couverture performante et esthétique.",
      picto: "/picto-services/imgi_17_picto-tuile-meca-jaune.png",
      href: "/nos-prestations/tuile-mecanique",
      image: "/prestations/a la une/tuile mecanique.webp", 
      features: ["Pose rapide", "Excellent rapport qualité/prix", "Large choix de coloris"]
    },
    {
      title: "Couverture Zinc",
      description: "Couverture moderne en zinc, matériau noble offrant durabilité et modernité.",
      picto: "/picto-services/imgi_18_picto-zinc-jaune.png",
      href: "/nos-prestations/zinc",
      image: "/prestations/a la une/zinc.webp",
      features: ["Longévité exceptionnelle", "Design contemporain", "Recyclable à 100%"]
    },
    {
      title: "Cuivre",
      description: "Le cuivre, matériau d'exception pour une toiture unique qui se patine avec le temps.",
      picto: "/picto-services/imgi_19_picto-cuivre-jaune.png",
      href: "/nos-prestations/cuivre",
      image: "/prestations/a la une/cuivre.webp", 
      features: ["Patine naturelle", "Matériau noble", "Résistance exceptionnelle"]
    },
    {
      title: "Alu Préfa",
      description: "Couverture aluminium préfabriquée, légère et résistante pour toitures modernes.",
      picto: "/picto-services/imgi_5_zinc.png",
      href: "/nos-prestations/alu-prefa",
      image: "/prestations/alu-prefa.jpg",
      features: ["Très léger", "Résistant à la corrosion", "Installation rapide"]
    },
    {
      title: "Isolation",
      description: "Isolation biosourcée certifiée RGE pour améliorer le confort et réduire les dépenses énergétiques.",
      picto: "/picto-services/imgi_6_Capture3.png",
      href: "/nos-prestations/isolation",
      image: "/prestations/a la une/isolation.webp",
      features: ["Matériaux biosourcés", "Eligible aux aides", "Confort thermique"]
    },
    {
      title: "Velux",
      description: "Installation de fenêtres de toit Velux pour apporter lumière naturelle et aération.",
      picto: "/picto-services/imgi_7_Capture2-e1673518533742.png",
      href: "/nos-prestations/velux",
      image: "/prestations/a la une/velux.webp",
      features: ["Plus de lumière", "Aération optimale", "Confort d'utilisation"]
    },
    {
      title: "Zinguerie",
      description: "Étanchéité et évacuation des eaux par des éléments métalliques sur-mesure : gouttières, cheminées, habillages.",
      picto: "/picto-services/imgi_4_gouttière-jaune.png",
      href: "/nos-prestations/zinguerie",
      image: "/prestations/a la une/zinguerie.webp",
      features: ["Solutions sur-mesure", "Qualibat RGE", "Savoir-faire traditionnel"]
    },
    {
      title: "EPDM Étanchéité",
      description: "Étanchéité membrane EPDM pour toits plats, balcons et terrasses, garantie longue durée.",
      picto: "/picto-services/imgi_5_zinc.png",
      href: "/nos-prestations/epdm-etancheite",
      image: "/prestations/a la une/etancheite.webp",
      features: ["Étanchéité parfaite", "Résistance UV", "Garantie 20 ans"]
    }
  ];

  const avantages = [
    "Artisan certifié RGE Qualibat",
    "Devis gratuit sous 48h", 
    "Matériaux de qualité premium",
    "Garantie décennale",
    "Eligible aux aides de l'État",
    "Suivi personnalisé de chantier"
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Nos Prestations"
        subtitle="Toutes nos expertises toiture à votre service"
        backgroundImage="/background/bg-realisations.webp"
      />

      {/* Preambule Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Un métier, plusieurs typologies de chantier
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Choisir le bon matériau pour une toiture est primordial. En construction ou en rénovation, 
                  des bâtiments les plus traditionnels aux constructions contemporaines en passant par les 
                  monuments historiques, nous vous guidons vers les solutions les plus adaptées pour des 
                  toitures à la fois performantes et esthétiques.
                </p>
                <p>
                  Chez <span className="text-yellow font-semibold">Formdetoit</span>, nous répondons à toutes les exigences de notre métier. 
                  L'Alsace est une région riche en types de couvertures. Choisissez un artisan couvreur qui 
                  met en valeur votre toiture, vous conseille et répond à vos besoins. Le toit c'est le 
                  prolongement de vos façades.
                </p>
                <p className="font-semibold text-gray-900">
                  Formdetoit place votre maison à l'abri des intempéries, et ce, pour plusieurs décennies !
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Prestations Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prestations.map((prestation, index) => {
              return (
                <AnimatedSection key={prestation.title} delay={0.1 * index}>
                  <Link href={prestation.href}>
                    <GlassCard hover className="group h-full overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={prestation.image}
                          alt={`${prestation.title} - Formdetoit`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-4 right-4 w-10 h-10 bg-yellow rounded-full flex items-center justify-center">
                          <Image 
                            src={prestation.picto} 
                            alt="" 
                            width={20} 
                            height={20} 
                            className="filter brightness-0"
                          />
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-yellow transition-colors">
                          {prestation.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {prestation.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {prestation.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-yellow font-semibold group-hover:gap-3 transition-all">
                          <span>En savoir plus</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Pourquoi choisir <span className="text-yellow">Formdetoit</span> ?
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Notre expertise reconnue et nos certifications vous garantissent des travaux 
                  de qualité, réalisés dans les règles de l'art et dans le respect de votre budget.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  {avantages.map((avantage, index) => (
                    <AnimatedSection key={index} delay={0.1 * index}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0" />
                        <span className="text-gray-800 font-medium">{avantage}</span>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>

                <div className="mt-8">
                  <CTAButton size="lg" glow href="/contact">
                    <Phone className="w-5 h-5" />
                    Demander un devis
                  </CTAButton>
                </div>
              </div>
              
              <AnimatedSection direction="right">
                <GlassCard className="p-8 text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-yellow mb-2">100%</div>
                    <p className="text-gray-700 font-medium">Suivi local & proximité</p>
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-yellow mb-2">48h</div>
                    <p className="text-gray-700 font-medium">Délai de réponse</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-yellow mb-2">RGE</div>
                    <p className="text-gray-700 font-medium">Certifié Qualibat</p>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Un projet de toiture en vue ?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Parlons-en ensemble ! Nous vous accompagnons de A à Z pour concrétiser 
              votre projet dans les meilleures conditions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton size="lg" glow href="/contact">
                <Phone className="w-5 h-5" />
                Devis gratuit
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