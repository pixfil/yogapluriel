-- =============================================================================
-- SITE SETTINGS - Configuration Globale
-- =============================================================================
-- Dépendances : 002_user_profiles.sql
-- Stockage key-value (JSONB) pour toute la configuration du site
-- =============================================================================

-- =============================================================================
-- 1. TABLE: SITE_SETTINGS
-- =============================================================================
-- Système flexible de configuration avec stockage JSONB
-- Permet de modifier des paramètres sans redéployer l'application

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clé unique identifiant le setting (ex: "general", "email", "maintenance")
  key TEXT UNIQUE NOT NULL,

  -- Valeur JSONB flexible (structure dépend de la clé)
  value JSONB NOT NULL DEFAULT '{}',

  -- Description pour l'admin
  description TEXT,

  -- Métadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide par clé (déjà assuré par UNIQUE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

COMMENT ON TABLE site_settings IS 'Global site configuration stored as key-value pairs (JSONB)';
COMMENT ON COLUMN site_settings.key IS 'Unique setting key (e.g., "general", "email", "maintenance")';
COMMENT ON COLUMN site_settings.value IS 'JSONB value with flexible structure per key';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut LIRE les settings (nécessaire pour maintenance mode)
CREATE POLICY "Public can view settings"
  ON site_settings FOR SELECT
  USING (true);

-- Seuls les admins peuvent modifier les settings
CREATE POLICY "Admins can manage settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- =============================================================================
-- 4. HELPER FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fonction: get_setting(key)
-- -----------------------------------------------------------------------------
-- Récupère la valeur d'un setting par sa clé
-- Usage: SELECT get_setting('maintenance');

CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT value
    FROM site_settings
    WHERE key = setting_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_setting IS 'Get a setting value by key';

-- -----------------------------------------------------------------------------
-- Fonction: is_maintenance_mode()
-- -----------------------------------------------------------------------------
-- Vérifie si le mode maintenance est activé
-- Usage: SELECT is_maintenance_mode();

CREATE OR REPLACE FUNCTION is_maintenance_mode()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (value->>'enabled')::boolean
     FROM site_settings
     WHERE key = 'maintenance'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_maintenance_mode IS 'Check if maintenance mode is currently enabled';

-- =============================================================================
-- 5. DONNÉES INITIALES
-- =============================================================================

-- Settings par défaut - À personnaliser selon vos besoins
-- Ces valeurs peuvent être modifiées via l'admin panel

INSERT INTO site_settings (key, value, description) VALUES

-- Configuration générale du site
(
  'general',
  '{
    "siteName": "Mon Application",
    "siteDescription": "Application moderne construite avec Next.js et Supabase",
    "contactEmail": "contact@example.com",
    "companyName": "Ma Société",
    "timezone": "Europe/Paris",
    "language": "fr",
    "currency": "EUR"
  }'::jsonb,
  'Configuration générale du site'
),

-- Configuration email
(
  'email',
  '{
    "testMode": true,
    "testRecipient": "test@example.com",
    "fromName": "Mon Application",
    "fromEmail": "noreply@example.com",
    "replyTo": "contact@example.com"
  }'::jsonb,
  'Configuration du système d''email'
),

-- Mode maintenance
(
  'maintenance',
  '{
    "enabled": false,
    "title": "Maintenance en cours",
    "message": "Nous effectuons une maintenance pour améliorer votre expérience. Nous reviendrons très bientôt !",
    "allowedIps": [],
    "estimatedEnd": null
  }'::jsonb,
  'Configuration du mode maintenance'
),

-- Features activées/désactivées
(
  'features',
  '{
    "blog": false,
    "chatbot": false,
    "newsletter": true,
    "comments": false,
    "socialSharing": true,
    "analytics": true
  }'::jsonb,
  'Features activées/désactivées sur le site'
),

-- Sécurité & spam
(
  'security',
  '{
    "rateLimitEnabled": true,
    "spamDetectionEnabled": true,
    "recaptchaEnabled": false,
    "maxLoginAttempts": 5,
    "loginLockoutMinutes": 15
  }'::jsonb,
  'Configuration de la sécurité'
),

-- SEO
(
  'seo',
  '{
    "defaultTitle": "Mon Application",
    "defaultDescription": "Application moderne construite avec Next.js et Supabase",
    "ogImage": "/og-image.png",
    "twitterHandle": "@myapp",
    "googleAnalyticsId": null,
    "googleTagManagerId": null
  }'::jsonb,
  'Configuration SEO et analytics'
),

-- Réseaux sociaux
(
  'social',
  '{
    "facebook": null,
    "twitter": null,
    "linkedin": null,
    "instagram": null,
    "github": null,
    "youtube": null
  }'::jsonb,
  'Liens vers les réseaux sociaux'
),

-- Notifications & popups
(
  'notifications',
  '{
    "enabled": true,
    "showNewsletter": true,
    "showCookieConsent": true,
    "cookieConsentMessage": "Nous utilisons des cookies pour améliorer votre expérience."
  }'::jsonb,
  'Configuration des notifications et popups'
)

ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- ✅ SITE SETTINGS CRÉÉ
-- =============================================================================
-- Table créée:
--   - site_settings (configuration key-value flexible)
--
-- Fonctions helper:
--   - get_setting(key) → jsonb
--   - is_maintenance_mode() → boolean
--
-- Settings par défaut insérés:
--   - general (nom site, description, contact)
--   - email (configuration email)
--   - maintenance (mode maintenance)
--   - features (features activées)
--   - security (sécurité & spam)
--   - seo (meta tags, analytics)
--   - social (liens réseaux sociaux)
--   - notifications (popups, cookies)
--
-- RLS activé (lecture publique, modification admin uniquement)
--
-- Prochaine étape : 01_content/ (tables de contenu optionnelles)
-- =============================================================================
