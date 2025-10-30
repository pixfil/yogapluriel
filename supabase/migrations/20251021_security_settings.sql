-- Migration: Ajout des paramètres de sécurité (reCAPTCHA v3)
-- Date: 2025-10-21
-- Description: Ajoute l'entrée 'security' dans site_settings pour configurer Google reCAPTCHA v3

-- Insérer les paramètres de sécurité avec des valeurs par défaut vides
INSERT INTO site_settings (key, value, description)
VALUES (
  'security',
  '{"recaptcha_enabled": false, "recaptcha_site_key": "", "recaptcha_secret_key": ""}'::jsonb,
  'Paramètres de sécurité et protection anti-spam (Google reCAPTCHA v3)'
)
ON CONFLICT (key) DO NOTHING;

-- Commentaire sur la structure
COMMENT ON TABLE site_settings IS 'Paramètres globaux du site stockés en format clé-valeur JSON';

-- Note: La structure attendue pour la clé "security":
-- {
--   "recaptcha_enabled": boolean,     // Active/désactive reCAPTCHA v3 sur tous les formulaires
--   "recaptcha_site_key": string,     // Clé publique reCAPTCHA (affichée côté client)
--   "recaptcha_secret_key": string    // Clé secrète reCAPTCHA (utilisée côté serveur uniquement)
-- }
