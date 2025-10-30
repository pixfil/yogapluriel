-- =============================================================================
-- EMAIL LOGS - Resend Tracking
-- =============================================================================
-- Dépendances : 00_core/003_site_settings.sql
-- Tracking complet des emails envoyés via Resend avec webhooks
-- =============================================================================

-- =============================================================================
-- 1. TABLE: EMAIL_LOGS
-- =============================================================================
-- Logs de tous les emails envoyés avec tracking de délivrabilité

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Resend identification
  resend_id TEXT UNIQUE, -- ID retourné par Resend API
  message_id TEXT, -- Email Message-ID header

  -- Sender/Recipient
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  reply_to TEXT,
  cc TEXT[], -- Carbon copy recipients
  bcc TEXT[], -- Blind carbon copy recipients

  -- Email content
  subject TEXT NOT NULL,
  html_content TEXT, -- Full HTML content (can be large)
  text_content TEXT, -- Plain text version
  template_name TEXT, -- React Email template name used

  -- Related record (optional link to other tables)
  related_type TEXT, -- 'inbox', 'user_profile', 'order', etc.
  related_id UUID, -- UUID of related record

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN (
    'pending',
    'queued',
    'sent',
    'delivered',
    'delayed',
    'bounced',
    'complained',
    'failed'
  )),

  -- Webhook event timestamps
  queued_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,

  -- Engagement counters
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Bounce information
  bounce_type TEXT CHECK (bounce_type IS NULL OR bounce_type IN ('hard', 'soft', 'transient')),
  bounce_reason TEXT,

  -- Error tracking
  error_message TEXT,
  error_code TEXT,

  -- Webhook events history (full log)
  webhook_events JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  tags TEXT[], -- Tags pour categoriser (ex: ['transactional', 'marketing'])
  metadata JSONB, -- Custom metadata

  -- Soft delete pattern
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status, delivery_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_related ON email_logs(related_type, related_id) WHERE related_id IS NOT NULL;
CREATE INDEX idx_email_logs_template ON email_logs(template_name) WHERE template_name IS NOT NULL;

-- Index pour analytics
CREATE INDEX idx_email_logs_opened_at ON email_logs(opened_at DESC) WHERE opened_at IS NOT NULL;
CREATE INDEX idx_email_logs_clicked_at ON email_logs(clicked_at DESC) WHERE clicked_at IS NOT NULL;
CREATE INDEX idx_email_logs_bounced_at ON email_logs(bounced_at DESC) WHERE bounced_at IS NOT NULL;
CREATE INDEX idx_email_logs_complained_at ON email_logs(complained_at DESC) WHERE complained_at IS NOT NULL;

COMMENT ON TABLE email_logs IS 'Complete email tracking with Resend delivery status';
COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for webhook matching';
COMMENT ON COLUMN email_logs.delivery_status IS 'Email delivery status updated via webhooks';
COMMENT ON COLUMN email_logs.webhook_events IS 'Full history of webhook events received';
COMMENT ON COLUMN email_logs.bounce_type IS 'hard=permanent failure, soft=temporary, transient=retry';

-- =============================================================================
-- 2. TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE TRIGGER trigger_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. FUNCTION: Update email status from webhook
-- =============================================================================
-- Met à jour le statut d'un email suite à un webhook Resend
-- Usage: SELECT update_email_status_from_webhook('resend-id', 'delivered', '{"..."}');

