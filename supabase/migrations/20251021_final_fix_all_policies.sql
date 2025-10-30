-- Migration: Fix ALL RLS policies to remove auth.users dependencies
-- Date: 2025-10-21
-- Description: Complete fix for permission denied errors

-- ============================================
-- 1. DISABLE RLS TEMPORARILY
-- ============================================
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES
-- ============================================

-- Projects policies
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Admin can manage all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON projects;

-- Categories policies
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- Project categories policies
DROP POLICY IF EXISTS "Public can view project categories" ON project_categories;
DROP POLICY IF EXISTS "Admin can manage project categories" ON project_categories;
DROP POLICY IF EXISTS "Authenticated users can manage project categories" ON project_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON project_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON project_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON project_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON project_categories;

-- Project images policies
DROP POLICY IF EXISTS "Public can view project images" ON project_images;
DROP POLICY IF EXISTS "Admin can manage project images" ON project_images;
DROP POLICY IF EXISTS "Authenticated users can manage project images" ON project_images;
DROP POLICY IF EXISTS "Enable read access for all users" ON project_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON project_images;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON project_images;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON project_images;

-- ============================================
-- 3. RE-ENABLE RLS
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE NEW SIMPLE POLICIES
-- ============================================

-- PROJECTS
-- Public: can view published and non-deleted projects
CREATE POLICY "projects_select_public" ON projects
  FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Authenticated: can do everything
CREATE POLICY "projects_all_authenticated" ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CATEGORIES
-- Public: can view all categories
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT
  USING (true);

-- Authenticated: can do everything
CREATE POLICY "categories_all_authenticated" ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROJECT_CATEGORIES
-- Public: can view all
CREATE POLICY "project_categories_select_public" ON project_categories
  FOR SELECT
  USING (true);

-- Authenticated: can do everything
CREATE POLICY "project_categories_all_authenticated" ON project_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROJECT_IMAGES
-- Public: can view images of published projects
CREATE POLICY "project_images_select_public" ON project_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.published = true
      AND projects.deleted_at IS NULL
    )
  );

-- Authenticated: can do everything
CREATE POLICY "project_images_all_authenticated" ON project_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. VERIFY POLICIES
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('projects', 'categories', 'project_categories', 'project_images')
ORDER BY tablename, policyname;

-- Expected output: 8 policies total (2 per table)
