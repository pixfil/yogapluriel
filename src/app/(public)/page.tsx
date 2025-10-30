import { Hero, CourseCard, TestimonialSlider } from '@/components/yoga';
import AnimatedSection from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 1800; // 30 minutes

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  // Fetch featured classes
  const { data: classes } = await supabase
    .from('class_types')
    .select('*')
    .eq('is_active', true)
    .limit(6);

  // Sample testimonials
  const testimonials = [
    {
      id: '1',
      name: 'Marie L.',
      text: 'Yoga Pluriel a transformé ma pratique. L\'ambiance est chaleureuse et les professeurs sont très attentifs. Je me sens plus zen et en meilleure santé.',
      rating: 5,
      course: 'Hatha Yoga'
    },
    {
      id: '2',
      name: 'Thomas R.',
      text: 'Excellent studio de yoga à Strasbourg. Les cours de Vinyasa sont dynamiques et parfaitement adaptés à mon niveau. Je recommande vivement!',
      rating: 5,
      course: 'Vinyasa'
    },
    {
      id: '3',
      name: 'Sophie M.',
      text: 'J\'adore les cours de Yin Yoga le soir, c\'est le moment parfait pour décompresser après une journée de travail. Merci à toute l\'équipe!',
      rating: 5,
      course: 'Yin Yoga'
    }
  ];

  return (
    <div className="-mt-24">
      {/* Hero Section */}
      <Hero
        title="Yoga Pluriel"
        subtitle="Pratique du yoga accessible à tous au cœur du quartier de Neudorf à Strasbourg"
        ctaPrimaryText="Réserver un cours"
        ctaPrimaryLink="/planning"
        ctaSecondaryText="Découvrir nos cours"
        ctaSecondaryLink="/cours"
      />

      {/* Philosophy Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre <span className="text-purple-600">Philosophie</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Chez Yoga Pluriel, nous croyons que le yoga est un chemin vers l'harmonie entre le corps,
                l'esprit et l'âme. Notre approche inclusive et bienveillante permet à chacun, quel que soit
                son niveau, de découvrir les bienfaits profonds de cette pratique millénaire.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-3xl">🙏</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Bienveillance</h3>
                  <p className="text-gray-600">
                    Un espace sécurisant où chacun pratique à son rythme, sans jugement
                  </p>
                </div>
                <div className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-3xl">🌸</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Authenticité</h3>
                  <p className="text-gray-600">
                    Des enseignements fidèles aux traditions du yoga, adaptés au monde moderne
                  </p>
                </div>
                <div className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transformation</h3>
                  <p className="text-gray-600">
                    Un accompagnement vers plus de bien-être physique, mental et émotionnel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Classes */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Nos <span className="text-purple-600">Cours</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez notre sélection de cours adaptés à tous les niveaux et à tous les besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {classes && classes.length > 0 ? (
                classes.map((classType) => (
                  <CourseCard
                    key={classType.id}
                    title={classType.name}
                    description={classType.description || ''}
                    duration={`${classType.duration_minutes} min`}
                    level={classType.level || 'Tous niveaux'}
                    slug={classType.id}
                  />
                ))
              ) : (
                // Fallback data si la base de données n'est pas encore peuplée
                <>
                  <CourseCard
                    title="Hatha Yoga"
                    description="Le yoga traditionnel qui équilibre le corps et l'esprit à travers des postures tenues et la respiration."
                    duration="75 min"
                    level="Tous niveaux"
                    slug="hatha"
                  />
                  <CourseCard
                    title="Vinyasa"
                    description="Un yoga dynamique où les postures s'enchaînent de manière fluide, synchronisées avec la respiration."
                    duration="60 min"
                    level="Intermédiaire"
                    slug="vinyasa"
                  />
                  <CourseCard
                    title="Yin Yoga"
                    description="Une pratique douce et méditative avec des postures tenues longuement pour un relâchement profond."
                    duration="75 min"
                    level="Tous niveaux"
                    slug="yin"
                  />
                  <CourseCard
                    title="Yoga Prénatal"
                    description="Accompagnement des futures mamans avec des postures adaptées pour vivre une grossesse sereine."
                    duration="60 min"
                    level="Débutant"
                    slug="prenatal"
                  />
                  <CourseCard
                    title="Yoga Restaurateur"
                    description="Régénération profonde du corps et de l'esprit grâce à des postures supportées et confortables."
                    duration="75 min"
                    level="Tous niveaux"
                    slug="restaurateur"
                  />
                  <CourseCard
                    title="Méditation"
                    description="Cultivez la pleine conscience et l'apaisement mental à travers différentes techniques de méditation."
                    duration="45 min"
                    level="Tous niveaux"
                    slug="meditation"
                  />
                </>
              )}
            </div>

            <div className="text-center mt-12">
              <Link href="/cours">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                  Voir tous nos cours
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Les <span className="text-purple-600">Bienfaits</span> du Yoga
                </h2>
                <p className="text-lg text-gray-600">
                  Une pratique régulière du yoga transforme votre vie de multiples façons
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
                      💪
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Force et Souplesse</h3>
                    <p className="text-gray-600">
                      Développez votre force musculaire tout en gagnant en souplesse et en mobilité articulaire
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
                      🧠
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Clarté Mentale</h3>
                    <p className="text-gray-600">
                      Améliorez votre concentration, réduisez le stress et retrouvez un esprit apaisé
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
                      🫁
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Respiration</h3>
                    <p className="text-gray-600">
                      Apprenez à mieux respirer pour oxygéner votre corps et calmer votre système nerveux
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
                      ❤️
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Bien-être Général</h3>
                    <p className="text-gray-600">
                      Améliorez votre qualité de sommeil, votre énergie vitale et votre joie de vivre
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ils pratiquent <span className="text-purple-600">avec nous</span>
              </h2>
              <p className="text-lg text-gray-600">
                Découvrez les témoignages de notre communauté
              </p>
            </div>

            <TestimonialSlider testimonials={testimonials} />
          </div>
        </section>
      </AnimatedSection>

      {/* Location Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Rejoignez-nous à <span className="text-purple-600">Neudorf</span>
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Notre studio se trouve au cœur du quartier de Neudorf à Strasbourg,
                    facilement accessible en transport en commun. Un espace lumineux et
                    chaleureux vous attend pour votre pratique.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Adresse</div>
                        <div className="text-gray-600">10 rue du Rhin, 67100 Strasbourg</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Horaires</div>
                        <div className="text-gray-600">Lun-Sam: 7h-21h | Dim: 9h-13h</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-xl h-80 bg-purple-100">
                  {/* Map placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-purple-600">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm">Carte interactive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à commencer votre voyage?
            </h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Rejoignez notre communauté et découvrez les bienfaits du yoga dès aujourd'hui
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/planning">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 px-8">
                  Voir le planning
                </Button>
              </Link>
              <Link href="/tarifs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  Nos tarifs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
