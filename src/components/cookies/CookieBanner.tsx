'use client';

import { useEffect } from 'react';

/**
 * Composant de bannière cookies RGPD avec Tarteaucitron.js
 *
 * Conformité RGPD pour Google Analytics et autres services
 *
 * Features:
 * - Consent Mode v2 (Google)
 * - Stockage du consentement
 * - Design moderne glassmorphism
 * - Bloque GA jusqu'à consentement
 */
export default function CookieBanner() {
  useEffect(() => {
    // Attendre que Tarteaucitron soit chargé
    const initTarteaucitron = () => {
      // @ts-ignore - tarteaucitron est chargé via script externe
      if (typeof window === 'undefined' || typeof window.tarteaucitron === 'undefined') {
        // Script pas encore chargé, réessayer dans 100ms
        setTimeout(initTarteaucitron, 100);
        return;
      }

      // Configuration Tarteaucitron
      // @ts-ignore
      window.tarteaucitronForceLanguage = 'fr';

      // @ts-ignore
      window.tarteaucitronCustomText = {
        // Personnalisation des textes
        alertBigPrivacy: 'Confidentialité',
        alertBig: 'Ce site utilise des cookies pour améliorer votre expérience.',
        alertBigClick: 'En continuant à naviguer, vous acceptez notre utilisation des cookies.',
        alertSmall: 'Gestion des cookies',
        acceptAll: 'Tout accepter',
        personalize: 'Personnaliser',
        close: 'Fermer',

        // Google Analytics
        googleanalytics: {
          title: 'Google Analytics',
          description: 'Nous aide à comprendre comment vous utilisez notre site (anonyme).',
        },
      };

      // @ts-ignore
      tarteaucitron.init({
        // Paramètres de confidentialité
        privacyUrl: '/politique-confidentialite', // URL de votre politique de confidentialité

        // Position de la bannière
        hashtag: '#tarteaucitron', // Ancre pour ouvrir le panneau
        cookieName: 'formdetoit_consent', // Nom du cookie de consentement

        // Orientation (top/middle/bottom)
        orientation: 'bottom',

        // Grouper les services par finalité
        groupServices: false,

        // Afficher le bandeau de consentement
        showAlertSmall: true, // Petite bannière en bas après consentement
        cookieslist: true, // Afficher la liste des cookies

        // Bloquer les services par défaut (important RGPD)
        showIcon: true, // Icône flottante pour rouvrir les paramètres

        // Position de l'icône (BottomRight/BottomLeft/TopRight/TopLeft)
        iconPosition: 'BottomLeft',

        // Afficher la croix pour fermer
        closePopup: false,

        // Ne pas afficher le disclaimer
        showAlertBig: true,

        // Accepter automatiquement tous les cookies (RGPD = false obligatoire)
        AcceptAllCta: true,

        // Haute disponibilité (fallback si CDN down)
        highPrivacy: true,

        // Durée du consentement (en jours)
        cookieExpire: 365,

        // Masquer les services refusés
        handleBrowserDNTRequest: false,

        // Supprimer les cookies refusés
        removeCredit: true, // Retire le crédit "Powered by tarteaucitron.js"

        // Plus d'infos
        moreInfoLink: true,

        // Lire plus
        readmoreLink: '/politique-confidentialite',

        // Texte obligatoire
        mandatory: false,

        // Google Consent Mode v2
        useExternalCss: true, // Utilise notre CSS custom

        // Mode de consentement Google
        googleConsentMode: true,
      });

      // Ajouter Google Analytics si NEXT_PUBLIC_GA_ID est défini
      if (process.env.NEXT_PUBLIC_GA_ID) {
        // @ts-ignore
        tarteaucitron.user.gtagUa = process.env.NEXT_PUBLIC_GA_ID;
        // @ts-ignore
        tarteaucitron.user.gtagMore = function () {
          /* Ajoutez du code GA personnalisé ici si besoin */
        };
        // @ts-ignore
        (tarteaucitron.job = tarteaucitron.job || []).push('gtag');
      }
    };

    // Démarrer l'initialisation
    initTarteaucitron();
  }, []);

  return null; // Le composant ne rend rien, Tarteaucitron gère l'UI
}
