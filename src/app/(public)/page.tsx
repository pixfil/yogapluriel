import HeroSection from "@/components/home/hero-section";
import ExpertiseSection from "@/components/home/expertise-section";
import GoogleReviewsCarousel from "@/components/home/google-reviews-carousel";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import ProjectCarousel from "@/components/ui/project-carousel";
import Link from "next/link";
import { getFeaturedProjects } from "@/lib/supabase-queries";
import Image from "next/image";
import {
  Home,
  Shield,
  CheckCircle,
  Star,
  Phone,
  Zap,
  ArrowRight,
  Award,
  Clock,
  Wrench,
  Headphones,
  Play
} from "lucide-react";

// =============================================
// ISR CACHING CONFIGURATION
// =============================================
// Revalider la homepage toutes les 30 minutes
// Impact : TTFB 500-2000ms → <50ms (40x plus rapide)
// Référence : AUDIT_DERNIER_KILOMETRE.md Section 3.2
export const revalidate = 1800; // 30 minutes

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects(6);
  const services = [
    {
      picto: "/picto-services/imgi_15_picto-ardoise-jaune.png",
      title: "L'ardoise",
      description: "Présente en Alsace, elle offre une tenue dans le temps accrue et un aspect esthétique fortement apprécié.",
      href: "/nos-prestations/ardoise"
    },
    {
      picto: "/picto-services/imgi_16_picto-tuile-plate-jaune.png",
      title: "La tuile plate traditionnelle \"biberschwanz\"",
      description: "L'Alsace est une région de tradition et la tuile biberschwanz ou tuile plate écaille, fait partie du patrimoine.",
      href: "/nos-prestations/tuile-plate"
    },
    {
      picto: "/picto-services/imgi_17_picto-tuile-meca-jaune.png",
      title: "La tuile mécanique",
      description: "Très répandue, la tuile mécanique se pose sur tous types de construction.",
      href: "/nos-prestations/tuile-mecanique"
    },
    {
      picto: "/picto-services/imgi_18_picto-zinc-jaune.png",
      title: "Le zinc",
      description: "Les couvertures métalliques, dont celles en zinc, matériau technique et 100 % recyclable se sont développées avec l'architecture contemporaine. La pose d'une toiture en zinc offre un rendu esthétique.",
      href: "/nos-prestations/zinc"
    },
    {
      picto: "/picto-services/imgi_5_zinc.png",
      title: "L'Alu Prefa",
      description: "Résistant aux intempéries, doté d'une longue durée de vie et 100 % recyclable, il s'adapte parfaitement aux toitures modernes et aux projets architecturaux exigeants.",
      href: "/nos-prestations/alu-prefa"
    },
    {
      picto: "/picto-services/imgi_19_picto-cuivre-jaune.png",
      title: "Le cuivre",
      description: "Le cuivre, matériau noble et 100 % recyclable offre une très belle patine naturelle à votre toiture, quasiment éternelle dans le temps.",
      href: "/nos-prestations/cuivre"
    },
    {
      picto: "/picto-services/imgi_4_gouttière-jaune.png",
      title: "Zinguerie",
      description: "Du chantier de rénovation au chantier neuf, nous vous conseillons pour répondre à vos besoins et nous mettons en œuvre, dans les règles de l'art, votre projet de zinguerie.",
      href: "/nos-prestations/zinguerie"
    },
    {
      picto: "/picto-services/imgi_6_Capture3.png",
      title: "L'isolation",
      description: "Formdetoit vous propose une large gamme de matériaux isolants et vous conseille sur la solution qui correspond à vos besoins, selon la règlementation thermique RGE en cours.",
      href: "/nos-prestations/isolation"
    },
    {
      picto: "/picto-services/imgi_7_Capture2-e1673518533742.png",
      title: "Velux",
      description: "Les fenêtres de toit Velux®, pour un intérieur lumineux. Nous disposons de fenêtres de toutes tailles qui répondent à chacun de vos besoins et vous proposons une gamme d'accessoires complète et variée.",
      href: "/nos-prestations/velux"
    },
    {
      picto: "/picto-services/imgi_5_zinc.png",
      title: "Le toit plat",
      description: "Formdetoit vous propose différentes solutions d'étanchéités pour vos toits plats.",
      href: "/nos-prestations/toit-plat"
    }
  ];

  return (
    <div className="-mt-24">
      {/* Hero Section - New Design */}
      <HeroSection />

      {/* About / Expertise Section */}
      <AnimatedSection>
        <section className="py-12 md:py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8  relative">
            {/* Vertical FORMDETOIT Text - Desktop only */}
            <div className="hidden lg:block absolute -left-32 top-1/2 transform -translate-y-1/2 -rotate-90 z-10">
              <span
                className="text-8xl font-bold uppercase tracking-wider text-transparent"
                style={{
                  fontFamily: 'var(--font-outfit)',
                  WebkitTextStroke: '2px #D1D5DB'
                } as React.CSSProperties}
              >
                FORMDETOIT
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center lg:pl-12">
              {/* Image Column */}
              <div className="relative flex justify-center xl:justify-end">
                <div className="relative overflow-visible px-4">
                  <Image
                    src="/imgi_103_1-1-768x768-1.webp"
                    alt="Expertise toiture Formdetoit"
                    width={450}
                    height={450}
                    priority
                    className="w-full max-w-sm md:max-w-md h-auto object-cover rounded-2xl"
                  />
                  {/* Overlay Badge - Débordant sur le côté */}
                  <div className="absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 bg-yellow p-3 md:p-4 rounded-xl shadow-2xl flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow" />
                    </div>
                    <div className="text-white">
                      <div className="text-xl md:text-2xl font-bold">99%</div>
                      <div className="text-xs font-medium whitespace-nowrap">Clients satisfaits</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="space-y-6 md:space-y-8">
                {/* Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-yellow text-sm font-semibold uppercase tracking-wider">
                    À Propos
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900" style={{fontFamily: 'var(--font-outfit)'}}>
                  Une expertise <span className="text-yellow">complète</span>
                </h2>

                {/* Description */}
                <p className="text-[15px] md:text-lg text-gray-600 leading-relaxed">
                  L'équipe Formdetoit vous accompagne dans la conception et la réalisation 
                  de vos projets de toiture. Que ce soit pour répondre à un besoin de 
                  rénovation toiture, pour installer d'un Velux, pour parfaire votre isolation ou 
                  tout simplement pour entretenir votre toiture, notre équipe s'occupe de tout.
                </p>

                {/* Features - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-yellow" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Un savoir-faire artisanal</h3>
                      <p className="text-gray-600">
                        Formée chez les Compagnons du Devoir, notre équipe soigne votre 
                        toiture et met votre maison à l'abri des intempéries, et ce, pour 
                        plusieurs décennies !
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-yellow" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Interventions ponctuelles</h3>
                      <p className="text-gray-600">
                        Un gros coup de vent et quelques-unes de vos tuiles se sont envolées ? 
                        Nous intervenons sur toute l'Eurométropole, pour réparer les dégâts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <CTAButton size="lg" href="/notre-equipe">
                    Découvrir l'équipe
                  </CTAButton>
                  <a href="tel:0388756653" className="flex items-center gap-3 text-gray-600 hover:text-yellow transition-colors">
                    <div className="w-10 h-10 bg-yellow rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Appelez-nous</div>
                      <div className="font-semibold">03 88 75 66 63</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Services Section with Parallax Background */}
      <AnimatedSection>
        <div className="relative">
          {/* Parallax Background Section */}
          <section
            className="relative h-[600px] flex items-center justify-center"
            style={{
              backgroundImage: "url('/background/bg-nos-prestations-2.webp')",
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />
            
            {/* Content */}
            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6" 
                style={{fontFamily: 'var(--font-outfit)'}}
              >
                Nos <span className="text-yellow">Prestations</span>
              </h2>
              <p 
                className="text-xl md:text-2xl text-white/90 leading-relaxed"
              >
                De la couverture traditionnelle aux solutions modernes, 
                nous maîtrisons tous les aspects de la toiture.
              </p>
            </div>
          </section>
          
          {/* Overlapping Service Cards */}
          <div className="relative -mt-32 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service, index) => {
                  return (
                    <AnimatedSection key={service.title} delay={0.1 * index}>
                      <Link href={service.href} className="block h-full">
                        <div className="relative group h-full">
                          <div className="p-6 h-full shadow-2xl bg-white rounded-lg border border-gray-100 transition-all duration-300 flex flex-col group-hover:shadow-3xl group-hover:-translate-y-1">
                            {/* Yellow bottom border on hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-lg"></div>
                            
                            <div className="text-center flex-1 flex flex-col">
                              <div className="flex items-center justify-center mx-auto mb-4">
                                <Image
                                  src={service.picto}
                                  alt={`Picto ${service.title}`}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-contain"
                                />
                              </div>
                              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                              <p className="text-muted-foreground flex-1 mb-4">{service.description}</p>
                              
                              {/* Hover CTA */}
                              <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center justify-center gap-2 text-yellow font-semibold">
                                  <span>Découvrir</span>
                                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Spacer */}
      <div className="py-8 md:py-16"></div>

      {/* Why Choose Us - New Design with Background */}
      <AnimatedSection>
        <section
          className="py-12 md:py-24 relative"
          style={{
            backgroundImage: "url('/background/bg-nos-prestations.webp')",
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Main Grid - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto">
              
              {/* Left Column - Text Content */}
              <div className="text-white">
                <div className="flex items-center gap-2 text-yellow text-sm font-semibold uppercase tracking-wider mb-6">
                  <Star className="w-4 h-4" />
                  <span>Pourquoi nous choisir</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{fontFamily: 'var(--font-outfit)'}}>
                  Pourquoi devriez-vous nous choisir
                </h2>
                <p className="text-xl text-white/90 leading-relaxed mb-8">
                  Forte de plus de 15 années d'expérience et formée aux techniques traditionnelles des Compagnons du Devoir, 
                  l'équipe Formdetoit vous garantit un savoir-faire artisanal d'exception pour tous vos projets de couverture.
                </p>
                <CTAButton 
                  size="lg" 
                  glow 
                  href="/notre-equipe"
                  className="bg-yellow hover:bg-yellow/90 text-black font-semibold"
                >
                  En savoir plus
                </CTAButton>
              </div>

              {/* Right Column - Cards Grid 2x2 with Central Badge */}
              <div className="relative">
                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Card 1 - Top Left */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-2xl">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Service rapide et fiable</h3>
                    <p className="text-gray-600 text-[14px] md:text-sm leading-relaxed">
                      Intervention rapide et devis sous 24h. Nous respectons nos engagements.
                    </p>
                  </div>

                  {/* Card 2 - Top Right */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-2xl">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Entièrement licencié et assuré</h3>
                    <p className="text-gray-600 text-[14px] md:text-sm leading-relaxed">
                      Certifications RGE et Qualibat. Assurance décennale complète.
                    </p>
                  </div>

                  {/* Card 3 - Bottom Left */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-2xl">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wrench className="w-6 h-6 text-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Matériaux de qualité supérieure</h3>
                    <p className="text-gray-600 text-[14px] md:text-sm leading-relaxed">
                      Matériaux bio-sourcés et durables pour une longévité optimale.
                    </p>
                  </div>

                  {/* Card 4 - Bottom Right */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-2xl">
                    <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Headphones className="w-6 h-6 text-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Support premium 24/7</h3>
                    <p className="text-gray-600 text-[14px] md:text-sm leading-relaxed">
                      Suivi personnalisé et disponibilité pour toutes vos questions.
                    </p>
                  </div>
                </div>

                {/* Central Award Badge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-yellow text-black rounded-xl p-4 text-center shadow-2xl min-w-[140px]">
                    <Award className="w-10 h-10 mx-auto mb-2" />
                    <h3 className="text-sm font-bold mb-1">Artisan récompensé</h3>
                    <p className="text-xs">Compagnons du Devoir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Latest Projects Section */}
      <AnimatedSection>
        <section className="py-12 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 text-yellow text-sm font-semibold uppercase tracking-wider mb-4">
                  <Star className="w-4 h-4" />
                  <span>Projets</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900" style={{fontFamily: 'var(--font-outfit)'}}>
                  Nos dernières réalisations
                </h2>
                <p className="text-[15px] md:text-lg text-gray-600 mt-4 max-w-2xl">
                  Découvrez quelques-uns de nos projets récents qui témoignent de notre expertise et de notre savoir-faire artisanal.
                </p>
              </div>
              <CTAButton
                size="lg"
                href="/nos-realisations"
                className="bg-yellow hover:bg-yellow/90 text-black font-semibold hidden md:flex"
              >
                Tout voir
              </CTAButton>
            </div>

            {/* Mobile: Carousel swipeable */}
            <div className="md:hidden">
              <ProjectCarousel projects={featuredProjects} />
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProjects.map((project, index) => (
                <AnimatedSection key={project.id} delay={0.1 * index}>
                  <Link href={`/nos-realisations/${project.slug}`} className="group cursor-pointer block">
                    <div className="relative overflow-hidden rounded-2xl mb-4">
                      {project.mainImage ? (
                        <Image
                          src={project.mainImage}
                          alt={project.title}
                          width={400}
                          height={300}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Pas d'image</span>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <ArrowRight className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm font-semibold">Voir le projet</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-[14px] md:text-sm text-gray-600 mt-2">
                      {project.location} • {project.date}
                    </p>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            {/* Fallback if no featured projects */}
            {featuredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">Aucun projet mis en avant pour le moment.</p>
                <CTAButton 
                  size="lg" 
                  href="/nos-realisations"
                  className="bg-yellow hover:bg-yellow/90 text-black font-semibold"
                >
                  Voir toutes nos réalisations
                </CTAButton>
              </div>
            )}

            {/* Mobile CTA */}
            <div className="text-center mt-12 md:hidden">
              <CTAButton
                size="lg"
                href="/nos-realisations"
                className="bg-yellow hover:bg-yellow/90 text-black font-semibold"
              >
                Tout voir
              </CTAButton>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Google Reviews Carousel */}
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

      {/* Académie de la Hauteur Banner */}
      <AnimatedSection>
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left: Logo */}
                <div className="flex-shrink-0">
                  <Image
                    src="/academie/ADH logo dark white.svg"
                    alt="Académie de la Hauteur"
                    width={180}
                    height={180}
                    className="w-40 md:w-48 h-auto"
                  />
                </div>

                {/* Center: Content */}
                <div className="flex-1 text-center lg:text-left text-black">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{fontFamily: 'var(--font-outfit)'}}>
                    Formez-vous aux <span className="text-gray-900">travaux en hauteur</span>
                  </h2>
                  <p className="text-base md:text-lg leading-relaxed mb-4">
                    En France, les chutes de hauteur représentent la deuxième cause d'accidents mortels liés au travail,
                    juste après le risque routier. C'est pourquoi chez Formdetoit, tous nos collaborateurs sont
                    rigoureusement formés par l'Académie de la Hauteur aux normes de sécurité les plus strictes.
                  </p>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0">
                  <a
                    href="https://academiedelahauteur.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-black text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <span>Découvrir l'Académie</span>
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-12 md:py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8  text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Contactez-nous dès maintenant pour un devis personnalisé et gratuit.
            </p>
            <CTAButton size="lg" glow href="/contact">
              <Phone className="h-5 w-5" />
              Obtenir mon devis gratuit
            </CTAButton>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}