-- =============================================
-- Migration: Initialiser le compte Super Admin
-- Description: Créer ou mettre à jour le profil super admin pour philippe@gclicke.com
-- Date: 2025-10-21
-- =============================================

-- Cette migration garantit que le compte philippe@gclicke.com existe dans user_profiles
-- avec le rôle super_admin

-- Fonction pour initialiser le super admin
-- Note: Cette fonction doit être exécutée APRÈS que l'utilisateur se soit connecté au moins une fois
-- pour que son compte existe dans auth.users

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur depuis auth.users
  -- Note: L'utilisateur doit exister dans auth.users d'abord
  -- (créé via signup ou via le dashboard Supabase)

  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'philippe@gclicke.com'
  LIMIT 1;

  -- Si l'utilisateur existe dans auth.users
  IF admin_user_id IS NOT NULL THEN
    -- Insérer ou mettre à jour son profil
    INSERT INTO user_profiles (
      id,
      name,
      roles,
      status,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'Philippe',
      '["super_admin"]'::jsonb,
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      roles = '["super_admin"]'::jsonb,
      status = 'active',
      deleted_at = NULL,  -- S'assurer qu'il n'est pas marqué comme supprimé
      updated_at = NOW();

    RAISE NOTICE 'Compte super admin initialisé pour philippe@gclicke.com (ID: %)', admin_user_id;
  ELSE
    RAISE NOTICE 'Utilisateur philippe@gclicke.com non trouvé dans auth.users. Veuillez vous connecter au moins une fois pour créer le compte.';
  END IF;
END $$;

-- =============================================
-- INSTRUCTIONS
-- =============================================
--
-- Si cette migration ne trouve pas l'utilisateur:
-- 1. Connectez-vous sur votre site avec philippe@gclicke.com
-- 2. Puis réexécutez cette migration
--
-- OU utilisez le Dashboard Supabase pour créer l'utilisateur manuellement:
-- 1. Allez dans Authentication > Users
-- 2. Créez un utilisateur avec email: philippe@gclicke.com
-- 3. Puis réexécutez cette migration
--
-- Pour vérifier que ça a fonctionné:
-- SELECT * FROM user_profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'philippe@gclicke.com');
