-- =============================================
-- Site Settings - Configuration globale du site
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. CREATE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- 2. INDEXES
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- =============================================
-- 3. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read all settings (for maintenance mode check)
CREATE POLICY "Public can view settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only authenticated users can modify settings
CREATE POLICY "Authenticated users can manage settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- 4. INSERT INITIAL DATA
-- =============================================

INSERT INTO site_settings (key, value, description) VALUES
  (
    'maintenance',
    '{"enabled": false, "message": "Nous effectuons une maintenance pour améliorer votre expérience. Nous reviendrons très bientôt !", "title": "Maintenance en cours"}'::jsonb,
    'Configuration du mode maintenance du site'
  )
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to get a setting value
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = setting_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if maintenance mode is enabled
CREATE OR REPLACE FUNCTION is_maintenance_mode()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (value->>'enabled')::boolean FROM site_settings WHERE key = 'maintenance'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. VERIFICATION
-- =============================================

SELECT
  key,
  value,
  description
FROM site_settings
ORDER BY key;
