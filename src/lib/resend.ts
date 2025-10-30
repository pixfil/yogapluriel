import { Resend } from 'resend';
import { ReactElement } from 'react';

// Configuration Resend
// Si RESEND_API_KEY n'est pas défini, le client sera null
// Les fonctions d'envoi d'email devront vérifier si resend est configuré avant d'envoyer
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not configured. Email sending will be disabled.');
}

export const resend = API_KEY ? new Resend(API_KEY) : null;
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contact@formdetoit.fr';
export const FROM_NAME = 'FormDeToit';
export const isResendConfigured = !!API_KEY;

// Mode test emails (redirige tous les emails vers une adresse de test)
// Fallback sur les variables d'environnement si pas configuré dans les settings
const ENV_EMAIL_TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';
const ENV_EMAIL_TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT || 'philippeheit@gmail.com';

/**
 * Helper pour envoyer un email avec un template React Email
 * Gère automatiquement :
 * - Rendu du template React en HTML
 * - Mode test (redirection vers philippeheit@gmail.com)
 * - Logging des erreurs
 */
export async function sendEmailWithTemplate({
  to,
  subject,
  template,
  testModeEnabled,
  testRecipient,
}: {
  to: string | string[];
  subject: string;
  template: ReactElement;
  testModeEnabled?: boolean;
  testRecipient?: string;
}): Promise<{ success: boolean; error?: string; resendId?: string }> {
  try {
    // Check if Resend is configured
    if (!isResendConfigured || !resend) {
      console.error('Resend not configured');
      return {
        success: false,
        error: 'Service d\'envoi d\'emails non configuré',
      };
    }

    // Mode test : utiliser les paramètres passés, sinon fallback sur .env
    const finalTestModeEnabled = testModeEnabled ?? ENV_EMAIL_TEST_MODE;
    const finalTestRecipient = testRecipient || ENV_EMAIL_TEST_RECIPIENT;

    // Mode test : rediriger vers adresse de test
    let finalTo = Array.isArray(to) ? to : [to];
    let finalSubject = subject;

    if (finalTestModeEnabled) {
      console.log(`[EMAIL TEST MODE] Email redirigé vers ${finalTestRecipient}`);
      console.log(`Original destinataire(s): ${finalTo.join(', ')}`);
      finalTo = [finalTestRecipient];
      finalSubject = `[TEST - ${finalTo.join(', ')}] ${subject}`;
    }

    // Resend supporte l'envoi de React components directement
    // Pas besoin de render() manuel !
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: finalTo,
      subject: finalSubject,
      react: template, // Utiliser 'react' au lieu de 'html'
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`Email envoyé avec succès: ${data?.id}`);
    return {
      success: true,
      resendId: data?.id,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue',
    };
  }
}
