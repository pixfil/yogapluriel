# 🗄️ Database Migrations & Setup

> Guide complet pour gérer la base de données Supabase du boilerplate

---

## 📁 Structure

```
supabase/
├── migrations/              # ⚠️ Migrations originales (FormDeToit)
│                            # À utiliser comme référence
│
├── migrations_organized/    # ✅ Structure recommandée pour nouveau projet
│   ├── 00_core/            # OBLIGATOIRE - Système de base
│   ├── 01_content/         # Recommandé - Gestion contenu
│   ├── 02_system/          # Recommandé - Features système
│   ├── 03_communication/   # Recommandé - Formulaires & emails
│   └── 04_optional/        # Optionnel - Features avancées
│
├── seeds/                   # Données de démo & admin initial
│   ├── 01_core.sql         # Admin + settings (OBLIGATOIRE)
│   └── 02_demo_content.sql # Exemples (optionnel)
│
├── rls/                     # Row Level Security
│   ├── functions.sql       # Fonctions helper RLS
│   └── policies.sql        # Toutes les RLS policies
│
├── storage/                 # Supabase Storage
│   └── buckets.sql         # Configuration des buckets
│
└── README.md               # Ce fichier
```

---

## 🚀 Quick Start

### Option A : Installation Manuelle (Recommandé pour débutants)

**1. Créer un projet Supabase**
- Aller sur https://supabase.com
- Créer nouveau projet
- Noter l'URL et les clés API

**2. Appliquer les migrations**
- Ouvrir **SQL Editor** dans Supabase Dashboard
- Copier-coller chaque fichier `.sql` dans l'ordre numérique

```
📌 ORDRE D'APPLICATION :

00_core/ (OBLIGATOIRE)
  001_extensions.sql
  002_user_profiles.sql
  003_site_settings.sql
  004_email_logs.sql
  005_audit_logs.sql

01_content/ (Recommandé)
  010_projects.sql (ou portfolio_items)
  011_team.sql
  012_faq.sql
  013_lexique.sql
  014_categories.sql
  015_certifications.sql

02_system/ (Recommandé)
  020_redirects.sql
  021_404_logs.sql
  022_popups.sql
  023_pages_seo.sql

03_communication/ (Recommandé)
  030_contacts.sql
  031_newsletter.sql
  032_quote_requests.sql
  033_job_applications.sql (optionnel)

04_optional/ (Optionnel)
  040_ai_chatbot.sql
  041_rag_documents.sql
  042_calculator.sql
```

**3. Appliquer RLS**
```sql
-- Dans SQL Editor, exécuter dans l'ordre :
rls/functions.sql
rls/policies.sql
```

**4. Configurer Storage**
```sql
storage/buckets.sql
```

**5. Insérer données initiales**
```sql
seeds/01_core.sql          -- OBLIGATOIRE (crée admin)
seeds/02_demo_content.sql  -- Optionnel (exemples)
```

---

### Option B : Avec Supabase CLI (Avancé)

```bash
# 1. Installer CLI
npm install -g supabase

# 2. Lier votre projet
supabase link --project-ref xxxyyyzz

# 3. Appliquer migrations
supabase db push

# 4. (Optionnel) Appliquer seeds
supabase db seed

# Note : Cette méthode nécessite que les migrations soient
# dans le bon format CLI (voir docs Supabase)
```

---

## 📋 Modules Détaillés

### 00_core/ (OBLIGATOIRE)

**Tables créées :**
- `user_profiles` - Extension de auth.users avec rôles
- `site_settings` - Configuration site (key-value)
- `email_logs` - Tracking emails envoyés
- `audit_logs` - Journal d'activité admin
- `activity_logs` - Logs système

**Extensions activées :**
- `uuid-ossp` - Génération UUID
- `pgcrypto` - Encryption

**⚠️ Sans ce module, rien ne fonctionne !**

---

### 01_content/ (Recommandé)

**Tables :**
- `portfolio_items` (ou `projects`) - Portfolio/réalisations
- `team` - Membres équipe
- `faq` - Questions fréquentes
- `lexique` - Glossaire/termes
- `categories` - Catégories pour contenus
- `certifications` - Labels/certifications

**Utilisez si :**
- Vous avez un portfolio/projets
- Vous présentez une équipe
- Vous voulez une FAQ
- Vous avez des termes techniques à expliquer

---

### 02_system/ (Recommandé)

**Tables :**
- `redirects` - Redirections SEO (301/302)
- `404_logs` - Tracking erreurs 404
- `popups` - Notifications programmables
- `pages_seo` - Pages SEO dynamiques

**Utilisez si :**
- Vous migrez un ancien site (redirects)
- Vous voulez tracker les 404
- Vous voulez des popups promo
- Vous gérez des pages SEO

---

### 03_communication/ (Recommandé)

**Tables :**
- `contacts` - Formulaire contact / Inbox
- `newsletter_subscribers` - Abonnés newsletter
- `newsletter_campaigns` - Campagnes email
- `quote_requests` - Demandes de devis
- `job_applications` - Candidatures emploi

**Utilisez si :**
- Vous avez un formulaire de contact
- Vous envoyez une newsletter
- Vous collectez des demandes (devis, inscription, etc.)

