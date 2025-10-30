-- ============================================
-- Migration: Add spam filtering columns
-- Date: 2025-10-28
-- Description: Ajoute les colonnes is_spam, spam_reason, spam_score
--              aux tables de messages pour filtrage anti-spam intelligent
-- ============================================

-- Table: contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS spam_reason TEXT,
  ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;

COMMENT ON COLUMN public.contacts.is_spam IS 'Indique si le message a été détecté comme spam';
COMMENT ON COLUMN public.contacts.spam_reason IS 'Raison de la détection spam (ex: "Non-français + mots-clés SEO")';
COMMENT ON COLUMN public.contacts.spam_score IS 'Score de spam 0-100 (plus élevé = plus suspect)';

-- Table: quote_requests
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS spam_reason TEXT,
  ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;

COMMENT ON COLUMN public.quote_requests.is_spam IS 'Indique si le message a été détecté comme spam';
COMMENT ON COLUMN public.quote_requests.spam_reason IS 'Raison de la détection spam';
COMMENT ON COLUMN public.quote_requests.spam_score IS 'Score de spam 0-100';

-- Table: detailed_quotes
ALTER TABLE public.detailed_quotes
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS spam_reason TEXT,
  ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;

COMMENT ON COLUMN public.detailed_quotes.is_spam IS 'Indique si le message a été détecté comme spam';
COMMENT ON COLUMN public.detailed_quotes.spam_reason IS 'Raison de la détection spam';
COMMENT ON COLUMN public.detailed_quotes.spam_score IS 'Score de spam 0-100';

-- Table: calculator_submissions
ALTER TABLE public.calculator_submissions
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS spam_reason TEXT,
  ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;

COMMENT ON COLUMN public.calculator_submissions.is_spam IS 'Indique si le message a été détecté comme spam';
COMMENT ON COLUMN public.calculator_submissions.spam_reason IS 'Raison de la détection spam';
COMMENT ON COLUMN public.calculator_submissions.spam_score IS 'Score de spam 0-100';

-- Index pour performances (filtrage admin des messages spam)
CREATE INDEX IF NOT EXISTS idx_contacts_is_spam ON public.contacts(is_spam) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quote_requests_is_spam ON public.quote_requests(is_spam) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_is_spam ON public.detailed_quotes(is_spam) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_is_spam ON public.calculator_submissions(is_spam) WHERE deleted_at IS NULL;

-- RLS Policies: Aucune modification nécessaire
-- Les policies existantes couvrent déjà ces colonnes car elles s'appliquent à toute la ligne

-- ============================================
-- Fonction helper: Marquer un message comme légitime (dé-spammer)
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_as_not_spam(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'super_admin' = ANY(roles) OR 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Mettre à jour selon la table
  CASE table_name
    WHEN 'contacts' THEN
      UPDATE public.contacts
      SET is_spam = false, spam_reason = NULL, spam_score = 0
      WHERE id = record_id;
    WHEN 'quote_requests' THEN
      UPDATE public.quote_requests
      SET is_spam = false, spam_reason = NULL, spam_score = 0
      WHERE id = record_id;
    WHEN 'detailed_quotes' THEN
      UPDATE public.detailed_quotes
      SET is_spam = false, spam_reason = NULL, spam_score = 0
      WHERE id = record_id;
    WHEN 'calculator_submissions' THEN
      UPDATE public.calculator_submissions
      SET is_spam = false, spam_reason = NULL, spam_score = 0
      WHERE id = record_id;
    ELSE
      RAISE EXCEPTION 'Invalid table name';
  END CASE;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.mark_as_not_spam IS 'Marque un message comme légitime (retire le flag spam)';

-- ============================================
-- Statistiques spam (fonction utile pour dashboard)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_spam_stats()
RETURNS TABLE(
  table_name TEXT,
  total_messages BIGINT,
  spam_count BIGINT,
  spam_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'contacts'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE is_spam = true)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE is_spam = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM public.contacts WHERE deleted_at IS NULL
  UNION ALL
  SELECT
    'quote_requests'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE is_spam = true)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE is_spam = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM public.quote_requests WHERE deleted_at IS NULL
  UNION ALL
  SELECT
    'detailed_quotes'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE is_spam = true)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE is_spam = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM public.detailed_quotes WHERE deleted_at IS NULL
  UNION ALL
  SELECT
    'calculator_submissions'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE is_spam = true)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE is_spam = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM public.calculator_submissions WHERE deleted_at IS NULL;
END;
$$;

COMMENT ON FUNCTION public.get_spam_stats IS 'Retourne les statistiques de spam par table';
