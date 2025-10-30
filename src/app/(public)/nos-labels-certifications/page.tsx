import { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import CTAButton from "@/components/ui/cta-button";
import { Award, CheckCircle, Phone } from "lucide-react";
import { getCertifications } from "@/app/actions/certifications";

export const metadata: Metadata = {
  title: "Nos Labels et Certifications - Formdetoit | Artisan RGE Qualibat Bas-Rhin",
  description: "Découvrez tous nos labels et certifications : RGE Qualibat, QualiPV, VELUX Expert, Artisan d'Alsace. Garantie de qualité et expertise reconnue dans le Bas-Rhin.",
};

const categoryLabels: Record<string, string> = {
  quality: 'Qualité',
  expertise: 'Expertise',
  territorial: 'Territorial',
  network: 'Réseau',
};

export default async function NosLabelsCertificationsPage() {
  // Fetch certifications from database (only published, non-deleted ones)
  const allCertifications = await getCertifications(false);

  // Filter to only show published certifications
  const certifications = allCertifications.filter((cert) => cert.published);

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Nos Labels et Certifications"
        subtitle="Des garanties de qualité, d'expertise et d'engagement territorial"
        backgroundImage="/background/bg-divers.webp"
      />

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Des <span className="text-yellow">labels reconnus</span> qui garantissent notre expertise
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Chez Formdetoit, nous accumulons les certifications et labels de qualité
                pour vous garantir un service d'excellence. Ces reconnaissances officielles
                attestent de notre savoir-faire, notre engagement environnemental et notre
                ancrage territorial en Alsace.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <AnimatedSection key={cert.id} delay={0.1 * index}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Header with logo and category */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center h-24 w-24 flex-shrink-0">
                      {cert.logo_url ? (
                        <Image
                          src={cert.logo_url}
                          alt={cert.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <Award className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cert.category_color}`}>
                      {categoryLabels[cert.category] || cert.category}
                    </span>
                  </div>

                  {/* Title and description */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{cert.name}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{cert.description}</p>

                  {/* Benefits list */}
                  <div className="mt-auto">
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">Avantages pour vous :</h4>
                      <ul className="space-y-2">
                        {cert.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why these certifications matter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Pourquoi ces <span className="text-yellow">certifications sont importantes</span> ?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Garantie de qualité</h3>
                  <p className="text-gray-700">
                    Nos certifications RGE Qualibat et QualiPV vous garantissent un travail
                    conforme aux normes en vigueur, avec des contrôles réguliers effectués
                    par des organismes indépendants.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Accès aux aides financières</h3>
                  <p className="text-gray-700">
                    Grâce à notre label RGE, vous pouvez bénéficier de MaPrimeRénov',
                    des CEE et de toutes les aides publiques pour vos travaux de rénovation
                    énergétique.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Ancrage local</h3>
                  <p className="text-gray-700">
                    Nos labels Marque Alsace et Artisan d'Alsace attestent de notre
                    engagement territorial, notre connaissance de l'architecture locale
                    et notre proximité avec nos clients.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Réseau professionnel</h3>
                  <p className="text-gray-700">
                    Notre appartenance au Réseau Entreprendre Alsace nous permet de
                    bénéficier de conseils d'experts et d'un accompagnement constant
                    pour améliorer nos services.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Confiez vos travaux à un artisan certifié
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Tous nos labels et certifications sont à votre service pour vous garantir
              des travaux de qualité, dans le respect des normes et de l'environnement.
            </p>
            <CTAButton size="lg" glow href="/contact">
              <Phone className="w-5 h-5" />
              Demander un devis gratuit
            </CTAButton>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}