---

### 04_optional/ (Optionnel)

**Tables :**
- `ai_chatbot_settings` - Config chatbot IA
- `rag_documents` - Documents pour RAG
- `embeddings` - Embeddings vectoriels
- `calculator_submissions` - Formulaire calculateur

**Utilisez si :**
- Vous voulez un chatbot IA
- Vous avez un calculateur spécifique

---

## 🔐 Row Level Security (RLS)

### Pourquoi c'est Important

**RLS = Sécurité au niveau de la base de données**

Même si votre code a une faille, la DB protège les données !

```sql
-- Exemple : Public ne peut voir que le contenu publié
CREATE POLICY "Public can view published"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (published = true AND deleted_at IS NULL);

-- Admins peuvent tout faire
CREATE POLICY "Admins can manage all"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (roles @> '["super_admin"]' OR roles @> '["admin"]')
    )
  );
```

### Fichiers RLS

**`rls/functions.sql`** - Fonctions helper
- `is_admin()` - Vérifie si user est admin
- `has_role(role)` - Vérifie un rôle spécifique
- `can_delete()` - Vérifie permissions delete
- etc.

**`rls/policies.sql`** - Toutes les policies
- À appliquer APRÈS les migrations
- Une policy par opération (SELECT, INSERT, UPDATE, DELETE)
- Policies différentes par rôle

---

## 🗑️ Soft Delete Pattern

### Qu'est-ce que c'est ?

Au lieu de **supprimer définitivement**, on marque comme "supprimé".

**Avantages :**
- ✅ Récupération possible
- ✅ Audit trail (qui a supprimé quoi quand)
- ✅ Conformité légale

### Comment ça Marche

**Chaque table a :**
```sql
deleted_at TIMESTAMPTZ    -- NULL = actif, DATE = supprimé
deleted_by UUID          -- Qui a supprimé
```

**Suppression (soft delete) :**
```sql
UPDATE projects
SET deleted_at = NOW(), deleted_by = auth.uid()
WHERE id = '...';
```

**Restauration :**
```sql
UPDATE projects
SET deleted_at = NULL, deleted_by = NULL
WHERE id = '...';
```

**Suppression définitive (super admin seulement) :**
```sql
DELETE FROM projects WHERE id = '...';
```

**Filtrer les supprimés dans les queries :**
```sql
SELECT * FROM projects
WHERE deleted_at IS NULL  -- Exclure supprimés
ORDER BY created_at DESC;
```

---

## 📤 Supabase Storage

### Buckets Configurés

| Bucket | Usage | Taille Max | Public |
|--------|-------|------------|--------|
| `avatars` | Photos users | 2 MB | Oui |
| `project-images` | Images portfolio | 5 MB | Oui |
| `team-photos` | Photos équipe | 5 MB | Oui |
| `documents` | PDFs/Docs | 10 MB | Non |
| `newsletter-pdfs` | Newsletters | 10 MB | Oui |

### Policies Storage

```sql
-- Public peut lire
CREATE POLICY "Public images accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('project-images', 'team-photos'));

-- Authenticated peut uploader
CREATE POLICY "Users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('project-images', 'avatars'));
```

---

## 🔄 Créer une Nouvelle Migration

### Méthode 1 : Fichier SQL Manuel

```bash
# 1. Créer fichier
touch supabase/migrations_organized/999_my_feature.sql

# 2. Écrire SQL
# Exemple :
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view"
  ON my_table FOR SELECT
  TO public
  USING (true);

# 3. Appliquer via SQL Editor Supabase
```

### Méthode 2 : Supabase CLI

```bash
# Générer migration
supabase migration new my_feature

# Éditer le fichier généré
# Puis appliquer
supabase db push
```

---

## 🔧 Maintenance

### Régénérer Types TypeScript

```bash
# Après CHAQUE modification de schéma
npm run db:types

# Ou manuellement
npx supabase gen types typescript \
  --project-id xxxyyyzz \
  > src/lib/database.types.ts
```

### Vérifier RLS

```sql
-- Lister toutes les policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Vérifier qu'une table a RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Reset DB (DEV seulement !)

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
- [CLI Reference](https://supabase.com/docs/reference/cli)

---

## ⚠️ Notes Importantes

### Migrations Originales (dossier `migrations/`)

Ces fichiers viennent de FormDeToit (projet en production).
- ✅ Utilisez-les comme **référence**
- ✅ Voyez comment sont structurées les tables
- ❌ Ne les appliquez PAS directement (beaucoup de doublons/fixes)

Pour un nouveau projet, utilisez `migrations_organized/` qui est une version nettoyée.

### Ordre d'Application

**TOUJOURS respecter l'ordre :**
1. Core (00_)
2. Content (01_)
3. System (02_)
4. Communication (03_)
5. Optional (04_)
6. RLS
7. Storage
8. Seeds

### Sauvegardes

Supabase fait des backups automatiques, mais :
- ✅ Testez d'abord sur un projet de DEV
- ✅ Exportez avant migrations majeures
- ✅ Gardez vos scripts SQL en version control

---

**🚀 Prêt ? → Voir [Quick Start Guide](../docs/01-QUICK-START.md)**
