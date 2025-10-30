-- Migration: AI Chatbot Settings Table
-- Description: Table pour stocker les configurations du chatbot AI avec support multi-providers
-- Date: 2025-10-23

-- Activer l'extension pgcrypto pour le chiffrement
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table principale pour les settings AI chatbot
CREATE TABLE IF NOT EXISTS ai_chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Mode chatbot : 'classic' (chatbot simple existant) ou 'ai' (chatbot AI avancé)
  chatbot_mode VARCHAR(10) DEFAULT 'classic' CHECK (chatbot_mode IN ('classic', 'ai')),

  -- Provider AI sélectionné : 'openai', 'anthropic', 'mistral'
  ai_provider VARCHAR(20) DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'anthropic', 'mistral')),

  -- Modèle sélectionné pour le provider actif
  -- Ex: 'gpt-4o', 'claude-3-5-sonnet-20241022', 'mistral-large-latest'
  ai_model VARCHAR(100) DEFAULT 'gpt-4o',

  -- Prompt système personnalisable (définit la personnalité et le comportement du bot)
  system_prompt TEXT DEFAULT 'Tu es un assistant virtuel pour FormDeToit, entreprise de couverture et zinguerie à Strasbourg. Tu es expert en toiture, charpente, isolation et zinguerie. Tu aides les clients avec leurs questions sur les travaux de toiture, les matériaux, les devis et les conseils techniques. Réponds de manière claire, professionnelle et bienveillante.',

  -- Clés API chiffrées (stockage avec pgcrypto)
  -- Chaque provider a sa propre clé stockée de manière sécurisée
  openai_api_key_encrypted BYTEA,
  anthropic_api_key_encrypted BYTEA,
  mistral_api_key_encrypted BYTEA,

  -- RAG (Retrieval Augmented Generation) activé ou non
  -- Si true, le chatbot recherche dans la base de données (projets, FAQ, lexique) avant de répondre
  rag_enabled BOOLEAN DEFAULT true,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert configuration par défaut
INSERT INTO ai_chatbot_settings (chatbot_mode, ai_provider, ai_model, rag_enabled, system_prompt)
VALUES (
  'classic',
  'openai',
  'gpt-4o',
  true,
  'Tu es un assistant virtuel pour FormDeToit, entreprise de couverture et zinguerie à Strasbourg. Tu es expert en toiture, charpente, isolation et zinguerie. Tu aides les clients avec leurs questions sur les travaux de toiture, les matériaux, les devis et les conseils techniques. Réponds de manière claire, professionnelle et bienveillante.'
)
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) Policies
ALTER TABLE ai_chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tous les utilisateurs authentifiés peuvent lire les settings (sans les clés)
CREATE POLICY "Allow read for authenticated users"
ON ai_chatbot_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Seulement les admins peuvent mettre à jour les settings
CREATE POLICY "Allow update for authenticated admins"
ON ai_chatbot_settings
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (
      user_profiles.roles @> '["super_admin"]'::jsonb OR
      user_profiles.roles @> '["admin"]'::jsonb
    )
  )
);

-- ============================================
-- FONCTIONS DE CHIFFREMENT/DÉCHIFFREMENT
-- ============================================

