import { SessionCard } from '@/components/yoga';
import AnimatedSection from '@/components/ui/animated-section';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planning des Cours | Yoga Pluriel Strasbourg',
  description: 'Consultez notre planning de cours de yoga et réservez votre place en ligne. Cours tous les jours matin, midi et soir à Strasbourg Neudorf.',
};

export const revalidate = 300; // 5 minutes - plus court car le planning change souvent

export default async function PlanningPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch upcoming sessions with class and instructor info
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      class_types:class_type_id (name, duration_minutes),
      instructors:instructor_id (first_name, last_name),
      rooms:room_id (name)
    `)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime')
    .limit(20);

  // Fallback session data
  const fallbackSessions = [
    {
      id: '1',
      class_types: { name: 'Hatha Yoga' },
      instructors: { first_name: 'Sophie', last_name: 'Martin' },
      start_datetime: '2025-01-15T08:00:00',
      duration_minutes: 75,
      max_participants: 15,
      current_participants: 8,
      rooms: { name: 'Salle Lotus' },
      status: 'scheduled'
    },
    {
      id: '2',
      class_types: { name: 'Vinyasa Flow' },
      instructors: { first_name: 'Thomas', last_name: 'Dubois' },
      start_datetime: '2025-01-15T10:00:00',
      duration_minutes: 60,
      max_participants: 15,
      current_participants: 12,
      rooms: { name: 'Salle Mandala' },
      status: 'scheduled'
    },
    {
      id: '3',
      class_types: { name: 'Yin Yoga' },
      instructors: { first_name: 'Lucas', last_name: 'Petit' },
      start_datetime: '2025-01-15T12:30:00',
      duration_minutes: 75,
      max_participants: 12,
      current_participants: 6,
      rooms: { name: 'Salle Zen' },
      status: 'scheduled'
    },
    {
      id: '4',
      class_types: { name: 'Yoga Prénatal' },
      instructors: { first_name: 'Marie', last_name: 'Lefebvre' },
      start_datetime: '2025-01-15T18:00:00',
      duration_minutes: 60,
      max_participants: 10,
      current_participants: 7,
      rooms: { name: 'Salle Lotus' },
      status: 'scheduled'
    },
    {
      id: '5',
      class_types: { name: 'Méditation' },
      instructors: { first_name: 'Lucas', last_name: 'Petit' },
      start_datetime: '2025-01-15T19:30:00',
      duration_minutes: 45,
      max_participants: 20,
      current_participants: 15,
      rooms: { name: 'Salle Mandala' },
      status: 'scheduled'
    },
    {
      id: '6',
      class_types: { name: 'Hatha Yoga' },
      instructors: { first_name: 'Sophie', last_name: 'Martin' },
      start_datetime: '2025-01-16T08:00:00',
      duration_minutes: 75,
      max_participants: 15,
      current_participants: 15,
      rooms: { name: 'Salle Lotus' },
      status: 'full'
    }
  ];

  const sessionsToDisplay = sessions && sessions.length > 0 ? sessions : fallbackSessions;

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group sessions by date
  const sessionsByDate = sessionsToDisplay.reduce((acc: any, session: any) => {
    const date = new Date(session.start_datetime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

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
              Planning des Cours
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Consultez notre planning et réservez votre place en ligne.
              Cours tous les jours, matin, midi et soir.
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

      {/* Filter Section */}
      <AnimatedSection>
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium">
                  Tous les cours
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                  Hatha
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                  Vinyasa
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                  Yin
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mis à jour toutes les 5 minutes</span>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Sessions by Date */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-white to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
              {Object.keys(sessionsByDate).map((date, idx) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-purple-600">
                        {formatDate(sessionsByDate[date][0].start_datetime)}
                      </span>
                    </h2>
                  </div>

                  {/* Sessions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessionsByDate[date].map((session: any) => (
                      <SessionCard
                        key={session.id}
                        id={session.id}
                        className={session.class_types?.name || 'Cours'}
                        instructorName={`${session.instructors?.first_name || ''} ${session.instructors?.last_name || ''}`}
                        startTime={formatTime(session.start_datetime)}
                        duration={session.class_types?.duration_minutes || session.duration_minutes || 60}
                        maxParticipants={session.max_participants}
                        currentParticipants={session.current_participants}
                        roomName={session.rooms?.name || 'Studio'}
                        status={session.status}
                        onBook={() => {
                          console.log('Book session:', session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {sessionsToDisplay.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Aucun cours disponible
                </h3>
                <p className="text-gray-600 mb-6">
                  Le planning sera bientôt mis à jour avec de nouveaux cours.
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Nous contacter
                </a>
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Info Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Comment <span className="text-purple-600">Réserver</span> ?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Choisissez votre formule
                  </h3>
                  <p className="text-gray-600">
                    Sélectionnez le forfait qui correspond à votre pratique dans notre page tarifs
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Créez votre compte
                  </h3>
                  <p className="text-gray-600">
                    Inscrivez-vous en ligne pour accéder à notre système de réservation
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Réservez vos cours
                  </h3>
                  <p className="text-gray-600">
                    Consultez le planning et réservez vos places en quelques clics
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Bon à savoir
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">
                      <strong>Annulation gratuite</strong> jusqu'à 4h avant le début du cours
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">
                      <strong>Arrivez 10 minutes avant</strong> le début du cours pour vous installer
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">
                      <strong>Tapis et accessoires fournis</strong>, apportez juste une tenue confortable
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">
                      <strong>Liste d'attente disponible</strong> si le cours est complet
                    </span>
                  </li>
                </ul>
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
              Première fois chez nous ?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Profitez de notre cours d'essai à 10€ pour découvrir notre studio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/tarifs"
                className="inline-block bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Voir les tarifs
              </a>
              <a
                href="/contact"
                className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