CREATE OR REPLACE FUNCTION update_email_status_from_webhook(
  p_resend_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_logs
  SET
    delivery_status = CASE p_event_type
      WHEN 'email.queued' THEN 'queued'
      WHEN 'email.sent' THEN 'sent'
      WHEN 'email.delivered' THEN 'delivered'
      WHEN 'email.delivery_delayed' THEN 'delayed'
      WHEN 'email.bounced' THEN 'bounced'
      WHEN 'email.complained' THEN 'complained'
      WHEN 'email.opened' THEN COALESCE(delivery_status, 'delivered')
      WHEN 'email.clicked' THEN COALESCE(delivery_status, 'delivered')
      ELSE delivery_status
    END,
    queued_at = CASE WHEN p_event_type = 'email.queued' THEN NOW() ELSE queued_at END,
    sent_at = CASE WHEN p_event_type = 'email.sent' THEN NOW() ELSE sent_at END,
    delivered_at = CASE WHEN p_event_type = 'email.delivered' THEN NOW() ELSE delivered_at END,
    opened_at = CASE
      WHEN p_event_type = 'email.opened' AND opened_at IS NULL THEN NOW()
      ELSE opened_at
    END,
    clicked_at = CASE
      WHEN p_event_type = 'email.clicked' AND clicked_at IS NULL THEN NOW()
      ELSE clicked_at
    END,
    bounced_at = CASE WHEN p_event_type = 'email.bounced' THEN NOW() ELSE bounced_at END,
    complained_at = CASE WHEN p_event_type = 'email.complained' THEN NOW() ELSE complained_at END,
    open_count = CASE
      WHEN p_event_type = 'email.opened' THEN open_count + 1
      ELSE open_count
    END,
    click_count = CASE
      WHEN p_event_type = 'email.clicked' THEN click_count + 1
      ELSE click_count
    END,
    bounce_type = CASE
      WHEN p_event_type = 'email.bounced' THEN (p_event_data->>'bounce_type')::TEXT
      ELSE bounce_type
    END,
    bounce_reason = CASE
      WHEN p_event_type = 'email.bounced' THEN p_event_data->>'reason'
      ELSE bounce_reason
    END,
    webhook_events = webhook_events || jsonb_build_object(
      'event', p_event_type,
      'timestamp', NOW(),
      'data', p_event_data
    ),
    updated_at = NOW()
  WHERE resend_id = p_resend_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_email_status_from_webhook IS 'Update email log status from Resend webhook event';

-- =============================================================================
-- 4. FUNCTION: Get email deliverability stats
-- =============================================================================
-- Récupère les stats de délivrabilité (analytics)
-- Usage: SELECT * FROM get_email_stats('2025-01-01', '2025-01-31');

CREATE OR REPLACE FUNCTION get_email_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_sent BIGINT,
  delivered BIGINT,
  opened BIGINT,
  clicked BIGINT,
  bounced BIGINT,
  complained BIGINT,
  failed BIGINT,
  delivery_rate NUMERIC,
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_sent,
    COUNT(*) FILTER (WHERE delivery_status = 'delivered')::BIGINT as delivered,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::BIGINT as opened,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::BIGINT as clicked,
    COUNT(*) FILTER (WHERE bounced_at IS NOT NULL)::BIGINT as bounced,
    COUNT(*) FILTER (WHERE complained_at IS NOT NULL)::BIGINT as complained,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed,
    ROUND(
      (COUNT(*) FILTER (WHERE delivery_status = 'delivered')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
      2
    ) as delivery_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE delivery_status = 'delivered')::NUMERIC, 0)) * 100,
      2
    ) as open_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC, 0)) * 100,
      2
    ) as click_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE bounced_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
      2
    ) as bounce_rate
  FROM email_logs
  WHERE
    created_at >= start_date
    AND created_at <= end_date
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_email_stats IS 'Get email deliverability statistics for a date range';

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- Seuls les admins peuvent gérer (insert via service role généralement)
CREATE POLICY "Admins can manage email logs"
  ON email_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );

-- =============================================================================
-- ✅ EMAIL LOGS CRÉÉ
-- =============================================================================
-- Tables créées:
--   - email_logs (tracking complet emails Resend)
--
-- Fonctions:
--   - update_email_status_from_webhook() → MAJ depuis webhook
--   - get_email_stats() → statistiques de délivrabilité
--
-- Fonctionnalités:
--   - Tracking complet (sent, delivered, opened, clicked, bounced)
--   - Webhook integration Resend
--   - Historique complet des events
--   - Analytics de délivrabilité
--   - Support template tracking
--   - Linking vers autres tables (related_type/related_id)
--   - Bounce detection (hard, soft, transient)
--   - Complaint tracking
--   - Soft delete + RLS sécurisé
--
-- Usage Next.js:
--   1. Envoyer email via Resend API
--   2. Logger dans email_logs avec resend_id
--   3. Créer webhook endpoint /api/webhooks/resend
--   4. Appeler update_email_status_from_webhook() dans webhook
--   5. Dashboard admin avec get_email_stats()
--
-- Webhooks Resend à configurer:
--   - email.sent
--   - email.delivered
--   - email.opened
--   - email.clicked
--   - email.bounced
--   - email.complained
--
-- Module 03_communication ✅ COMPLET
-- =============================================================================
