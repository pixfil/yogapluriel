import { PricingCard } from '@/components/yoga';
import AnimatedSection from '@/components/ui/animated-section';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs & Forfaits | Yoga Pluriel Strasbourg',
  description: 'Découvrez nos tarifs et forfaits de yoga à Strasbourg : cours à l\'unité, cartes de 10 séances, abonnements mensuels et annuels.',
};

export const revalidate = 3600; // 1 hour

export default async function TarifsPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all membership plans
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('price');

  // Fallback pricing data
  const fallbackPlans = [
    {
      id: '1',
      name: 'Cours d\'essai',
      plan_type: 'credit_based',
      credits: 1,
      price: 10,
      duration_days: 30,
      features: [
        'Accès à tous les cours collectifs',
        'Prêt du tapis et accessoires',
        'Valable 30 jours',
        'Sans engagement'
      ]
    },
    {
      id: '2',
      name: 'Carte 10 cours',
      plan_type: 'credit_based',
      credits: 10,
      price: 140,
      duration_days: 180,
      features: [
        'Accès à tous les cours collectifs',
        'Valable 6 mois',
        'Cours transférables',
        'Réservation en ligne'
      ]
    },
    {
      id: '3',
      name: 'Abonnement mensuel',
      plan_type: 'unlimited',
      price: 75,
      duration_days: 30,
      features: [
        'Cours illimités',
        'Accès à tous les cours',
        'Réservation prioritaire',
        'Événements exclusifs'
      ],
      isPopular: true
    },
    {
      id: '4',
      name: 'Abonnement annuel',
      plan_type: 'unlimited',
      price: 750,
      duration_days: 365,
      features: [
        'Cours illimités toute l\'année',
        'Meilleur rapport qualité-prix',
        'Réservation prioritaire',
        '2 cours invités offerts',
        'Ateliers à tarif réduit'
      ]
    }
  ];

  const plansToDisplay = plans && plans.length > 0 ? plans : fallbackPlans;

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
              Tarifs & Forfaits
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Choisissez la formule qui correspond à votre pratique et à votre budget.
              Sans engagement, flexible et accessible à tous.
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

      {/* Pricing Cards */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plansToDisplay.map((plan: any) => (
                <PricingCard
                  key={plan.id}
                  name={plan.name}
                  planType={plan.plan_type}
                  price={plan.price}
                  credits={plan.credits}
                  durationDays={plan.duration_days}
                  features={plan.features || []}
                  isPopular={plan.isPopular || false}
                  onSelect={() => {
                    // Handle selection
                    console.log('Selected plan:', plan.name);
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Additional Options */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Options <span className="text-purple-600">Supplémentaires</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Personnalisez votre pratique avec nos options à la carte
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Cours Privé
                      </h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        80€ <span className="text-lg text-gray-600">/ séance</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cours personnalisé 1h</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Attention individuelle</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Horaires flexibles</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Progression rapide</span>
                    </li>
                  </ul>
                  <a
                    href="/contact"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Réserver
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Petit Groupe
                      </h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        120€ <span className="text-lg text-gray-600">/ séance</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>2 à 5 personnes</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cours semi-privé 1h</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Idéal entre amis</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Attention personnalisée</span>
                    </li>
                  </ul>
                  <a
                    href="/contact"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Réserver
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Yoga en Entreprise
                      </h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        Sur devis
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cours dans vos locaux</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Bien-être des employés</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Programme sur mesure</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Réduction du stress</span>
                    </li>
                  </ul>
                  <a
                    href="/contact"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Demander un devis
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Ateliers Thématiques
                      </h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        35€ <span className="text-lg text-gray-600">/ atelier</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Séances 2h à 3h</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Thèmes spécifiques</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Weekends et soirées</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Approfondissement</span>
                    </li>
                  </ul>
                  <a
                    href="/planning"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Voir le calendrier
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                Questions <span className="text-purple-600">Fréquentes</span>
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Puis-je essayer avant de m'engager ?
                  </h3>
                  <p className="text-gray-600">
                    Oui ! Nous proposons un cours d'essai à 10€ pour découvrir notre studio, nos professeurs
                    et notre approche. Sans engagement.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quelle formule me convient le mieux ?
                  </h3>
                  <p className="text-gray-600">
                    Si vous pratiquez 1 à 2 fois par semaine, la carte 10 cours est idéale. Pour une pratique
                    régulière (3+ fois/semaine), l'abonnement mensuel est plus avantageux.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Les cartes de cours ont-elles une date d'expiration ?
                  </h3>
                  <p className="text-gray-600">
                    Oui, la carte 10 cours est valable 6 mois. L'abonnement mensuel se renouvelle automatiquement
                    mais peut être annulé à tout moment.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Proposez-vous des tarifs réduits ?
                  </h3>
                  <p className="text-gray-600">
                    Oui, nous offrons des tarifs réduits pour les étudiants, demandeurs d'emploi et seniors (sur présentation d'un justificatif). Contactez-nous pour plus d'informations.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Comment réserver un cours ?
                  </h3>
                  <p className="text-gray-600">
                    La réservation se fait en ligne via notre planning. Après achat de votre formule, vous recevrez vos identifiants pour réserver vos cours.
                  </p>
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
              Commencez votre pratique aujourd'hui
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Choisissez votre formule et réservez votre premier cours dès maintenant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/planning"
                className="inline-block bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Réserver un cours
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
