# 🗄️ Database Guide - Supabase & Migrations

> Tout ce qu'il faut savoir sur la structure de la base de données

## 📋 Vue d'Ensemble

Ce boilerplate utilise **Supabase** (PostgreSQL) avec :

- ✅ **25+ tables** organisées par module
- ✅ **Row Level Security (RLS)** sur toutes les tables
- ✅ **Soft delete** pattern (récupération possible)
- ✅ **Audit trails** (tracking des modifications)
- ✅ **Storage buckets** pour les fichiers
- ✅ **Migrations SQL** versionnées

## 🏗️ Architecture de la Base

### Organisation Modulaire

Les migrations sont organisées en **4 modules** :

```
supabase/migrations/
├── 00_core/           # 🔴 OBLIGATOIRE - Système de base
├── 01_content/        # 🟡 Recommandé - Gestion de contenu
├── 02_system/         # 🟡 Recommandé - Features système
├── 03_communication/  # 🟡 Recommandé - Formulaires & emails
└── 04_optional/       # 🟢 Optionnel - Features avancées
```

### Schéma Complet (25 Tables)

| Module | Tables | Description |
|--------|--------|-------------|
| **Core** | 6 tables | Auth, settings, logs |
| **Content** | 6 tables | Portfolio, team, FAQ, etc. |
| **System** | 5 tables | Redirects, 404, popups, pages |
| **Communication** | 4 tables | Contacts, newsletters, jobs |
| **Optional** | 4 tables | AI chatbot, RAG, calculator |

---

## 📦 Module Core (OBLIGATOIRE)

### Tables Incluses

#### 1. `user_profiles`

Extension de `auth.users` avec données métier.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  roles JSONB NOT NULL DEFAULT '["viewer"]'::jsonb,  -- Multi-rôles
  status TEXT NOT NULL DEFAULT 'active',  -- active | inactive | suspended
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Rôles disponibles :**
- `super_admin` : Accès complet (gestion utilisateurs)
- `admin` : Gestion contenu
- `editor` : Création/modification
- `viewer` : Lecture seule

**Exemple d'insertion :**
```sql
INSERT INTO user_profiles (id, name, roles, status) VALUES
  ('...', 'John Doe', '["admin", "editor"]'::jsonb, 'active');
```

#### 2. `site_settings`

Configuration site (key-value store).

```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Settings par défaut :**
```json
{
  "general": {
    "siteName": "My App",
    "tagline": "Powered by Boilerplate",
    "contactEmail": "contact@example.com"
  },
  "email": {
    "test_mode": true,
    "from_email": "noreply@example.com",
    "notification_emails": ["admin@example.com"]
  },
  "maintenance": {
    "enabled": false,
    "message": "Maintenance en cours..."
  }
}
```

#### 3. `email_logs`

Tracking des emails envoyés.

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  from_email TEXT,
  subject TEXT,
  template_name TEXT,
  status TEXT NOT NULL,  -- sent | delivered | opened | bounced | failed
  resend_id TEXT,  -- ID Resend pour tracking
  error_message TEXT,
  metadata JSONB,  -- Données custom
  opened_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. `audit_logs`

Journal d'activité admin.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,  -- create | update | delete | restore
  resource_type TEXT NOT NULL,  -- 'projects' | 'team' | etc.
  resource_id UUID,
  metadata JSONB,  -- Détails de l'action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 5. `activity_logs`

Logs d'activité système.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 6. `storage_buckets` (via Supabase)

Buckets configurés :
- `avatars` - Photos utilisateurs
- `project-images` - Images portfolio/projets
- `team-photos` - Photos équipe
- `documents` - Fichiers généraux
- `newsletter-pdfs` - PDFs newsletter

---

## 📦 Module Content (Recommandé)

### Tables Incluses

#### 1. `portfolio_items` (ou `projects`)

Projets/réalisations/portfolio.

```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,  -- Rich text / HTML
  main_image TEXT,
  gallery JSONB,  -- Array d'URLs d'images
  category_id UUID,
  tags JSONB,  -- Array de tags
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Exemple d'insertion :**
```sql
INSERT INTO portfolio_items (title, slug, description, published) VALUES
  ('Mon Premier Projet', 'mon-premier-projet', 'Description...', true);
```

