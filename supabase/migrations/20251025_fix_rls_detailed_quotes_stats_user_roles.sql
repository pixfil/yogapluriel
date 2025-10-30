-- =============================================
-- FIX RLS : detailed_quotes_stats & user_roles
-- =============================================
-- Date: 2025-10-25
-- Objectif: Activer RLS sur les 2 dernières tables non protégées
-- Résultat audit: 24/25 tables sécurisées → 100% après cette migration
-- Référence: AUDIT_DERNIER_KILOMETRE.md Section 2.1, AUDIT_RLS_GUIDE.md
--
-- Tables corrigées :
-- 1. detailed_quotes_stats (statistiques devis détaillés)
-- 2. user_roles (table de gestion des rôles - si elle existe)
--
-- Niveau de sécurité : ADMIN SEULEMENT (super_admin + admin)
-- =============================================

-- =============================================
-- TABLE 1 : detailed_quotes_stats
-- =============================================
-- Cette table contient des statistiques agrégées sur les devis détaillés
-- Données sensibles : montants, taux de conversion, performance commerciale
-- Accès requis : Super Admin & Admin seulement

-- Activer RLS
ALTER TABLE detailed_quotes_stats ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Admins peuvent lire toutes les statistiques
CREATE POLICY "Admins can read all detailed quotes stats"
  ON detailed_quotes_stats
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE ('super_admin' = ANY(roles) OR 'admin' = ANY(roles))
        AND status = 'active'
        AND deleted_at IS NULL
    )
  );

-- Policy 2 : Admins peuvent tout gérer (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage detailed quotes stats"
  ON detailed_quotes_stats
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE ('super_admin' = ANY(roles) OR 'admin' = ANY(roles))
        AND status = 'active'
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE ('super_admin' = ANY(roles) OR 'admin' = ANY(roles))
        AND status = 'active'
        AND deleted_at IS NULL
    )
  );

-- =============================================
-- TABLE 2 : user_roles (si elle existe)
-- =============================================
-- Cette table peut être une table de référence pour les rôles
-- OU une table de jonction user_id <-> role
-- Accès requis : Super Admin seulement (modification des rôles sensible)

-- Vérifier si la table existe avant d'appliquer les policies
DO $$
BEGIN
  -- Vérifier si la table user_roles existe
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
  ) THEN
    -- Activer RLS
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

    -- Policy 1 : Admins peuvent lire tous les rôles
    CREATE POLICY "Admins can read all user roles"
      ON user_roles
      FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM user_profiles
          WHERE ('super_admin' = ANY(roles) OR 'admin' = ANY(roles))
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
          WHERE 'super_admin' = ANY(roles)
            AND status = 'active'
            AND deleted_at IS NULL
        )
      )
      WITH CHECK (
        auth.uid() IN (
          SELECT id FROM user_profiles
          WHERE 'super_admin' = ANY(roles)
            AND status = 'active'
            AND deleted_at IS NULL
        )
      );

    RAISE NOTICE 'RLS activé sur user_roles';
  ELSE
    RAISE NOTICE 'Table user_roles inexistante - skip';
  END IF;
END $$;

-- =============================================
-- VÉRIFICATION POST-MIGRATION
-- =============================================
-- Commandes à exécuter après cette migration pour vérifier le succès :

-- 1. Vérifier que RLS est activé
SELECT
  tablename AS "Table",
  CASE
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END AS "Status"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('detailed_quotes_stats', 'user_roles')
ORDER BY tablename;

-- 2. Compter les policies créées
SELECT
  tablename AS "Table",
  COUNT(*) AS "Nb Policies"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('detailed_quotes_stats', 'user_roles')
GROUP BY tablename
ORDER BY tablename;

-- 3. Statistique globale (doit afficher 100%)
SELECT
  COUNT(*) AS "Total Tables",
  SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) AS "Avec RLS",
  SUM(CASE WHEN NOT rowsecurity THEN 1 ELSE 0 END) AS "Sans RLS",
  ROUND(
    100.0 * SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) || '%' AS "% Sécurisé"
FROM pg_tables
WHERE schemaname = 'public';

-- Résultat attendu : 100% sécurisé ✅

-- =============================================
-- COMMENTAIRES TECHNIQUES
-- =============================================
--
-- POURQUOI ADMIN SEULEMENT ?
-- - detailed_quotes_stats : Données commerciales sensibles (CA, taux conversion)
-- - user_roles : Gestion des permissions (accès critique au système)
--
-- POURQUOI SUPER_ADMIN pour user_roles ?
-- - Modifier les rôles = donner/retirer accès admin
-- - Opération ultra-sensible réservée au propriétaire du système
-- - Évite qu'un admin rogue ne s'auto-promote en super_admin
--
-- TEST MANUELRECOMMANDÉ :
-- 1. Se connecter en tant qu'utilisateur non authentifié
--    → SELECT sur detailed_quotes_stats doit échouer
-- 2. Se connecter en tant qu'admin
--    → SELECT sur detailed_quotes_stats doit marcher
--    → SELECT sur user_roles doit marcher
--    → UPDATE user_roles doit échouer (sauf super_admin)
-- 3. Se connecter en tant que super_admin
--    → Tout doit marcher
--
-- =============================================
