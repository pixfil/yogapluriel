import { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import ContactTabs from "@/components/ui/contact-tabs";
import GoogleReviewsCarousel from "@/components/home/google-reviews-carousel";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle
} from "lucide-react";
import { getPageMetadata } from "@/lib/page-seo";
import { getGeneralSettings } from "@/app/actions/settings";

// Dynamic metadata from database with fallback
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/contact', {
    title: "Contact - Formdetoit | Devis Gratuit Couvreur Bas-Rhin Strasbourg",
    description: "Contactez Formdetoit pour votre projet toiture. Devis gratuit sous 24h. Téléphone, email, formulaire de contact. Artisan couvreur Bas-Rhin.",
    ogTitle: "Contact FormDeToit - Devis Gratuit",
    ogDescription: "Demandez votre devis gratuit sous 24h. Artisan couvreur certifié RGE dans le Bas-Rhin.",
  });
}

export default async function ContactPage() {
  const generalSettings = await getGeneralSettings();

  // Format hours for display (show first line only)
  const hoursDisplay = generalSettings.hours
    ? generalSettings.hours.split('\n')[0] || "Lun - Ven : 8h30-17h"
    : "Lun - Ven : 8h30-17h";

  const contactInfo = [
    {
      icon: Phone,
      title: "Téléphone",
      content: generalSettings.phone || "03 88 75 66 53",
      subtext: "Du lundi au vendredi",
      href: generalSettings.phone ? `tel:${generalSettings.phone.replace(/\s/g, '')}` : "tel:0388756653"
    },
    {
      icon: Mail,
      title: "Email",
      content: generalSettings.email || "contact@formdetoit.fr",
      subtext: "Réponse sous 2h",
      href: generalSettings.email ? `mailto:${generalSettings.email}` : "mailto:contact@formdetoit.fr"
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: generalSettings.address ? generalSettings.address.split('\n')[0] : "Zone d'intervention",
      subtext: generalSettings.address ? generalSettings.address.split('\n')[1] || "Tout le Bas-Rhin" : "Tout le Bas-Rhin",
      href: null
    },
    {
      icon: Clock,
      title: "Horaires",
      content: hoursDisplay,
      subtext: "Sam sur RDV",
      href: null
    }
  ];

  const services = [
    "Réponse sous 48h",
    "Expertise technique approfondie",
    "Conseils personnalisés",
    "Solutions adaptées à votre budget",
    "Accompagnement dans les démarches administratives"
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Contact"
        subtitle="Parlons de votre projet toiture"
        backgroundImage="/background/bg-contact.webp"
      />

      {/* Contact Info */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <AnimatedSection key={index} delay={0.1 * index}>
                  <GlassCard hover className="text-center p-6 h-full">
                    <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-yellow" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                    {info.href ? (
                      <a 
                        href={info.href}
                        className="text-gray-900 font-medium hover:text-yellow transition-colors block mb-1"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <div className="text-gray-900 font-medium mb-1">{info.content}</div>
                    )}
                    <p className="text-gray-600 text-sm">{info.subtext}</p>
                  </GlassCard>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Services */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <AnimatedSection direction="left">
              <div className="w-full">
                <ContactTabs />
              </div>
            </AnimatedSection>

            {/* Services */}
            <AnimatedSection direction="right">
              <div className="sticky top-32 self-start space-y-8 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Nos <span className="text-yellow">Services</span>
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Découvrez tout ce que nous mettons en œuvre pour vous garantir
                    la meilleure expérience client.
                  </p>
                </div>

                <div className="space-y-4">
                  {services.map((service, index) => (
                    <AnimatedSection key={index} delay={0.1 * index}>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-2 h-2 bg-yellow rounded-full flex-shrink-0" />
                        <span className="text-gray-800 font-medium">{service}</span>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>

                <GlassCard className="p-6 mt-8">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Urgence toiture ?</h3>
                    <p className="text-gray-600 mb-4">
                      En cas d'urgence (fuite, tempête, etc.), contactez-nous directement par téléphone.
                    </p>
                    <a
                      href={generalSettings.phone ? `tel:${generalSettings.phone.replace(/\s/g, '')}` : "tel:0388756653"}
                      className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Appel d'urgence
                    </a>
                  </div>
                </GlassCard>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Avis Google */}
      <AnimatedSection>
        <section className="py-12 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ils nous font <span className="text-yellow">confiance</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez les avis de nos clients sur la qualité de nos prestations
              </p>
            </div>
            <GoogleReviewsCarousel />
          </div>
        </section>
      </AnimatedSection>

      {/* Map Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Zone d'<span className="text-yellow">Intervention</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nous intervenons dans tout le Bas-Rhin et les départements limitrophes 
                pour tous vos projets de couverture et zinguerie.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-slate-100 rounded-2xl p-8 text-center">
              <MapPin className="w-16 h-16 text-yellow mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">35 km autour de Formdetoit</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>• Strasbourg</div>
                <div>• Illkirch-Graffenstaden</div>
                <div>• Obernai</div>
                <div>• Geispolsheim</div>
                <div>• Molsheim</div>
                <div>• Erstein</div>
                <div>• Schiltigheim</div>
                <div>• Ostwald</div>
              </div>
              <p className="text-gray-600 mt-6">
                Et bien plus de villages dans un rayon de <strong>35 km</strong> autour de Formdetoit (Eschau)
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}