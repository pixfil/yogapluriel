"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ReactNode, createContext, useContext } from "react";

interface RecaptchaProviderProps {
  children: ReactNode;
  recaptchaEnabled: boolean;
  siteKey: string;
}

// Context pour fournir une fonction executeRecaptcha même quand reCAPTCHA est désactivé
const MockRecaptchaContext = createContext<{
  executeRecaptcha: ((action?: string) => Promise<string>) | undefined;
}>({
  executeRecaptcha: undefined,
});

export const useMockRecaptcha = () => useContext(MockRecaptchaContext);

/**
 * Wrapper conditionnel pour GoogleReCaptchaProvider
 * Ne charge le script Google reCAPTCHA que si activé dans les settings
 * Fournit un mock provider si désactivé pour éviter les erreurs
 */
export default function RecaptchaProvider({
  children,
  recaptchaEnabled,
  siteKey,
}: RecaptchaProviderProps) {
  // Si reCAPTCHA désactivé ou pas de siteKey, utiliser un mock provider
  if (!recaptchaEnabled || !siteKey) {
    return (
      <MockRecaptchaContext.Provider value={{ executeRecaptcha: undefined }}>
        {children}
      </MockRecaptchaContext.Provider>
    );
  }

  // Sinon, wrapper avec GoogleReCaptchaProvider
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
