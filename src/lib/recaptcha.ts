import { getSecuritySettings } from "@/app/actions/settings";

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

/**
 * Valide un token reCAPTCHA v3 auprès de Google
 *
 * @param token - Le token reCAPTCHA généré côté client
 * @param expectedAction - L'action attendue (ex: "contact_form")
 * @param minScore - Score minimum acceptable (0-1, défaut: 0.5)
 * @returns true si le token est valide et le score est suffisant
 */
export async function validateRecaptchaToken(
  token: string | null,
  expectedAction: string,
  minScore: number = 0.5
): Promise<{ success: boolean; error?: string; score?: number }> {
  try {
    // Récupérer les settings de sécurité
    const securitySettings = await getSecuritySettings();

    // Si reCAPTCHA désactivé, accepter automatiquement
    if (!securitySettings.recaptcha_enabled) {
      console.log("reCAPTCHA désactivé, validation automatique");
      return { success: true, score: 1 };
    }

    // Si reCAPTCHA activé mais pas de token, rejeter
    if (!token) {
      console.warn("reCAPTCHA activé mais aucun token fourni");
      return { success: false, error: "Token reCAPTCHA manquant" };
    }

    // Vérifier que la secret key est configurée
    if (!securitySettings.recaptcha_secret_key) {
      console.error("reCAPTCHA activé mais secret key manquante dans les settings");
      return { success: false, error: "Configuration reCAPTCHA invalide" };
    }

    // Valider le token auprès de Google
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: securitySettings.recaptcha_secret_key,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error("Erreur HTTP lors de la validation reCAPTCHA:", response.status);
      return { success: false, error: "Erreur de validation reCAPTCHA" };
    }

    const data: RecaptchaResponse = await response.json();

    // Vérifier le succès de base
    if (!data.success) {
      console.warn("reCAPTCHA validation échec:", data["error-codes"]);
      return {
        success: false,
        error: `Validation reCAPTCHA échouée: ${data["error-codes"]?.join(", ")}`,
      };
    }

    // Vérifier l'action
    if (data.action !== expectedAction) {
      console.warn(`Action reCAPTCHA incorrecte. Attendu: ${expectedAction}, Reçu: ${data.action}`);
      return {
        success: false,
        error: "Action reCAPTCHA incorrecte",
        score: data.score,
      };
    }

    // Vérifier le score
    if (data.score < minScore) {
      console.warn(`Score reCAPTCHA trop bas: ${data.score} (minimum: ${minScore})`);
      return {
        success: false,
        error: `Score de sécurité insuffisant (${data.score.toFixed(2)})`,
        score: data.score,
      };
    }

    console.log(`reCAPTCHA validé avec succès. Score: ${data.score}, Action: ${data.action}`);
    return { success: true, score: data.score };
  } catch (error) {
    console.error("Erreur lors de la validation reCAPTCHA:", error);
    return {
      success: false,
      error: "Erreur serveur lors de la validation reCAPTCHA",
    };
  }
}
