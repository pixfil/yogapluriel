-- =============================================
-- Migration: Support des wildcards pour les redirections
-- Description: Ajout de la colonne is_wildcard pour permettre /portfolio/* → /nos-realisations
-- Date: 2025-10-29
-- =============================================

-- Ajouter la colonne is_wildcard
ALTER TABLE redirects ADD COLUMN IF NOT EXISTS is_wildcard BOOLEAN DEFAULT false;

-- Créer un index pour optimiser les recherches de wildcards
CREATE INDEX IF NOT EXISTS idx_redirects_wildcard ON redirects(is_wildcard) WHERE is_wildcard = true AND is_active = true AND deleted_at IS NULL;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN redirects.is_wildcard IS 'Si true, from_path peut contenir * pour matcher plusieurs URLs (ex: /portfolio/* → /nos-realisations)';

-- =============================================
-- Exemples d'utilisation:
-- =============================================
--
-- 1. Rediriger tous les sous-chemins vers une même page:
--    from_path: /portfolio/*
--    to_path: /nos-realisations
--    is_wildcard: true
--    Résultat: /portfolio/abc → /nos-realisations
--
-- 2. Rediriger en préservant le slug:
--    from_path: /portfolio/*
--    to_path: /nos-realisations/*
--    is_wildcard: true
--    Résultat: /portfolio/abc → /nos-realisations/abc
--
-- 3. Redirection exacte (comportement par défaut):
--    from_path: /portfolio
--    to_path: /nos-realisations
--    is_wildcard: false
--    Résultat: seul /portfolio est redirigé
--
