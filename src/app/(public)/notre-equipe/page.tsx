import { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import TeamGrid from "@/components/ui/team-grid";
import JobPostingCard from "@/components/ui/JobPostingCard";
import {
  Users,
  Award,
  CheckCircle,
  Phone,
  MapPin,
  Clock,
  Wrench
} from "lucide-react";
import { getPublishedTeamMembers, getActiveJobOpenings } from "@/app/actions/team";

export const metadata: Metadata = {
  title: "Notre Équipe - Formdetoit | Artisan Couvreur Certifié RGE Bas-Rhin",
  description: "Découvrez l'équipe Formdetoit : artisans couvreurs-zingueurs certifiés RGE et Qualibat. Formation Compagnons du Devoir, 15 ans d'expérience dans le Bas-Rhin.",
};

export default async function NotreEquipePage() {
  // Fetch team members and job openings
  const [teamMembers, jobOpenings] = await Promise.all([
    getPublishedTeamMembers(),
    getActiveJobOpenings(),
  ]);

  const certifications = [
    {
      title: "RGE Qualibat",
      description: "Reconnu Garant de l'Environnement",
      icon: Award
    },
    {
      title: "Axés sur la formation",
      description: "Formation continue pour maintenir le plus haut niveau d'expertise",
      icon: Users
    },
    {
      title: "Assurance Décennale",
      description: "Protection complète de vos travaux",
      icon: CheckCircle
    },
    {
      title: "Artisan Qualifié",
      description: "Expertise toiture et zinguerie",
      icon: Wrench
    }
  ];

  const values = [
    {
      title: "Excellence Artisanale",
      description: "Chaque projet est réalisé avec le plus grand soin, dans le respect des traditions du métier et des techniques modernes."
    },
    {
      title: "Transparence",
      description: "Devis détaillés, suivi de chantier en temps réel et communication constante avec nos clients."
    },
    {
      title: "Engagement Environnemental", 
      description: "Matériaux biosourcés, isolation performante et solutions durables pour l'avenir."
    },
    {
      title: "Proximité",
      description: "Une équipe locale qui connaît parfaitement les spécificités architecturales de l'Alsace."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Notre Équipe"
        subtitle="Des artisans passionnés & certifiés à votre service"
        backgroundImage="/background/bg-equipe.webp"
      />

      {/* Content Section */}
      <section className="bg-gradient-to-br from-slate-100 to-gray-50 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Team Image & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src="/background/img-equipe.webp"
                    alt="Équipe Formdetoit - Artisans couvreurs Bas-Rhin"
                    width={600}
                    height={400}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Floating Stats */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-black">1000+</div>
                          <div className="text-xs text-gray-900 font-medium">Projets réalisés</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-black">35 km</div>
                          <div className="text-xs text-gray-900 font-medium">Rayon d'action</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-black">100%</div>
                          <div className="text-xs text-gray-900 font-medium">Suivi de proximité</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  L'Excellence au Service{' '}
                  <span className="text-yellow">de Votre Toiture</span>
                </h2>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Fondée par <strong>Maryan LHUILLIER</strong>, artisan couvreur formé aux
                  Compagnons du Devoir, Formdetoit intervient depuis plus de 20 ans dans tout le Bas-Rhin
                  pour vos travaux de couverture, zinguerie et isolation. Notre expertise,
                  reconnue par nos certifications RGE Qualibat, nous permet de vous accompagner
                  dans tous vos projets, des rénovations patrimoniales aux constructions neuves.
                </p>

                <p className="text-base text-gray-600 leading-relaxed">
                  Notre équipe de 6 professionnels passionnés - Maryan, Sophie, Guillaume, Albert,
                  Gaspard et Quentin - travaille au quotidien avec un seul objectif : vous offrir
                  un service d'excellence respectueux de l'environnement et des traditions artisanales.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-8 h-8 text-yellow mx-auto mb-2" />
                    <div className="font-semibold">Zone d'intervention</div>
                    <div className="text-sm text-gray-600">Rayon de 35 km</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <Clock className="w-8 h-8 text-yellow mx-auto mb-2" />
                    <div className="font-semibold">Délai moyen</div>
                    <div className="text-sm text-gray-600">48h pour être recontacté</div>
                  </div>
                </div>

                <CTAButton size="lg" glow href="/nos-prestations">
                  Découvrir nos prestations
                </CTAButton>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Engagement Environnemental */}
      <AnimatedSection>
        <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Notre <span className="text-green-600">Engagement Environnemental</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Un artisanat responsable pour un avenir durable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection delay={0.1}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Matériaux Biosourcés</h3>
                  <p className="text-gray-700">
                    Nous privilégions les isolants naturels comme la <strong>laine de bois</strong> et
                    la <strong>cellulose</strong> pour une isolation écologique et performante.
                  </p>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Optimisation des Déchets</h3>
                  <p className="text-gray-700">
                    Tri sélectif sur chantier, réutilisation des matériaux quand c'est possible,
                    et recyclage systématique pour <strong>minimiser notre impact</strong> environnemental.
                  </p>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Nos choix techniques</h3>
                  <p className="text-gray-700">
                    Nous sélectionnons des <strong>matériaux ayant un meilleur bilan carbone</strong>
                    à performance équivalente, privilégiant les solutions durables et responsables
                    pour chaque projet.
                  </p>
                </GlassCard>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Certifications */}
      <AnimatedSection>
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos <span className="text-yellow">Certifications</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Des labels de qualité qui garantissent notre expertise et votre sérénité.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {certifications.map((cert, index) => {
                const IconComponent = cert.icon;
                return (
                  <AnimatedSection key={cert.title} delay={0.1 * index}>
                    <GlassCard hover className="p-6 text-center h-full">
                      <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-yellow" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{cert.title}</h3>
                      <p className="text-gray-600 text-sm">{cert.description}</p>
                    </GlassCard>
                  </AnimatedSection>
                );
              })}
            </div>

            {/* Lien vers page certifications */}
            <div className="text-center mt-12">
              <CTAButton variant="primary" size="md" href="/nos-labels-certifications">
                En savoir plus sur nos certifications
              </CTAButton>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Notre Équipe - Photos */}
      {teamMembers.length > 0 && (
        <AnimatedSection>
          <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Rencontrez <span className="text-yellow">Notre Équipe</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Des artisans passionnés et qualifiés, à votre service au quotidien.
                </p>
              </div>

              <TeamGrid members={teamMembers} />
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Formation & Sécurité */}
      <AnimatedSection>
        <section className="py-24 bg-gradient-to-br from-yellow/10 to-yellow/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Formation & <span className="text-yellow">Sécurité</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Formdetoit place la sécurité et la formation de ses salariés au cœur de sa réflexion quotidienne.
                L'expertise s'acquiert par la formation continue et le respect strict des normes de sécurité.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <AnimatedSection direction="left">
                <GlassCard className="p-8 h-full bg-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-yellow" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Formation Continue de nos Équipes</h3>
                      <p className="text-gray-600">L'excellence par l'apprentissage permanent</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Chez Formdetoit, la formation ne s'arrête jamais. De la formation initiale aux
                    <strong> Compagnons du Devoir</strong> jusqu'aux perfectionnements réguliers, nous
                    investissons dans le développement de nos équipes pour garantir un savoir-faire d'exception.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Formation continue tout au long de la carrière</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Perfectionnement aux nouvelles techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Transmission des savoirs entre générations</span>
                    </li>
                  </ul>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection direction="right">
                <GlassCard className="p-8 h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/academie/ADH-Logo-blanc.svg"
                        alt="Académie de la Hauteur"
                        width={48}
                        height={48}
                        className="w-12 h-12"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Académie de la Hauteur</h3>
                      <p className="text-gray-300">Certifiés travaux en hauteur</p>
                    </div>
                  </div>
                  <p className="text-gray-200 leading-relaxed mb-4">
                    Notre équipe est certifiée par l'<strong>Académie de la Hauteur</strong>,
                    garantissant le respect des <strong>normes de sécurité</strong> les plus strictes
                    pour les travaux en hauteur.
                  </p>
                  <ul className="space-y-2 text-gray-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Formation certifiante régulière</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Équipements de protection individuelle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
                      <span>Protocoles de sécurité rigoureux</span>
                    </li>
                  </ul>
                </GlassCard>
              </AnimatedSection>
            </div>

            {/* Ergonomie */}
            <AnimatedSection>
              <GlassCard className="p-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="w-16 h-16 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-yellow" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Outils professionnels</h4>
                    <p className="text-gray-600 text-sm">
                      Échafaudages modernes, équipements de dernière génération et outils adaptés
                      pour un travail de qualité optimale
                    </p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-yellow" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Kits de sécurité complets</h4>
                    <p className="text-gray-600 text-sm">
                      Harnais, lignes de vie, protections individuelles dernière génération
                    </p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-yellow" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Travail d'équipe</h4>
                    <p className="text-gray-600 text-sm">
                      Collaboration et partage des compétences pour un chantier sécurisé
                    </p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>

      {/* Qualité de Vie au Travail */}
      <AnimatedSection>
        <section className="py-24 bg-gradient-to-br from-amber-100 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Qualité de Vie <span className="text-yellow">au Travail</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Parce que prendre soin de nos équipes, c'est aussi garantir la qualité de nos chantiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection delay={0.1}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Préserver votre santé</h3>
                      <p className="text-sm text-gray-500 mb-2">Prévention TMS</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Le métier de couvreur est physiquement exigeant. Nous veillons à ce que chaque membre
                    de l'équipe dispose d'<strong>outils ergonomiques</strong> et de pauses adaptées pour
                    prévenir les douleurs et les troubles musculo-squelettiques.
                  </p>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Grandir ensemble</h3>
                      <p className="text-sm text-gray-500 mb-2">Évolution de carrière</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Chez Formdetoit, on croit au développement de chacun. <strong>Formations</strong>,
                    montée en compétences, évolution vers de nouvelles responsabilités : nous accompagnons
                    nos collaborateurs dans leur parcours professionnel.
                  </p>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <GlassCard className="p-6 h-full bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Travailler sereinement</h3>
                      <p className="text-sm text-gray-500 mb-2">Santé & Bien-être</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Nous restons vigilants sur la <strong>pénibilité du métier</strong> : équipements
                    adaptés, organisation optimisée, et une vraie attention portée au bien-être de chacun
                    pour que tout le monde rentre en bonne santé à la maison.
                  </p>
                </GlassCard>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* L'Équipe - Recrutement */}
      {jobOpenings.length > 0 && (
        <AnimatedSection>
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Rejoignez <span className="text-yellow">Notre Équipe</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Nous recherchons des artisans passionnés pour renforcer notre équipe.
                </p>
              </div>

              <div className={`grid grid-cols-1 ${jobOpenings.length === 1 ? 'max-w-2xl mx-auto' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-8`}>
                {jobOpenings.map((job, index) => (
                  <JobPostingCard key={job.id} job={job} index={index} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Values */}
      <AnimatedSection>
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos <span className="text-yellow">Valeurs</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ce qui guide notre travail au quotidien pour vous offrir le meilleur service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <AnimatedSection key={value.title} delay={0.1 * index}>
                  <GlassCard className="p-8 h-full">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      {value.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {value.description}
                    </p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à confier votre toiture à nos experts ?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Contactez-nous pour un devis personnalisé et découvrez pourquoi
              plus de 1000 projets nous ont été confiés.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton size="lg" glow href="/contact">
                <Phone className="w-5 h-5" />
                Demander un devis
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