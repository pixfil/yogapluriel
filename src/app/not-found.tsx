'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // Logger la 404 dans la base de données (appel non-bloquant)
    // Cet appel permet de tracker les URLs 404 pour créer des redirections si nécessaire
    fetch('/api/log-404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname || window.location.pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      }),
    }).catch((err) => {
      // Erreur silencieuse : ne pas bloquer l'affichage de la page 404
      console.error('Failed to log 404:', err);
    });
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-cover bg-no-repeat" style={{ backgroundImage: "url('/background/bg-aluprefa.webp')", backgroundPosition: "center 55%" }}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-2xl w-full text-center relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl border border-white/30">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/formdetoit_logo_noir.webp"
            alt="FormDeToit"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* 404 Number */}
        <div className="mb-8 relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-gray-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl md:text-7xl font-bold text-gray-900">
              Perdu ?
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-12 mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Cette page n'existe pas
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Il semblerait que cette page ait été retirée ou n'ait jamais existé.
            Peut-être qu'un de nos artisans couvreurs l'a emportée sur le toit !
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-yellow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow transition-all shadow-lg hover:shadow-xl min-w-[200px]"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>

          <Link
            href="/nos-realisations"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow transition-all min-w-[200px]"
          >
            <Search className="w-5 h-5 mr-2" />
            Nos réalisations
          </Link>
        </div>

        {/* Additional links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Vous cherchez peut-être :</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/prestations"
              className="text-sm text-gray-600 hover:text-yellow hover:underline transition-colors"
            >
              Nos prestations
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/a-propos"
              className="text-sm text-gray-600 hover:text-yellow hover:underline transition-colors"
            >
              À propos
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-yellow hover:underline transition-colors"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/notre-equipe"
              className="text-sm text-gray-600 hover:text-yellow hover:underline transition-colors"
            >
              Notre équipe
            </Link>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Revenir à la page précédente
        </button>
      </div>
    </div>
  );
}