#### 2. `team`

Membres de l'équipe.

```sql
CREATE TABLE team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,  -- Ex: "Directeur", "Instructeur", etc.
  bio TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  social_links JSONB,  -- {linkedin, twitter, etc.}
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3. `faq`

Questions fréquentes.

```sql
CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. `lexique`

Glossaire / Lexique de termes.

```sql
CREATE TABLE lexique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  category TEXT,
  published BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 5. `categories`

Catégories pour portfolio/blog.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,  -- Hex color
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 6. `certifications`

Certifications/Labels/Partenaires.

```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  url TEXT,  -- Lien externe
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📦 Module System (Recommandé)

### Tables Incluses

#### 1. `redirects`

Redirections SEO (301/302).

```sql
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  type INTEGER DEFAULT 301,  -- 301 (permanent) | 302 (temporary)
  is_wildcard BOOLEAN DEFAULT false,  -- /blog/* → /articles/*
  hit_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Exemples :**
```sql
INSERT INTO redirects (from_path, to_path, type) VALUES
  ('/old-page', '/new-page', 301),
  ('/blog/*', '/articles/*', 301);  -- Wildcard
```

#### 2. `404_logs`

Tracking des erreurs 404.

```sql
CREATE TABLE "404_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  hit_count INTEGER DEFAULT 1,
  is_resolved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Auto-increment hit_count** si path existe déjà.

#### 3. `popups`

Notifications/Popups programmables.

```sql
CREATE TABLE popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  style TEXT DEFAULT 'info',  -- info | warning | success | error
  position TEXT DEFAULT 'top',  -- top | bottom
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. `pages_seo`

Pages SEO dynamiques.

```sql
CREATE TABLE pages_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image TEXT,
  content TEXT,  -- Rich content
  published BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📦 Module Communication (Recommandé)

### Tables Incluses

#### 1. `contacts`

Formulaires de contact / Inbox.

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  source_url TEXT,  -- Page d'où vient la demande
  source_form_type TEXT,  -- Type de formulaire
  status TEXT DEFAULT 'new',  -- new | read | replied | archived
  priority TEXT DEFAULT 'normal',  -- low | normal | high | urgent
  assigned_to UUID REFERENCES user_profiles(id),
  spam_score INTEGER DEFAULT 0,  -- 0-100
  is_spam BOOLEAN DEFAULT false,
  notes TEXT,  -- Notes admin
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. `newsletter_subscribers`

Abonnés newsletter.

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active',  -- active | unsubscribed
  source TEXT,  -- Origine de l'inscription
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);
```

#### 3. `newsletter_campaigns`

Campagnes newsletter.

```sql
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',  -- draft | scheduled | sent
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. `job_applications` (Optionnel)

Candidatures emploi.

```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID,  -- Référence à une table jobs
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_url TEXT,  -- URL du CV uploadé
  cover_letter TEXT,
  status TEXT DEFAULT 'new',  -- new | reviewed | shortlisted | rejected | hired
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔐 Row Level Security (RLS)

### Pourquoi RLS ?

**Sécurité au niveau DB** - Même si votre code a une faille, la DB protège les données.

### Policies Appliquées

#### Pour les Utilisateurs Publics

```sql
-- Lecture seule des contenus publiés
CREATE POLICY "Public can view published items"
  ON portfolio_items FOR SELECT
  TO anon, authenticated
  USING (published = true AND deleted_at IS NULL);
```

#### Pour les Admins

```sql
-- Admins peuvent tout voir
CREATE POLICY "Admins can manage all items"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles @> '["super_admin"]'::jsonb OR roles @> '["admin"]'::jsonb)
      AND deleted_at IS NULL
    )
  );