-- Fonction pour chiffrer une clé API
-- Utilise AES-256 via pgp_sym_encrypt
CREATE OR REPLACE FUNCTION encrypt_api_key(
  key TEXT,
  secret TEXT
)
RETURNS BYTEA AS $$
BEGIN
  -- Valider que la clé n'est pas vide
  IF key IS NULL OR key = '' THEN
    RAISE EXCEPTION 'API key cannot be empty';
  END IF;

  -- Valider que le secret est assez long (min 32 caractères pour sécurité)
  IF LENGTH(secret) < 32 THEN
    RAISE EXCEPTION 'Encryption secret must be at least 32 characters';
  END IF;

  -- Chiffrer la clé avec AES-256
  RETURN pgp_sym_encrypt(key, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour déchiffrer une clé API
-- Retourne la clé en clair (à utiliser UNIQUEMENT côté serveur, jamais exposer au client)
CREATE OR REPLACE FUNCTION decrypt_api_key(
  encrypted_key BYTEA,
  secret TEXT
)
RETURNS TEXT AS $$
BEGIN
  -- Valider que la clé chiffrée existe
  IF encrypted_key IS NULL THEN
    RETURN NULL;
  END IF;

  -- Déchiffrer et retourner la clé
  RETURN pgp_sym_decrypt(encrypted_key, secret);
EXCEPTION
  WHEN OTHERS THEN
    -- Si erreur de déchiffrement (mauvais secret), retourner NULL au lieu de crasher
    RAISE WARNING 'Failed to decrypt API key: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour vérifier si une clé API existe (sans la révéler)
CREATE OR REPLACE FUNCTION check_api_key_exists(
  provider_name VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
  key_field TEXT;
  key_exists BOOLEAN;
BEGIN
  -- Construire le nom du champ dynamiquement
  key_field := provider_name || '_api_key_encrypted';

  -- Vérifier si la clé existe (sans la retourner)
  EXECUTE format(
    'SELECT EXISTS(SELECT 1 FROM ai_chatbot_settings WHERE %I IS NOT NULL LIMIT 1)',
    key_field
  ) INTO key_exists;

  RETURN key_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEX & OPTIMISATIONS
-- ============================================

-- Index sur chatbot_mode pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_ai_chatbot_settings_mode
ON ai_chatbot_settings(chatbot_mode);

-- Index sur ai_provider pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_ai_chatbot_settings_provider
ON ai_chatbot_settings(ai_provider);

-- ============================================
-- COMMENTAIRES & DOCUMENTATION
-- ============================================

COMMENT ON TABLE ai_chatbot_settings IS 'Configuration du chatbot AI avec support multi-providers (OpenAI, Anthropic, Mistral) et stockage sécurisé des clés API';

COMMENT ON COLUMN ai_chatbot_settings.chatbot_mode IS 'Mode du chatbot: classic (simple) ou ai (avancé avec RAG)';
COMMENT ON COLUMN ai_chatbot_settings.ai_provider IS 'Provider AI actif: openai, anthropic, ou mistral';
COMMENT ON COLUMN ai_chatbot_settings.ai_model IS 'Modèle spécifique du provider (ex: gpt-4o, claude-3-5-sonnet)';
COMMENT ON COLUMN ai_chatbot_settings.system_prompt IS 'Prompt système qui définit le comportement et la personnalité du chatbot';
COMMENT ON COLUMN ai_chatbot_settings.rag_enabled IS 'Si true, le chatbot recherche dans la BDD avant de répondre (RAG)';
COMMENT ON COLUMN ai_chatbot_settings.openai_api_key_encrypted IS 'Clé API OpenAI chiffrée avec AES-256';
COMMENT ON COLUMN ai_chatbot_settings.anthropic_api_key_encrypted IS 'Clé API Anthropic chiffrée avec AES-256';
COMMENT ON COLUMN ai_chatbot_settings.mistral_api_key_encrypted IS 'Clé API Mistral chiffrée avec AES-256';

-- ============================================
-- TRIGGER POUR AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_ai_chatbot_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_chatbot_settings_timestamp
BEFORE UPDATE ON ai_chatbot_settings
FOR EACH ROW
EXECUTE FUNCTION update_ai_chatbot_settings_timestamp();

-- ============================================
-- LOGS & AUDIT
-- ============================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Migration ai_chatbot_settings complétée avec succès';
  RAISE NOTICE '   - Table créée avec RLS activé';
  RAISE NOTICE '   - Fonctions de chiffrement/déchiffrement créées';
  RAISE NOTICE '   - Configuration par défaut insérée (mode: classic)';
  RAISE NOTICE '   - Prêt pour Phase 2 (Server Actions)';
END $$;
