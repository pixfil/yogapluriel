-- =============================================================================
-- EXTENSIONS & HELPER FUNCTIONS
-- =============================================================================
-- Ce fichier doit être appliqué EN PREMIER
-- Active les extensions PostgreSQL nécessaires et crée les fonctions helper
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS POSTGRESQL
-- =============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Random UUID (plus moderne que uuid-ossp)
-- Disponible par défaut dans Postgres 13+
-- gen_random_uuid() est utilisé dans tout le projet

-- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. TRIGGER FUNCTION: Auto-update updated_at
-- =============================================================================

-- Cette fonction est utilisée par de nombreuses tables
-- Elle met à jour automatiquement la colonne updated_at avant chaque UPDATE

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to automatically update updated_at timestamp';

-- =============================================================================
-- 3. FONCTION: Générer un slug depuis un titre
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convertir en minuscules
  slug := LOWER(title);

  -- Remplacer les caractères accentués
  slug := TRANSLATE(slug,
    'àáâãäåāăąèéêëēĕėęěìíîïìĩīĭòóôõöōŏőùúûüũūŭůçćĉčñńň',
    'aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuucccccnnn'
  );

  -- Remplacer les espaces et caractères spéciaux par des tirets
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Supprimer les tirets en début et fin
  slug := TRIM(BOTH '-' FROM slug);

  -- Limiter à 100 caractères
  slug := SUBSTRING(slug FROM 1 FOR 100);

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_slug IS 'Generate URL-safe slug from text';

-- =============================================================================
-- 4. FONCTION: Vérifier si une valeur est dans un tableau JSONB
-- =============================================================================

-- Helper pour vérifier les rôles et autres arrays JSONB
-- Exemple: jsonb_array_contains('["admin", "user"]'::jsonb, 'admin') → true

CREATE OR REPLACE FUNCTION jsonb_array_contains(arr JSONB, val TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN arr ? val;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION jsonb_array_contains IS 'Check if JSONB array contains a specific value';

-- =============================================================================
-- 5. FONCTION: Nettoyer les anciennes entrées (maintenance)
-- =============================================================================

-- Supprime les entrées soft-deleted depuis plus de X jours
-- Utile pour nettoyage automatique via cron job

CREATE OR REPLACE FUNCTION cleanup_soft_deleted(
  table_name TEXT,
  days_old INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  rows_deleted INTEGER;
  query TEXT;
BEGIN
  query := FORMAT(
    'DELETE FROM %I WHERE deleted_at < NOW() - INTERVAL ''%s days''',
    table_name,
    days_old
  );

  EXECUTE query;
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;

  RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_soft_deleted IS 'Delete soft-deleted records older than X days';

-- =============================================================================
-- 6. TYPE: Email Status (pour email_logs)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'failed',
    'spam'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE email_status IS 'Email delivery status';

-- =============================================================================
-- ✅ EXTENSIONS & FUNCTIONS CRÉÉES
-- =============================================================================
-- Prochaine étape : 002_user_profiles.sql
-- =============================================================================
