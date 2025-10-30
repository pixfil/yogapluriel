-- =============================================
-- Add Features Settings (Chatbot Toggle)
-- Date: 2025-10-23
-- Description: Ajout des paramètres pour l'onglet Fonctionnalités (chatbot)
-- =============================================

-- =============================================
-- 1. INSERT NEW SETTINGS
-- =============================================

-- Onglet Fonctionnalités: Activation/désactivation des fonctionnalités du site
INSERT INTO site_settings (key, value, description) VALUES
  (
    'features',
    '{
      "chatbot_enabled": true
    }'::jsonb,
    'Paramètres des fonctionnalités du site (chatbot, etc.)'
  )
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 2. HELPER FUNCTIONS
-- =============================================

-- Function to get features settings
CREATE OR REPLACE FUNCTION get_features_settings()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = 'features');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. VERIFICATION
-- =============================================

SELECT
  key,
  value,
  description
FROM site_settings
WHERE key = 'features'
ORDER BY key;
