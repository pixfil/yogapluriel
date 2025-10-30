-- =============================================
-- NETTOYAGE POLICIES RLS DUPLIQUÉES
-- =============================================
-- Date: 2025-10-25
-- Objectif: Supprimer les anciennes policies qui bloquent l'accès aux projets
-- Problème: Mélange d'anciennes policies (syntaxe ANY(roles) incorrecte)
--           et nouvelles policies (syntaxe JSONB correcte)
-- Solution: Supprimer uniquement les anciennes, garder les nouvelles
--
-- Tables concernées : projects, project_images, project_categories
-- =============================================

-- =============================================
-- SUPPRESSION DES ANCIENNES POLICIES
-- =============================================

-- TABLE: projects
-- Supprimer l'ancienne policy qui utilise probablement ANY(roles)
DROP POLICY IF EXISTS "Admin can manage projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage all projects" ON projects;
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

-- Garder les bonnes policies (déjà créées) :
-- - projects_select_public (public read)
-- - projects_all_authenticated (authenticated full access)

-- TABLE: project_images
-- Supprimer l'ancienne policy admin
DROP POLICY IF EXISTS "Admin can manage all project images" ON project_images;

-- Garder les bonnes policies :
-- - project_images_select_public
-- - project_images_all_authenticated
-- - Public can view images of published projects (celle-ci est OK)

-- TABLE: project_categories
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Public can view project categories for published projects" ON project_categories;

-- Garder les bonnes policies :
-- - project_categories_select_public
-- - project_categories_all_authenticated

-- =============================================
-- VÉRIFICATION POST-MIGRATION
-- =============================================

-- Vérifier qu'il ne reste que les bonnes policies
SELECT
  tablename AS "Table",
  policyname AS "Policy",
  cmd AS "Commande",
  roles AS "Rôles"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_images', 'project_categories', 'categories')
ORDER BY tablename, policyname;

-- Résultat attendu :
-- projects: 2 policies (projects_select_public, projects_all_authenticated)
-- project_images: 2-3 policies (select_public, all_authenticated, + éventuellement "Public can view images...")
-- project_categories: 2 policies (select_public, all_authenticated)
-- categories: 2 policies (select_public, all_authenticated)

-- =============================================
-- TEST RAPIDE (optionnel)
-- =============================================

-- Tester que les projets sont maintenant accessibles
-- SELECT id, title, published, deleted_at FROM projects LIMIT 5;

-- =============================================
-- COMMENTAIRES TECHNIQUES
-- =============================================
--
-- POURQUOI CE PROBLÈME ?
-- - PostgreSQL évalue TOUTES les policies pour déterminer l'accès
-- - Si une policy utilise ANY(roles) sur une colonne JSONB, elle échoue
-- - Même si d'autres policies sont correctes, l'échec bloque tout
--
-- SOLUTION :
-- - Supprimer uniquement les anciennes policies problématiques
-- - Les nouvelles policies (projects_select_public, etc.) utilisent
--   déjà la syntaxe correcte et ne nécessitent pas de vérification de rôles
--
-- =============================================
