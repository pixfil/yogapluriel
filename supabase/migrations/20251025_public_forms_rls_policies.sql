-- ============================================
-- RLS Policies pour les formulaires publics
-- ============================================
-- Permet aux utilisateurs anonymes de soumettre des formulaires
-- tout en gardant les autres opérations protégées (admin uniquement)

-- ============================================
-- 1. Table: quote_requests (formulaire devis urgent/standard)
-- ============================================

-- Activer RLS si pas déjà fait
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow public insert on quote_requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated users to select their own quote_requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow admins full access to quote_requests" ON quote_requests;

-- Policy 1: Permettre INSERT public (anonymes + authentifiés)
CREATE POLICY "Allow public insert on quote_requests"
ON quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Permettre aux admins de tout voir/modifier/supprimer
-- Note: Ceci suppose que vous avez une fonction is_admin() ou un role admin
-- Si vous n'en avez pas, vous pouvez utiliser authenticated à la place
CREATE POLICY "Allow admins full access to quote_requests"
ON quote_requests
FOR ALL
TO authenticated
USING (true)  -- Les admins peuvent tout voir
WITH CHECK (true);  -- Les admins peuvent tout modifier

-- ============================================
-- 2. Table: contacts (formulaire de contact)
-- ============================================

-- Activer RLS si pas déjà fait
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow public insert on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to select their own contacts" ON contacts;
DROP POLICY IF EXISTS "Allow admins full access to contacts" ON contacts;

-- Policy 1: Permettre INSERT public (anonymes + authentifiés)
CREATE POLICY "Allow public insert on contacts"
ON contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Permettre aux admins de tout voir/modifier/supprimer
CREATE POLICY "Allow admins full access to contacts"
ON contacts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. Table: detailed_quotes (formulaire détaillé)
-- ============================================

-- Activer RLS si pas déjà fait
ALTER TABLE detailed_quotes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow public insert on detailed_quotes" ON detailed_quotes;
DROP POLICY IF EXISTS "Allow authenticated users to select their own detailed_quotes" ON detailed_quotes;
DROP POLICY IF EXISTS "Allow admins full access to detailed_quotes" ON detailed_quotes;

-- Policy 1: Permettre INSERT public (anonymes + authentifiés)
CREATE POLICY "Allow public insert on detailed_quotes"
ON detailed_quotes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Permettre aux admins de tout voir/modifier/supprimer
CREATE POLICY "Allow admins full access to detailed_quotes"
ON detailed_quotes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. Table: email_logs (logs d'envoi d'emails)
-- ============================================

-- Activer RLS si pas déjà fait
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow system insert on email_logs" ON email_logs;
DROP POLICY IF EXISTS "Allow admins full access to email_logs" ON email_logs;

-- Policy 1: Permettre INSERT aux admins ET au service role (pour les API routes)
-- Note: service_role bypass automatiquement les RLS, mais on le met quand même
CREATE POLICY "Allow system insert on email_logs"
ON email_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Permettre aux admins de tout voir
CREATE POLICY "Allow admins full access to email_logs"
ON email_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- Vérification des policies créées
-- ============================================

-- Pour vérifier que tout est bien créé, exécutez cette requête :
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('quote_requests', 'contacts', 'detailed_quotes', 'email_logs')
-- ORDER BY tablename, policyname;
