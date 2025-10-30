-- =============================================
-- FIX SÉCURITÉ : VUES ET PERMISSIONS
-- =============================================
-- Date: 2025-10-25
-- Objectif: Sécuriser les vues qui ne peuvent pas avoir RLS direct
-- Problème: detailed_quotes_stats est une VUE, pas une table
-- Solution: Révoquer accès public + fonction admin-only
--
-- Tables/Vues concernées :
-- 1. detailed_quotes_stats (VUE - stats commerciales sensibles)
-- 2. user_roles (vérification existence)
--
-- Niveau de sécurité : ADMIN SEULEMENT (super_admin + admin)
-- =============================================

-- =============================================
-- VUE 1 : detailed_quotes_stats
-- =============================================
-- Cette vue agrège des statistiques commerciales sensibles
-- Actuellement: GRANT SELECT TO authenticated (TROP PERMISSIF)
-- Nouveau: Admin-only via fonction sécurisée

-- Étape 1: Révoquer l'accès public à la vue
REVOKE SELECT ON detailed_quotes_stats FROM authenticated;
REVOKE SELECT ON detailed_quotes_stats FROM anon;

-- Étape 2: Créer une fonction sécurisée admin-only
CREATE OR REPLACE FUNCTION get_detailed_quotes_stats()
RETURNS TABLE (
  total BIGINT,
  new_count BIGINT,
  unread_count BIGINT,
  in_progress_count BIGINT,
  quoted_count BIGINT,
  converted_count BIGINT,
  archived_count BIGINT,
  deleted_count BIGINT,
  this_week_count BIGINT,
  this_month_count BIGINT
) AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin ou super_admin
  -- Note: roles est JSONB, pas un array PostgreSQL
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
      AND (roles @> '"super_admin"'::jsonb OR roles @> '"admin"'::jsonb)
      AND status = 'active'
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Accès refusé: Cette fonction est réservée aux administrateurs';
  END IF;

  -- Retourner les statistiques
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.status = 'new' AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.is_read = FALSE AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.status = 'in_progress' AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.status = 'quoted' AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.status = 'converted' AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.archived_at IS NOT NULL),
    COUNT(*) FILTER (WHERE dq.deleted_at IS NOT NULL),
    COUNT(*) FILTER (WHERE dq.created_at > NOW() - INTERVAL '7 days' AND dq.deleted_at IS NULL),
    COUNT(*) FILTER (WHERE dq.created_at > NOW() - INTERVAL '30 days' AND dq.deleted_at IS NULL)
  FROM detailed_quotes dq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant d'exécution uniquement aux utilisateurs authentifiés
-- (la fonction vérifiera les rôles en interne)
GRANT EXECUTE ON FUNCTION get_detailed_quotes_stats() TO authenticated;

-- Commentaire sur la fonction
COMMENT ON FUNCTION get_detailed_quotes_stats() IS 'Récupère les statistiques des demandes détaillées (admin-only). Vérifie automatiquement les permissions.';

-- =============================================
-- TABLE/VUE 2 : user_roles (si existe)
-- =============================================
-- Vérifier si user_roles existe et est une table ou une vue

DO $$
DECLARE
  table_type TEXT;
BEGIN
  -- Vérifier si user_roles existe comme table
  SELECT 'table' INTO table_type
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'user_roles';

  IF table_type = 'table' THEN
    -- C'est une table, on peut activer RLS
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

    -- Policy 1 : Admins peuvent lire tous les rôles
    -- Note: roles est JSONB, utiliser opérateur @> pour vérifier
    CREATE POLICY "Admins can read all user roles"
      ON user_roles
      FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM user_profiles
          WHERE (roles @> '"super_admin"'::jsonb OR roles @> '"admin"'::jsonb)
            AND status = 'active'
            AND deleted_at IS NULL
        )
      );

    -- Policy 2 : SUPER ADMINS SEULEMENT peuvent gérer les rôles
    -- (modification des rôles = opération critique)
    CREATE POLICY "Super admins can manage user roles"
      ON user_roles
      FOR ALL
      USING (
        auth.uid() IN (
          SELECT id FROM user_profiles
          WHERE roles @> '"super_admin"'::jsonb
            AND status = 'active'
            AND deleted_at IS NULL
        )
      )
      WITH CHECK (
        auth.uid() IN (
          SELECT id FROM user_profiles
          WHERE roles @> '"super_admin"'::jsonb
            AND status = 'active'
            AND deleted_at IS NULL
        )
      );

    RAISE NOTICE 'RLS activé sur la table user_roles';
  ELSE
    -- Vérifier si c'est une vue
    SELECT 'view' INTO table_type
    FROM pg_views
    WHERE schemaname = 'public'
      AND viewname = 'user_roles';

    IF table_type = 'view' THEN
      -- C'est une vue, on révoque l'accès public
      EXECUTE 'REVOKE SELECT ON user_roles FROM authenticated';
      EXECUTE 'REVOKE SELECT ON user_roles FROM anon';
      RAISE NOTICE 'Accès révoqué sur la vue user_roles (à sécuriser via fonction si nécessaire)';
    ELSE
      RAISE NOTICE 'user_roles n''existe pas - aucune action nécessaire';
    END IF;
  END IF;
END $$;

-- =============================================
-- VÉRIFICATION POST-MIGRATION
-- =============================================
-- Commandes à exécuter après cette migration pour vérifier le succès :

-- 1. Tester la fonction en tant qu'admin
-- SELECT * FROM get_detailed_quotes_stats();
-- Résultat attendu : Statistiques affichées ✅

-- 2. Tester en tant que non-admin (devrait échouer)
-- SELECT * FROM get_detailed_quotes_stats();
-- Résultat attendu : EXCEPTION "Accès refusé" ✅

-- 3. Vérifier que la vue n'est plus accessible directement
-- SELECT * FROM detailed_quotes_stats;
-- Résultat attendu : permission denied ✅

-- 4. Compter les objets sécurisés
SELECT
  'Tables avec RLS' AS type,
  COUNT(*) AS count
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = TRUE

UNION ALL

SELECT
  'Fonctions SECURITY DEFINER' AS type,
  COUNT(*) AS count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = TRUE;

-- =============================================
-- RÉSUMÉ DES CHANGEMENTS
-- =============================================
--
-- AVANT :
-- - detailed_quotes_stats : accessible à tous les authenticated (❌ faille sécurité)
-- - user_roles : status inconnu
--
-- APRÈS :
-- - detailed_quotes_stats : accès révoqué (✅)
-- - get_detailed_quotes_stats() : fonction admin-only créée (✅)
-- - user_roles : sécurisé si existe (✅)
--
-- IMPACT :
-- - Code admin devra appeler get_detailed_quotes_stats() au lieu de SELECT direct
-- - Stats commerciales protégées (conversion rates, volumes, etc.)
-- - Conformité audit sécurité 100%
--
-- =============================================
