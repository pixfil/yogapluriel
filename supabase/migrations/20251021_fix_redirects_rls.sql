-- =============================================
-- Migration: Fix RLS Policies for Redirects
-- Description: Correction des policies RLS pour permettre l'accès aux redirections
-- Date: 2025-10-21
-- =============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Public can view active redirects" ON redirects;
DROP POLICY IF EXISTS "Admins can manage redirects" ON redirects;
DROP POLICY IF EXISTS "Admins can view 404 logs" ON "404_logs";

-- =============================================
-- NOUVELLES POLICIES POUR REDIRECTS
-- =============================================

-- 1. Lecture publique pour les redirections actives (pour le middleware)
CREATE POLICY "Public can view active redirects"
  ON redirects FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- 2. Les utilisateurs authentifiés peuvent voir toutes les redirections
CREATE POLICY "Authenticated users can view all redirects"
  ON redirects FOR SELECT
  TO authenticated
  USING (true);

-- 3. Les utilisateurs authentifiés peuvent créer des redirections
CREATE POLICY "Authenticated users can create redirects"
  ON redirects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Les utilisateurs authentifiés peuvent modifier des redirections
CREATE POLICY "Authenticated users can update redirects"
  ON redirects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Les utilisateurs authentifiés peuvent supprimer (soft delete) des redirections
CREATE POLICY "Authenticated users can delete redirects"
  ON redirects FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES POUR 404_LOGS
-- =============================================

-- 1. Les utilisateurs authentifiés peuvent voir tous les logs 404
CREATE POLICY "Authenticated users can view 404 logs"
  ON "404_logs" FOR SELECT
  TO authenticated
  USING (true);

-- 2. Les utilisateurs authentifiés peuvent insérer des logs 404
CREATE POLICY "Authenticated users can insert 404 logs"
  ON "404_logs" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Les utilisateurs authentifiés peuvent modifier des logs 404
CREATE POLICY "Authenticated users can update 404 logs"
  ON "404_logs" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Les utilisateurs authentifiés peuvent supprimer des logs 404
CREATE POLICY "Authenticated users can delete 404 logs"
  ON "404_logs" FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- INFO: Policies simplifiées
-- =============================================
-- Ces policies donnent accès complet à tous les utilisateurs authentifiés
-- Si vous souhaitez restreindre aux admins uniquement plus tard, utilisez :
--
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles
--     WHERE id = auth.uid()
--     AND (roles ? 'super_admin' OR roles ? 'admin')
--   )
-- )
