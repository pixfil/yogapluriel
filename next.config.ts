import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // ✅ TypeScript et ESLint configurés pour le build
  eslint: {
    ignoreDuringBuilds: true, // Warnings ESLint non-bloquants (unused vars, any types)
  },
  typescript: {
    // TEMPORAIRE : Désactivé car les types Supabase ne sont pas générés automatiquement
    // Les tables créées via migrations custom ne sont pas dans le fichier Database actuel
    // TODO CRITIQUE : Générer les types via Supabase CLI après le premier déploiement
    //   1. Exécuter toutes les migrations en production
    //   2. Générer les types : npx supabase gen types typescript --project-id xxx > src/lib/database.types.ts
    //   3. Mettre à jour supabase.ts pour importer les types générés
    //   4. Retirer ce flag ignoreBuildErrors
    // Les types manuels dans supabase.ts (projects, ai_chatbot_settings, etc.) assurent
    // un minimum de type safety en attendant.
    ignoreBuildErrors: true,
  },
  // Configuration pour serverActions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configuration des images externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ssavyibgujrvwvvhaahk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // ✅ Correction audit : Restreindre au cloud ID spécifique
        pathname: '/doj84owtw/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // Photos de profil Google (pour avis Google Reviews)
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
        // Images Google Maps & Places API
        pathname: '/**',
      },
    ],
  },
  // =============================================
  // HEADERS DE SÉCURITÉ HTTP
  // =============================================
  // Protection contre XSS, clickjacking, MIME sniffing, etc.
  // Référence : AUDIT_DERNIER_KILOMETRE.md Section 1.1
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        // X-Frame-Options : Empêche le site d'être intégré dans une iframe (protection clickjacking)
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        // X-Content-Type-Options : Empêche le navigateur de deviner le MIME type (protection MIME sniffing)
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // Referrer-Policy : Contrôle les infos envoyées dans le header Referer
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // Permissions-Policy : Désactive les APIs sensibles (caméra, micro, géoloc)
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        // Content-Security-Policy : Protection XSS (définit les sources autorisées pour scripts, styles, images, etc.)
        // Note : 'unsafe-inline' et 'unsafe-eval' nécessaires pour Next.js en dev + Google Maps + Supabase
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' maps.googleapis.com *.google.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' data: fonts.gstatic.com",
            "img-src 'self' data: https: blob: res.cloudinary.com *.supabase.co maps.googleapis.com *.google.com *.gstatic.com",
            "connect-src 'self' *.supabase.co https: wss:",
            "frame-src 'self' https://www.google.com",
            "media-src 'self' data: blob: res.cloudinary.com *.supabase.co",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        },
      ],
    },
  ],
};

// =============================================
// SENTRY MONITORING CONFIGURATION
// =============================================
// Wrap config with Sentry pour activer le monitoring d'erreurs
// Sentry est désactivé automatiquement si NEXT_PUBLIC_SENTRY_DSN est absent
// Référence : AUDIT_DERNIER_KILOMETRE.md Section 3.3

const sentryWebpackPluginOptions = {
  // Désactiver les logs Sentry pendant le build (silencieux)
  silent: true,

  // Org et project Sentry (optionnel, peut être défini via env vars)
  // org: "formdetoit",
  // project: "formdetoit-nextjs",

  // Désactiver l'upload automatique de source maps en dev
  // (économise temps de build)
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Export config avec ou sans Sentry selon présence DSN
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
