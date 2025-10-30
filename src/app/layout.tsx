import "./globals.css";
import type { Metadata } from 'next';
import CookieBanner from '@/components/cookies/CookieBanner';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'FormDeToit - Couvreur professionnel à Strasbourg',
    template: '%s | FormDeToit',
  },
  description: 'FormDeToit, entreprise de couverture professionnelle à Strasbourg. Spécialistes en toiture, zinguerie, isolation et installation de Velux. Artisans couvreurs qualifiés RGE.',
  keywords: [
    'couvreur',
    'couverture',
    'toiture',
    'Strasbourg',
    'zinguerie',
    'isolation',
    'Velux',
    'RGE',
    'artisan couvreur',
    'rénovation toiture',
  ],
  authors: [{ name: 'FormDeToit' }],
  creator: 'FormDeToit',
  publisher: 'FormDeToit',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://formdetoit.fr'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/formdetoit_favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://formdetoit.fr',
    siteName: 'FormDeToit',
    title: 'FormDeToit - Couvreur professionnel à Strasbourg',
    description: 'Entreprise de couverture professionnelle à Strasbourg. Spécialistes en toiture, zinguerie, isolation et installation de Velux.',
    images: [
      {
        url: '/formdetoit_logo_noir.webp',
        width: 1200,
        height: 630,
        alt: 'FormDeToit - Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FormDeToit - Couvreur professionnel à Strasbourg',
    description: 'Entreprise de couverture professionnelle à Strasbourg. Spécialistes en toiture, zinguerie, isolation et installation de Velux.',
    images: ['/formdetoit_logo_noir.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification here if available
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/formdetoit_favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Tarteaucitron.js CSS custom */}
        <link rel="stylesheet" href="/tarteaucitron.css" />
      </head>
      <body className="antialiased">
        {children}

        {/* Tarteaucitron.js - Gestion cookies RGPD */}
        <Script
          src="https://cdn.jsdelivr.net/gh/AmauriC/tarteaucitron.js@1.14.0/tarteaucitron.min.js"
          strategy="afterInteractive"
        />
        <CookieBanner />
      </body>
    </html>
  );
}
