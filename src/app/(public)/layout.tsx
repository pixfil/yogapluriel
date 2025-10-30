import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Chatbot from "@/components/chatbot/Chatbot";
import AIChatbot from "@/components/chatbot/AIChatbot";
import EmergencyButton from "@/components/ui/emergency-button";
import StickyCTA from "@/components/ui/sticky-cta";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import { getSeoSettings, getAnalyticsSettings, getGeneralSettings, getFeaturesSettings, getSecuritySettings } from "@/app/actions/settings";
import { getAIChatbotSettings } from "@/app/actions/ai-chatbot-settings";
import { getProviderDisplayName } from "@/lib/ai-helpers";
import RecaptchaProvider from "@/components/recaptcha/RecaptchaProvider";
import HighlightedNotification from "@/components/ui/HighlightedNotification";
import { getHighlightedProject, getHighlightedJob } from "@/lib/supabase-queries";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

/**
 * Generate metadata dynamically from SEO settings
 */
export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();

  return {
    title: seoSettings.default_title || "Formdetoit - Artisan Couvreur-Zingueur Bas-Rhin | Strasbourg",
    description: seoSettings.default_description || "Formdetoit, artisan couvreur-zingueur certifié RGE dans le Bas-Rhin. Spécialiste en couverture, isolation, étanchéité et zinguerie.",
    keywords: seoSettings.keywords?.split(',').map(k => k.trim()) || ["couvreur", "zingueur", "Strasbourg", "Bas-Rhin", "Alsace"],
    authors: [{ name: seoSettings.company_name || "Formdetoit" }],
    creator: seoSettings.company_name || "Formdetoit",
    publisher: seoSettings.company_name || "Formdetoit",
    metadataBase: new URL("https://formdetoit.fr"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: seoSettings.default_title || "Formdetoit - Artisan Couvreur-Zingueur Bas-Rhin",
      description: seoSettings.default_description || "Artisan couvreur-zingueur certifié RGE dans le Bas-Rhin.",
      url: "https://formdetoit.fr",
      siteName: seoSettings.company_name || "Formdetoit",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: seoSettings.default_og_image || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: seoSettings.company_name || "Formdetoit"
        }
      ]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings for analytics and structured data
  const [analyticsSettings, seoSettings, generalSettings, featuresSettings, securitySettings, aiSettings, highlightedProject, highlightedJob] = await Promise.all([
    getAnalyticsSettings(),
    getSeoSettings(),
    getGeneralSettings(),
    getFeaturesSettings(),
    getSecuritySettings(),
    getAIChatbotSettings(),
    getHighlightedProject(),
    getHighlightedJob(),
  ]);

  // Generate JSON-LD structured data for local business
  const structuredDataBase = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: seoSettings.company_name || "FormDeToit",
    description: seoSettings.default_description || "Artisan couvreur-zingueur certifié RGE",
    url: "https://formdetoit.fr",
    logo: "https://formdetoit.fr/formdetoit_logo_noir.webp",
    image: seoSettings.default_og_image || "https://formdetoit.fr/og-image.jpg",
    areaServed: {
      "@type": "GeoCircle",
      name: seoSettings.service_area || "Strasbourg et environs",
    },
    priceRange: "€€",
  };

  // Add optional fields only if they have values
  const structuredData: any = { ...structuredDataBase };

  if (generalSettings.phone) {
    structuredData.telephone = generalSettings.phone;
  }

  if (generalSettings.email) {
    structuredData.email = generalSettings.email;
  }

  if (generalSettings.address) {
    structuredData.address = {
      "@type": "PostalAddress",
      streetAddress: generalSettings.address,
      addressLocality: "Strasbourg",
      addressRegion: "Grand Est",
      postalCode: "67000",
      addressCountry: "FR"
    };
  }

  const socialLinks = [
    generalSettings.facebook,
    generalSettings.instagram,
    generalSettings.linkedin,
  ].filter(Boolean);

  if (socialLinks.length > 0) {
    structuredData.sameAs = socialLinks;
  }

  if (generalSettings.hours) {
    structuredData.openingHours = generalSettings.hours;
  }

  return (
    <>
      {/* Analytics Scripts */}
      <AnalyticsScripts settings={analyticsSettings} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <RecaptchaProvider
        recaptchaEnabled={securitySettings?.recaptcha_enabled || false}
        siteKey={securitySettings?.recaptcha_site_key || ""}
      >
        <div className={`${inter.variable} ${outfit.variable} font-sans bg-formdetoit text-formdetoit antialiased`} style={{paddingTop: "6rem"}}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />

          {/* Chatbot - Afficher le bon type selon la configuration */}
          {featuresSettings?.chatbot_enabled !== false && (
            aiSettings.chatbot_mode === 'ai' ? (
              <AIChatbot providerName={getProviderDisplayName(aiSettings.ai_provider)} />
            ) : (
              <Chatbot />
            )
          )}

          <EmergencyButton />
          <StickyCTA />

          {/* Highlighted Notifications */}
          {highlightedProject && (
            <HighlightedNotification
              type="project"
              title={highlightedProject.title}
              slug={highlightedProject.slug}
              description={highlightedProject.description}
              image={highlightedProject.main_image}
              index={0}
            />
          )}
          {highlightedJob && (
            <HighlightedNotification
              type="job"
              title={highlightedJob.title}
              id={highlightedJob.id}
              index={highlightedProject ? 1 : 0}
            />
          )}
        </div>
      </RecaptchaProvider>
    </>
  );
}