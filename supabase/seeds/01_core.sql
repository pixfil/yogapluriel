-- =============================================================================
-- CORE SEEDS - Données Essentielles
-- =============================================================================
-- Ce fichier crée les données minimales pour démarrer l'application :
-- - Super admin par défaut
-- - Settings de base du site
-- - Configuration email
-- =============================================================================

-- =============================================================================
-- 1. CRÉER SUPER ADMIN
-- =============================================================================
-- ⚠️ IMPORTANT : Remplacez l'email et le mot de passe par les vôtres !

-- Note : En production, créez d'abord l'utilisateur via Supabase Auth UI,
-- puis copiez son ID ici pour lui donner le profil admin.

-- Exemple d'insertion (à adapter avec votre user ID) :
-- INSERT INTO user_profiles (id, name, roles, status)
-- VALUES (
--   'VOTRE_USER_ID_ICI',  -- UUID de auth.users
--   'Super Admin',
--   '["super_admin"]'::jsonb,
--   'active'
-- );

-- Alternative : Créer directement via SQL (⚠️ DEV seulement, mot de passe en clair)
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@example.com',
--   crypt('ChangeMe123!', gen_salt('bf')),  -- ⚠️ CHANGEZ CE MOT DE PASSE !
--   NOW(),
--   NOW(),
--   NOW()
-- ) RETURNING id;
--
-- Puis créer le profil avec l'ID retourné ci-dessus

-- 📝 MÉTHODE RECOMMANDÉE :
-- 1. S'inscrire via l'interface web (http://localhost:3000)
-- 2. Aller dans Supabase Dashboard → Authentication → Users
-- 3. Copier l'ID de votre utilisateur
-- 4. Exécuter :

-- INSERT INTO user_profiles (id, name, roles, status)
-- SELECT
--   id,
--   'Super Admin',
--   '["super_admin"]'::jsonb,
--   'active'
-- FROM auth.users
-- WHERE email = 'VOTRE_EMAIL@example.com';  -- ⚠️ Remplacez par votre email

-- =============================================================================
-- 2. SETTINGS DE BASE
-- =============================================================================

-- Settings Généraux
INSERT INTO site_settings (key, value, description) VALUES
(
  'general',
  '{
    "siteName": "Mon Application",
    "tagline": "Powered by Boilerplate Next.js + Supabase",
    "contactEmail": "contact@example.com",
    "phone": "+33 1 23 45 67 89",
    "address": "123 Rue Exemple, 75001 Paris",
    "description": "Description de votre application"
  }'::jsonb,
  'Paramètres généraux du site'
),

-- Settings Email
(
  'email',
  '{
    "test_mode": true,
    "from_email": "noreply@example.com",
    "from_name": "Mon Application",
    "notification_emails": ["admin@example.com"],
    "test_recipient": "dev@example.com"
  }'::jsonb,
  'Configuration des emails'
),

-- Settings Maintenance
(
  'maintenance',
  '{
    "enabled": false,
    "message": "Le site est actuellement en maintenance. Nous revenons bientôt !",
    "allowed_ips": []
  }'::jsonb,
  'Mode maintenance'
),

-- Settings SEO
(
  'seo',
  '{
    "default_title": "Mon Application",
    "default_description": "Description par défaut pour le SEO",
    "default_og_image": "/og-image.png",
    "keywords": ["nextjs", "supabase", "boilerplate"]
  }'::jsonb,
  'Paramètres SEO par défaut'
),

-- Settings Analytics
(
  'analytics',
  '{
    "google_analytics_id": "",
    "google_tag_manager_id": "",
    "microsoft_clarity_id": ""
  }'::jsonb,
  'IDs de tracking analytics'
),

-- Settings Sécurité
(
  'security',
  '{
    "spam_filter_enabled": true,
    "recaptcha_enabled": false,
    "rate_limiting_enabled": false
  }'::jsonb,
  'Paramètres de sécurité'
),

-- Settings Features
(
  'features',
  '{
    "blog_enabled": false,
    "newsletter_enabled": true,
    "chatbot_enabled": false,
    "dark_mode_enabled": true
  }'::jsonb,
  'Features activées/désactivées'
)

ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =============================================================================
-- 3. DONNÉES DE RÉFÉRENCE
-- =============================================================================

-- Catégories par défaut (si table existe)
-- INSERT INTO categories (name, slug, description, color) VALUES
-- ('Général', 'general', 'Catégorie générale', '#3B82F6'),
-- ('Technique', 'technique', 'Questions techniques', '#8B5CF6'),
-- ('Business', 'business', 'Questions business', '#10B981')
-- ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 4. VÉRIFICATIONS
-- =============================================================================

-- Afficher les settings créés
SELECT
  key,
  value->>'siteName' as site_name,
  description,
  created_at
FROM site_settings
ORDER BY key;

-- Afficher les admins
SELECT
  up.id,
  up.name,
  up.roles,
  au.email,
  up.status,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.roles @> '["super_admin"]'::jsonb
   OR up.roles @> '["admin"]'::jsonb;

-- =============================================================================
-- ✅ SEEDS CORE APPLIQUÉS
-- =============================================================================
-- Prochaine étape :
-- - Appliquer 02_demo_content.sql (optionnel)
-- - Ou commencer à utiliser l'application
--
-- Pour se connecter en admin :
-- 1. Aller sur http://localhost:3000/admin/login
-- 2. Utiliser l'email et mot de passe créés ci-dessus
-- =============================================================================
