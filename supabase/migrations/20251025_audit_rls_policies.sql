-- =============================================
-- AUDIT RLS (Row Level Security) POLICIES
-- =============================================
-- Date: 2025-10-25
-- Objectif: Vérifier que toutes les tables ont RLS activé et des policies configurées
-- Référence: AUDIT_DERNIER_KILOMETRE.md Section 2.1
--
-- Ce script affiche:
-- 1. Liste des tables avec/sans RLS
-- 2. Nombre de policies par table
-- 3. Tables DANGEREUSES (sans RLS)
--
-- À EXÉCUTER DANS: Supabase Dashboard > SQL Editor
-- =============================================

-- Vue 1: État RLS de toutes les tables publiques
SELECT
  schemaname AS "Schema",
  tablename AS "Table",
  CASE
    WHEN rowsecurity THEN '✅ OUI'
    ELSE '❌ NON'
  END AS "RLS Activé",
  (
    SELECT COUNT(*)
    FROM pg_policies
    WHERE schemaname = t.schemaname
      AND tablename = t.tablename
  ) AS "Nb Policies"
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- Vue 2: ALERTE - Tables SANS RLS (DANGER CRITIQUE)
SELECT
  '🔴 DANGER' AS "Status",
  tablename AS "Table Sans Protection",
  'N''importe qui peut lire/modifier/supprimer ces données via API Supabase' AS "Risque"
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- Vue 3: Détail des policies existantes
SELECT
  schemaname AS "Schema",
  tablename AS "Table",
  policyname AS "Nom de la Policy",
  cmd AS "Commande",
  CASE
    WHEN qual IS NOT NULL THEN 'WITH CHECK'
    ELSE 'USING'
  END AS "Type",
  roles AS "Rôles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vue 4: Résumé statistique
SELECT
  COUNT(*) AS "Total Tables",
  SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) AS "Avec RLS",
  SUM(CASE WHEN NOT rowsecurity THEN 1 ELSE 0 END) AS "Sans RLS (DANGER)",
  ROUND(
    100.0 * SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) || '%' AS "% Sécurisé"
FROM pg_tables
WHERE schemaname = 'public';

-- =============================================
-- COMMANDES DE CORRECTION (si RLS manquant)
-- =============================================
-- Exécuter UNIQUEMENT sur les tables identifiées ci-dessus comme dangereuses

-- Template pour activer RLS sur une table :
-- ALTER TABLE nom_de_la_table ENABLE ROW LEVEL SECURITY;

-- Template pour créer une policy SELECT publique (lecture pour tous) :
-- CREATE POLICY "Public read access"
--   ON nom_de_la_table
--   FOR SELECT
--   USING (true);

-- Template pour créer une policy INSERT/UPDATE/DELETE admin seulement :
-- CREATE POLICY "Admin full access"
--   ON nom_de_la_table
--   FOR ALL
--   USING (
--     auth.uid() IN (
--       SELECT id FROM user_profiles
--       WHERE 'super_admin' = ANY(roles) OR 'admin' = ANY(roles)
--     )
--   );

-- =============================================
-- DOCUMENTATION DES TABLES ATTENDUES
-- =============================================
--
-- Tables DEVANT avoir RLS activé :
--
-- ✅ AUTHENTIFICATION & UTILISATEURS
-- - user_profiles (RLS admin/owner)
-- - user_activity_logs (RLS admin only)
--
-- ✅ CONTENU PUBLIC (lecture publique, écriture admin)
-- - projects (RLS: public read, admin write)
-- - project_images (RLS: public read, admin write)
-- - team_members (RLS: public read, admin write)
-- - job_openings (RLS: public read, admin write)
-- - certifications (RLS: public read, admin write)
-- - lexique (RLS: public read, admin write)
-- - faq (RLS: public read, admin write)
-- - faq_categories (RLS: public read, admin write)
-- - pages (RLS: public read, admin write)
-- - site_settings (RLS: public read, admin write)
--
-- ✅ DONNÉES SENSIBLES (admin seulement)
-- - quotes (RLS: admin only)
-- - detailed_quotes (RLS: admin only)
-- - contacts (RLS: admin only)
-- - messages (RLS: admin only)
-- - email_logs (RLS: admin only)
--
-- ✅ SEO & REDIRECTIONS
-- - redirects (RLS: public read, admin write)
-- - 404_logs (RLS: admin only)
--
-- ✅ IA & CHATBOT
-- - ai_chatbot_settings (RLS: public read settings, admin write)
-- - embeddings (RLS: public read for RAG, admin write)
-- - conversations (RLS: owner or admin)
-- - messages (chatbot) (RLS: owner or admin)
--
-- ✅ POPUPS & MARKETING
-- - popups (RLS: public read active, admin write)
-- - popup_displays (RLS: tracking, peut être public)
--
-- =============================================
-- PROCÉDURE POST-AUDIT
-- =============================================
--
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Noter les tables SANS RLS dans un fichier texte
-- 3. Pour chaque table dangereuse :
--    a. Déterminer le niveau d'accès requis (public read, admin only, owner)
--    b. Créer migration SQL avec ALTER TABLE + CREATE POLICY
--    c. Tester avec anon key vs service role
-- 4. Re-exécuter ce script pour vérifier 100% sécurisé
-- 5. Commit migration finale
--
-- =============================================
