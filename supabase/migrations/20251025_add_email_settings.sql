-- =============================================
-- Email Settings - Configuration des emails
-- Date: 2025-10-25
-- =============================================

-- Insert initial email settings ou mettre à jour si déjà existant
INSERT INTO site_settings (key, value, description) VALUES
  (
    'emails',
    '{"notification_emails": ["contact@formdetoit.fr"], "test_mode_enabled": false, "test_mode_recipient": "philippeheit@gmail.com"}'::jsonb,
    'Configuration des emails (destinataires notifications admin + mode test)'
  )
ON CONFLICT (key) DO UPDATE SET
  value =
    -- Conserver les notification_emails existants s'ils existent
    jsonb_build_object(
      'notification_emails',
      COALESCE(EXCLUDED.value->'notification_emails', site_settings.value->'notification_emails', '["contact@formdetoit.fr"]'::jsonb),
      'test_mode_enabled',
      COALESCE((EXCLUDED.value->>'test_mode_enabled')::boolean, false),
      'test_mode_recipient',
      COALESCE(EXCLUDED.value->>'test_mode_recipient', 'philippeheit@gmail.com')
    ),
  description = EXCLUDED.description;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT
  key,
  value,
  description
FROM site_settings
WHERE key = 'emails';
