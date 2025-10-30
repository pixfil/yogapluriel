'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import GlassCard from '@/components/ui/glass-card';
import CTAButton from '@/components/ui/cta-button';
import { AlertTriangle, Home, Mail, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Page d'erreur globale (Next.js Error Boundary)
 *
 * Affichée automatiquement en cas d'erreur runtime dans l'application.
 *
 * Features:
 * - Design cohérent avec le site (GlassCard + gradient)
 * - Log automatique vers Sentry
 * - Actions utilisateur (retry, home, contact)
 * - Message user-friendly (pas de stack trace exposée)
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur vers Sentry en production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: 'app-error',
        },
        contexts: {
          errorInfo: {
            digest: error.digest,
            message: error.message,
          },
        },
      });
    } else {
      // En développement, log dans la console
      console.error('Error caught by error.tsx:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <GlassCard className="p-8 md:p-12 text-center">
          {/* Icône d'erreur */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-yellow/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-yellow" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Oups, une erreur est survenue
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-2 text-lg">
            Nous sommes désolés, quelque chose s'est mal passé.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Notre équipe a été notifiée et nous travaillons à résoudre le problème.
          </p>

          {/* Error digest (si disponible) */}
          {error.digest && (
            <div className="mb-8 p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-gray-500 font-mono">
                ID d'erreur : {error.digest}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Bouton retry */}
            <CTAButton
              onClick={reset}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </CTAButton>

            {/* Bouton accueil */}
            <Link href="/" className="w-full sm:w-auto">
              <CTAButton
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </CTAButton>
            </Link>
          </div>

          {/* Lien contact */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Le problème persiste ?
            </p>
            <Link href="/contact">
              <CTAButton variant="ghost" size="sm">
                <Mail className="w-4 h-4" />
                Contactez-nous
              </CTAButton>
            </Link>
          </div>

          {/* Message dev (uniquement en développement) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Détails techniques (dev only)
              </summary>
              <div className="bg-slate-900 text-white p-4 rounded-lg overflow-auto max-h-64">
                <p className="text-xs font-mono whitespace-pre-wrap break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs mt-2 opacity-75">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
