-- ============================================
-- PHASE 5: RAG (Retrieval Augmented Generation)
-- ============================================
-- Migration pour activer pgvector et créer la table d'embeddings
-- Permet au chatbot AI de chercher dans le contenu du site

-- ============================================
-- 1. Activer l'extension pgvector
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. Table content_embeddings
-- ============================================
-- Stocke les embeddings vectoriels du contenu du site
-- pour la recherche sémantique (RAG)

CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type de contenu (project, faq, lexique, service, certification, team_member)
  content_type TEXT NOT NULL,

  -- ID de l'élément source (lien vers projects.id, faq.id, etc.)
  content_id UUID NOT NULL,

  -- Texte original indexé
  content_text TEXT NOT NULL,

  -- Vecteur d'embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding vector(1536) NOT NULL,

  -- Métadonnées JSON (titre, catégorie, url, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Index pour recherche vectorielle rapide
-- ============================================
-- IVFFlat index pour recherche par similarité cosinus
-- lists=100 pour ~10,000 vecteurs (ajustable selon volume)
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx
ON content_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index classique sur content_type pour filtrage
CREATE INDEX IF NOT EXISTS content_embeddings_content_type_idx
ON content_embeddings(content_type);

-- Index composite pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS content_embeddings_type_id_idx
ON content_embeddings(content_type, content_id);

-- ============================================
-- 4. Fonction de recherche vectorielle
-- ============================================
-- Cherche les contenus les plus similaires à une requête
-- en utilisant la similarité cosinus

CREATE OR REPLACE FUNCTION search_content_embeddings(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_content_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id UUID,
  content_text TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_type,
    ce.content_id,
    ce.content_text,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM content_embeddings ce
  WHERE
    (filter_content_type IS NULL OR ce.content_type = filter_content_type)
    AND (1 - (ce.embedding <=> query_embedding)) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 5. Fonction pour obtenir des statistiques
-- ============================================
-- Utile pour l'interface admin

CREATE OR REPLACE FUNCTION get_embeddings_stats()
RETURNS TABLE (
  content_type TEXT,
  count BIGINT,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.content_type,
    COUNT(*) AS count,
    MAX(ce.updated_at) AS last_updated
  FROM content_embeddings ce
  GROUP BY ce.content_type
  ORDER BY ce.content_type;
END;
$$;

-- ============================================
-- 6. Trigger pour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_embeddings_updated_at
BEFORE UPDATE ON content_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

-- ============================================
-- 7. Row Level Security (RLS)
-- ============================================
-- Les embeddings sont publics en lecture (pour le chatbot)
-- Seuls les admins peuvent écrire

ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le chatbot peut chercher)
CREATE POLICY "Public can read embeddings"
ON content_embeddings FOR SELECT
TO public
USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin can manage embeddings"
ON content_embeddings FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM auth.users WHERE email = current_setting('app.admin_email', true)
  )
);

-- ============================================
-- 8. Commentaires pour documentation
-- ============================================
COMMENT ON TABLE content_embeddings IS 'Embeddings vectoriels du contenu du site pour RAG (Retrieval Augmented Generation)';
COMMENT ON COLUMN content_embeddings.embedding IS 'Vecteur 1536 dimensions généré par OpenAI text-embedding-3-small';
COMMENT ON COLUMN content_embeddings.metadata IS 'Données supplémentaires: {title, category, url, date, etc.}';
COMMENT ON FUNCTION search_content_embeddings IS 'Recherche sémantique par similarité cosinus';
COMMENT ON FUNCTION get_embeddings_stats IS 'Statistiques pour interface admin';

-- ============================================
-- Migration terminée
-- ============================================
-- Usage:
-- 1. Exécuter cette migration dans Supabase Dashboard
-- 2. Utiliser le script scripts/reindex-embeddings.mjs pour indexer le contenu
-- 3. Le chatbot AI utilisera automatiquement search_content_embeddings()
