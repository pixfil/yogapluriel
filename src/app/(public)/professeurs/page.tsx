import { InstructorCard } from '@/components/yoga';
import AnimatedSection from '@/components/ui/animated-section';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Professeurs | Yoga Pluriel Strasbourg',
  description: 'Rencontrez notre équipe de professeurs de yoga certifiés et passionnés à Strasbourg Neudorf.',
};

export const revalidate = 3600; // 1 hour

export default async function ProfesseursPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all active instructors
  const { data: instructors } = await supabase
    .from('instructors')
    .select('*')
    .eq('is_active', true)
    .order('first_name');

  // Fallback instructor data
  const fallbackInstructors = [
    {
      id: '1',
      first_name: 'Sophie',
      last_name: 'Martin',
      bio: 'Professeure de yoga depuis 15 ans, Sophie s\'est formée en Inde auprès de maîtres traditionnels. Elle enseigne le Hatha et le Vinyasa avec une approche douce et bienveillante.',
      specialties: ['Hatha Yoga', 'Vinyasa', 'Méditation'],
      certifications: ['RYT 500', 'Yoga Alliance', 'Formation en Inde'],
      years_experience: 15
    },
    {
      id: '2',
      first_name: 'Thomas',
      last_name: 'Dubois',
      bio: 'Ancien danseur professionnel reconverti dans le yoga, Thomas apporte une approche unique alliant fluidité et alignement précis. Spécialiste du Vinyasa et de l\'Ashtanga.',
      specialties: ['Vinyasa', 'Ashtanga', 'Yoga dynamique'],
      certifications: ['RYT 300', 'Ashtanga Certified'],
      years_experience: 8
    },
    {
      id: '3',
      first_name: 'Marie',
      last_name: 'Lefebvre',
      bio: 'Sage-femme de formation, Marie s\'est spécialisée dans l\'accompagnement des femmes enceintes et jeunes mamans. Elle enseigne le yoga prénatal et postnatal avec douceur et expertise.',
      specialties: ['Yoga Prénatal', 'Yoga Postnatal', 'Yin Yoga'],
      certifications: ['Diplôme de Sage-femme', 'Yoga Prénatal Certifiée'],
      years_experience: 12
    },
    {
      id: '4',
      first_name: 'Lucas',
      last_name: 'Petit',
      bio: 'Formé en thérapie corporelle et en méditation, Lucas guide des séances de Yin Yoga et de méditation qui permettent un lâcher-prise profond et une reconnexion à soi.',
      specialties: ['Yin Yoga', 'Méditation', 'Pranayama'],
      certifications: ['Thérapeute Corporel', 'Enseignant de Méditation'],
      years_experience: 6
    }
  ];

  const instructorsToDisplay = instructors && instructors.length > 0 ? instructors : fallbackInstructors;

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
              Nos Professeurs
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Rencontrez notre équipe de professeurs passionnés et certifiés, dévoués à vous accompagner
              dans votre pratique du yoga avec bienveillance et expertise.
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

      {/* Instructors Grid */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {instructorsToDisplay.map((instructor: any) => (
                <InstructorCard
                  key={instructor.id}
                  id={instructor.id}
                  firstName={instructor.first_name}
                  lastName={instructor.last_name}
                  bio={instructor.bio}
                  specialties={instructor.specialties || []}
                  yearsExperience={instructor.years_experience}
                  photoUrl={instructor.photo_url}
                />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Philosophy Section */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Notre <span className="text-purple-600">Approche</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Chez Yoga Pluriel, nos professeurs partagent une vision commune : rendre le yoga
                accessible à tous, dans le respect des traditions et des corps de chacun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Formation Continue
                </h3>
                <p className="text-gray-600">
                  Nos professeurs se forment régulièrement pour enrichir leur pratique et vous offrir
                  un enseignement de qualité.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Bienveillance
                </h3>
                <p className="text-gray-600">
                  L'écoute, le respect et la non-jugement sont au cœur de notre enseignement pour
                  créer un espace sécurisant.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Adaptation
                </h3>
                <p className="text-gray-600">
                  Chaque cours est adapté aux besoins et aux capacités de chacun, avec des variations
                  proposées pour tous les niveaux.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Certifications Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Certifications & <span className="text-purple-600">Qualifications</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Tous nos professeurs sont diplômés et certifiés par des organismes reconnus
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4 items-start p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      RYT 200/300/500 - Yoga Alliance
                    </h3>
                    <p className="text-gray-600">
                      Certification internationale reconnue mondialement, garantissant un enseignement
                      de qualité basé sur les standards les plus élevés.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Formations Spécialisées
                    </h3>
                    <p className="text-gray-600">
                      Certifications spécifiques en yoga prénatal, thérapeutique, Yin, Ashtanga et
                      méditation pour un accompagnement ciblé.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Anatomie & Physiologie
                    </h3>
                    <p className="text-gray-600">
                      Connaissance approfondie du corps humain pour proposer une pratique sûre et
                      adaptée à chaque morphologie.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Pratique Personnelle
                    </h3>
                    <p className="text-gray-600">
                      Pratique quotidienne et expérience vécue du yoga, essentielle pour transmettre
                      avec authenticité et profondeur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Join Team Section */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vous êtes professeur de yoga ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Yoga Pluriel est toujours à la recherche de professeurs passionnés et qualifiés pour
                rejoindre notre équipe. Si vous partagez nos valeurs de bienveillance, d'authenticité
                et d'accessibilité, n'hésitez pas à nous contacter.
              </p>
              <a
                href="/contact"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Nous rejoindre
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Venez pratiquer avec nous
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Découvrez nos cours et laissez-vous guider par nos professeurs expérimentés
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/planning"
                className="inline-block bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Voir le planning
              </a>
              <a
                href="/cours"
                className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Nos cours
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