```

#### Pour les Éditeurs

```sql
-- Éditeurs peuvent créer/modifier
CREATE POLICY "Editors can create items"
  ON portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (
        roles @> '["super_admin"]'::jsonb
        OR roles @> '["admin"]'::jsonb
        OR roles @> '["editor"]'::jsonb
      )
    )
  );
```

### Vérifier les RLS

```sql
-- Lister toutes les policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🗑️ Soft Delete Pattern

### Pourquoi Soft Delete ?

- ✅ **Récupération possible** (en cas d'erreur)
- ✅ **Audit trail** (voir qui a supprimé quoi)
- ✅ **Conformité** (garder historique)

### Comment ça Marche ?

Chaque table a :
```sql
deleted_at TIMESTAMPTZ  -- NULL = non supprimé, DATE = supprimé
deleted_by UUID         -- Qui a supprimé
```

**Suppression :**
```sql
UPDATE portfolio_items
SET deleted_at = NOW(), deleted_by = auth.uid()
WHERE id = '...';
```

**Restauration :**
```sql
UPDATE portfolio_items
SET deleted_at = NULL, deleted_by = NULL
WHERE id = '...';
```

**Suppression définitive (super admin seulement) :**
```sql
DELETE FROM portfolio_items WHERE id = '...';
```

**Filtrer les supprimés dans les queries :**
```sql
SELECT * FROM portfolio_items
WHERE deleted_at IS NULL  -- Exclure supprimés
ORDER BY created_at DESC;
```

---

## 📤 Storage (Supabase)

### Buckets Créés

| Bucket | Usage | Taille Max | Public |
|--------|-------|------------|--------|
| `avatars` | Photos utilisateurs | 2 MB | Oui |
| `project-images` | Images portfolio | 5 MB | Oui |
| `team-photos` | Photos équipe | 5 MB | Oui |
| `documents` | Documents PDF/Docs | 10 MB | Non |
| `newsletter-pdfs` | Newsletters PDF | 10 MB | Oui |

### Policies Storage

```sql
-- Public peut lire les images publiques
CREATE POLICY "Public images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('project-images', 'team-photos', 'avatars'));

-- Authenticated users peuvent uploader
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('project-images', 'team-photos', 'avatars'));
```

---

## 🔄 Migrations

### Appliquer les Migrations

#### Méthode Manuelle (SQL Editor)

1. Aller dans **Supabase Dashboard** → **SQL Editor**
2. Copier-coller chaque fichier `.sql` dans l'ordre
3. Cliquer **"Run"**

#### Méthode CLI (Avancé)

```bash
# Installer CLI
npm install -g supabase

# Lier projet
supabase link --project-ref xxxyyyzz

# Appliquer migrations
supabase db push
```

### Créer une Nouvelle Migration

```bash
# Avec CLI
supabase migration new add_my_feature

# Ou manuellement
# Créer : supabase/migrations/999_add_my_feature.sql
```

**Exemple de migration :**
```sql
-- 999_add_my_feature.sql

-- Créer table
CREATE TABLE my_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE my_feature ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Public can view"
  ON my_feature FOR SELECT
  TO public
  USING (true);

-- Index
CREATE INDEX idx_my_feature_name ON my_feature(name);

-- Commentaire
COMMENT ON TABLE my_feature IS 'Description de ma feature';
```

---

## 🔧 Maintenance

### Régénérer les Types TypeScript

```bash
# Après chaque modification de schéma
npm run db:types

# Ou manuellement
npx supabase gen types typescript \
  --project-id xxxyyyzz \
  > src/lib/database.types.ts
```

### Backup

Supabase fait des backups automatiques, mais vous pouvez aussi :

```bash
# Export manuel
pg_dump "postgresql://..." > backup.sql
```

### Réinitialiser la DB (DEV seulement)

```bash
# ⚠️ ATTENTION : Supprime TOUTES les données !
supabase db reset
```

---

## 📚 Ressources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Prochaine étape → [Authentication Guide](./04-AUTHENTICATION.md)**
