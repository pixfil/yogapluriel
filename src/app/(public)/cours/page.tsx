import { CourseCard } from '@/components/yoga';
import AnimatedSection from '@/components/ui/animated-section';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Cours de Yoga | Yoga Pluriel Strasbourg',
  description: 'Découvrez tous nos cours de yoga à Strasbourg Neudorf : Hatha, Vinyasa, Yin, Prénatal, Restaurateur et Méditation. Pour tous les niveaux.',
};

export const revalidate = 3600; // 1 hour

export default async function CoursPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all active class types
  const { data: classes } = await supabase
    .from('class_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Fallback course data
  const fallbackCourses = [
    {
      id: 'hatha',
      name: 'Hatha Yoga',
      description: 'Le Hatha Yoga est le yoga traditionnel qui équilibre le corps et l\'esprit à travers des postures (asanas) tenues et la respiration consciente (pranayama). Cette pratique ancestrale permet de développer force, souplesse et concentration tout en cultivant un état de calme intérieur profond.',
      duration_minutes: 75,
      level: 'Tous niveaux',
      benefits: [
        'Améliore la flexibilité et la force musculaire',
        'Réduit le stress et l\'anxiété',
        'Développe la conscience corporelle',
        'Équilibre le système nerveux'
      ]
    },
    {
      id: 'vinyasa',
      name: 'Vinyasa Flow',
      description: 'Le Vinyasa est un yoga dynamique où les postures s\'enchaînent de manière fluide, synchronisées avec la respiration. Chaque mouvement est connecté au souffle, créant une méditation en mouvement qui réchauffe le corps et apaise l\'esprit.',
      duration_minutes: 60,
      level: 'Intermédiaire',
      benefits: [
        'Renforce le système cardiovasculaire',
        'Tonifie l\'ensemble du corps',
        'Améliore la coordination',
        'Développe l\'endurance'
      ]
    },
    {
      id: 'yin',
      name: 'Yin Yoga',
      description: 'Le Yin Yoga est une pratique douce et méditative où les postures sont tenues longuement (3 à 5 minutes) pour un relâchement profond des tissus conjonctifs. C\'est l\'antidote parfait à nos vies actives et stressantes.',
      duration_minutes: 75,
      level: 'Tous niveaux',
      benefits: [
        'Libère les tensions profondes',
        'Améliore la flexibilité',
        'Calme le mental',
        'Favorise la circulation énergétique'
      ]
    },
    {
      id: 'prenatal',
      name: 'Yoga Prénatal',
      description: 'Le Yoga Prénatal accompagne les futures mamans tout au long de leur grossesse avec des postures adaptées, des exercices de respiration et de relaxation. Une préparation douce et bienveillante pour vivre une grossesse sereine et se préparer à l\'accouchement.',
      duration_minutes: 60,
      level: 'Débutant',
      benefits: [
        'Soulage les maux de grossesse',
        'Renforce le plancher pelvien',
        'Prépare à l\'accouchement',
        'Crée un lien avec bébé'
      ]
    },
    {
      id: 'restaurateur',
      name: 'Yoga Restaurateur',
      description: 'Le Yoga Restaurateur utilise des supports (bolsters, couvertures, blocs) pour maintenir des postures confortables pendant de longues périodes. Cette pratique douce permet une régénération profonde du corps et de l\'esprit, idéale pour récupérer et se ressourcer.',
      duration_minutes: 75,
      level: 'Tous niveaux',
      benefits: [
        'Régénère le système nerveux',
        'Améliore la qualité du sommeil',
        'Réduit la fatigue chronique',
        'Favorise la guérison'
      ]
    },
    {
      id: 'ashtanga',
      name: 'Ashtanga Yoga',
      description: 'L\'Ashtanga est une forme de yoga dynamique et exigeante qui suit une série de postures spécifiques dans un ordre précis. Cette pratique traditionnelle développe force, endurance et discipline tout en purifiant le corps par la chaleur générée.',
      duration_minutes: 90,
      level: 'Avancé',
      benefits: [
        'Développe force et endurance',
        'Purifie le corps en profondeur',
        'Améliore la concentration',
        'Crée une discipline personnelle'
      ]
    },
    {
      id: 'meditation',
      name: 'Méditation & Pranayama',
      description: 'Des séances dédiées à la méditation et aux techniques de respiration (pranayama). Apprenez à cultiver la pleine conscience, à apaiser le mental et à maîtriser votre souffle pour accéder à un état de paix intérieure profonde.',
      duration_minutes: 45,
      level: 'Tous niveaux',
      benefits: [
        'Réduit l\'anxiété et le stress',
        'Améliore la concentration',
        'Développe la clarté mentale',
        'Augmente la capacité respiratoire'
      ]
    }
  ];

  const coursesToDisplay = classes && classes.length > 0 ? classes : fallbackCourses;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Nos Cours de Yoga
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Découvrez notre sélection de cours adaptés à tous les niveaux et à tous les besoins.
              Que vous soyez débutant ou pratiquant confirmé, vous trouverez le cours qui vous correspond.
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Courses Grid */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              {coursesToDisplay.map((course: any, index: number) => (
                <CourseCard
                  key={course.id}
                  title={course.name}
                  description={course.description || ''}
                  duration={`${course.duration_minutes} min`}
                  level={course.level || 'Tous niveaux'}
                  slug={course.id}
                />
              ))}
            </div>

            {/* Detailed Course Information */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Détails des cours
              </h2>

              <div className="space-y-12">
                {coursesToDisplay.map((course: any) => (
                  <div
                    key={course.id}
                    className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{course.duration_minutes} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{course.level}</span>
                          </div>
                        </div>

                        {course.benefits && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Bienfaits :</h4>
                            <ul className="space-y-2">
                              {course.benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-600">
                                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="md:w-48 flex flex-col gap-3">
                        <div className="p-4 bg-white rounded-xl border border-purple-200 text-center">
                          <div className="text-3xl mb-2">🧘</div>
                          <div className="text-sm text-gray-600">Places disponibles</div>
                          <div className="text-2xl font-bold text-purple-600">15</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Info Section */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Informations pratiques
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👋</span>
                    Première fois ?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Nous proposons un cours d'essai gratuit pour découvrir notre studio et notre approche.
                    Venez comme vous êtes, nous fournissons les tapis et accessoires.
                  </p>
                  <a href="/planning" className="text-purple-600 hover:text-purple-700 font-medium">
                    Réserver mon cours d'essai →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    Planning flexible
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Nos cours ont lieu tous les jours de la semaine, matin, midi et soir.
                    Consultez notre planning en ligne et réservez votre place facilement.
                  </p>
                  <a href="/planning" className="text-purple-600 hover:text-purple-700 font-medium">
                    Voir le planning →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    Formules adaptées
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Cours à l'unité, cartes de 10 séances, abonnements mensuels ou annuels.
                    Trouvez la formule qui correspond à votre pratique et votre budget.
                  </p>
                  <a href="/tarifs" className="text-purple-600 hover:text-purple-700 font-medium">
                    Découvrir les tarifs →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Cours privés
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bénéficiez d'un accompagnement personnalisé avec nos cours particuliers ou en petit groupe.
                    Idéal pour progresser rapidement ou approfondir votre pratique.
                  </p>
                  <a href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                    Nous contacter →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Prêt à débuter votre pratique ?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Réservez votre premier cours dès maintenant et découvrez les bienfaits du yoga
            </p>
            <a
              href="/planning"
              className="inline-block bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Réserver un cours
            </a>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
