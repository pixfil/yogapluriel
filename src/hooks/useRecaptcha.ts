import { useCallback, useEffect, useState } from "react";

/**
 * Hook pour générer des tokens reCAPTCHA v3
 * Gère automatiquement le cas où reCAPTCHA est désactivé
 *
 * ⚠️ Ce hook utilise l'API native grecaptcha au lieu du hook React
 * pour éviter les erreurs quand reCAPTCHA est désactivé dans les settings
 *
 * Usage:
 * ```tsx
 * const { executeRecaptcha } = useRecaptcha();
 *
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha("contact_form");
 *   // Envoyer le token avec les données du formulaire
 * }
 * ```
 */
export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Vérifier si grecaptcha est disponible sur window
    const checkRecaptcha = () => {
      if (typeof window !== "undefined" && window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          console.log("reCAPTCHA chargé et prêt");
        });
      } else {
        console.log("reCAPTCHA non disponible (désactivé dans les settings)");
        setIsReady(false);
      }
    };

    checkRecaptcha();

    // Re-check après un délai au cas où le script se charge après le component
    const timeout = setTimeout(checkRecaptcha, 1000);
    return () => clearTimeout(timeout);
  }, []);

  /**
   * Génère un token reCAPTCHA pour une action donnée
   * @param action - L'action à enregistrer (ex: "contact_form", "quote_request")
   * @returns Le token reCAPTCHA ou null si reCAPTCHA est désactivé
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      // Si reCAPTCHA n'est pas disponible (désactivé dans les settings)
      if (typeof window === "undefined" || !window.grecaptcha?.execute) {
        console.log("reCAPTCHA désactivé, envoi sans token");
        return null;
      }

      try {
        // Obtenir la clé publique depuis le script reCAPTCHA
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!siteKey) {
          console.log("Pas de clé reCAPTCHA configurée, envoi sans token");
          return null;
        }

        const token = await window.grecaptcha.execute(siteKey, { action });
        console.log(`reCAPTCHA token généré pour action: ${action}`);
        return token;
      } catch (error) {
        console.error("Erreur lors de la génération du token reCAPTCHA:", error);
        // En cas d'erreur, retourner null pour ne pas bloquer l'envoi
        return null;
      }
    },
    []
  );

  return {
    executeRecaptcha,
    isReady,
  };
}
