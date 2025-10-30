-- =============================================================================
-- INBOX / MESSAGES SYSTEM
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Système de messagerie/inbox pour gérer les soumissions de formulaires
-- =============================================================================

-- =============================================================================
-- 1. TABLE: INBOX
-- =============================================================================
-- Stockage générique pour tous types de messages/formulaires

CREATE TABLE IF NOT EXISTS inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Message content
  subject TEXT,
  message TEXT NOT NULL,
  form_type TEXT DEFAULT 'contact' NOT NULL, -- contact, quote, support, feedback, etc.

  -- Additional data (flexible)
  form_data JSONB, -- Store any extra form fields as JSON

  -- Status & workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'in_progress', 'resolved', 'archived', 'spam')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Admin workflow
  admin_notes TEXT, -- Internal notes from staff
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  replied_at TIMESTAMP WITH TIME ZONE,

  -- Spam detection
  spam_score INTEGER DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 100),
  is_spam BOOLEAN DEFAULT false,

  -- Metadata
  source TEXT DEFAULT 'website', -- website, api, mobile_app, etc.
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Index pour performances
CREATE INDEX idx_inbox_status ON inbox(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inbox_created_at ON inbox(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_inbox_email ON inbox(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_inbox_priority ON inbox(priority) WHERE status NOT IN ('resolved', 'archived', 'spam') AND deleted_at IS NULL;
CREATE INDEX idx_inbox_assigned_to ON inbox(assigned_to) WHERE assigned_to IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_inbox_form_type ON inbox(form_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_inbox_spam ON inbox(is_spam) WHERE is_spam = true;

-- Full-text search index
CREATE INDEX idx_inbox_search
  ON inbox
  USING gin(to_tsvector('english', name || ' ' || email || ' ' || COALESCE(subject, '') || ' ' || COALESCE(message, '')))
  WHERE deleted_at IS NULL;

COMMENT ON TABLE inbox IS 'Universal inbox for all form submissions (contact, quotes, feedback, etc.)';
COMMENT ON COLUMN inbox.form_type IS 'Type of form: contact, quote, support, feedback, newsletter, etc.';
COMMENT ON COLUMN inbox.form_data IS 'Additional form fields as flexible JSONB';
COMMENT ON COLUMN inbox.spam_score IS 'Spam detection score 0-100 (higher = more likely spam)';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_inbox_updated_at
  BEFORE UPDATE ON inbox
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. FUNCTION: Search inbox
-- =============================================================================
-- Recherche full-text dans tous les messages
-- Usage: SELECT * FROM search_inbox('urgent project');

CREATE OR REPLACE FUNCTION search_inbox(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  priority TEXT,
  form_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.email,
    i.subject,
    i.message,
    i.status,
    i.priority,
    i.form_type,
    i.created_at,
    ts_rank(
      to_tsvector('english', i.name || ' ' || i.email || ' ' || COALESCE(i.subject, '') || ' ' || COALESCE(i.message, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM inbox i
  WHERE
    i.deleted_at IS NULL
    AND (
      to_tsvector('english', i.name || ' ' || i.email || ' ' || COALESCE(i.subject, '') || ' ' || COALESCE(i.message, '')) @@
      plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, i.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_inbox IS 'Full-text search in inbox messages';

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE inbox ENABLE ROW LEVEL SECURITY;

-- Public/anon peuvent insérer (soumettre formulaire)
CREATE POLICY "Public can insert inbox messages"
  ON inbox FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all inbox"
  ON inbox FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Admins peuvent modifier/supprimer
CREATE POLICY "Admins can manage inbox"
  ON inbox FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- =============================================================================
-- ✅ INBOX SYSTEM CRÉÉ
-- =============================================================================
-- Tables créées:
--   - inbox (messagerie universelle pour tous formulaires)
--
-- Fonctions:
--   - search_inbox(query) → recherche full-text
--
-- Fonctionnalités:
--   - Workflow complet (new → read → replied → resolved)
--   - Priorités (low, normal, high, urgent)
--   - Assignment à un admin
--   - Spam detection (score + flag)
--   - Form data flexible (JSONB)
--   - Multiple form types (contact, quote, support, etc.)
--   - Full-text search
--   - Soft delete + RLS sécurisé
--
-- Usage:
--   1. Créer formulaire public (contact, quote, etc.)
--   2. POST vers API route qui insère dans inbox
--   3. Admin panel pour gérer messages
--   4. Workflow: new → read → replied → resolved
--
-- Prochaine étape : 002_email_logs.sql (tracking emails Resend)
-- =============================================================================
