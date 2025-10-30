/**
 * Déclarations TypeScript pour l'API Google reCAPTCHA v3
 */

interface ReCaptchaInstance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render: (container: string | HTMLElement, parameters: object) => void;
}

interface Window {
  grecaptcha?: ReCaptchaInstance;
}
