# 🧘 Configuration Base de Données - Yoga Pluriel

Guide complet pour mettre en place la base de données Yoga Pluriel sur Supabase.

## 📋 Ordre d'exécution des migrations

### 1️⃣ Migrations obligatoires (Core)

Ces migrations créent l'infrastructure de base **obligatoire** :

```
00_core/
  ├── 001_extensions_and_functions.sql    # Extensions PostgreSQL + fonctions helper
  ├── 002_user_profiles.sql               # Système d'authentification + profils
  └── 003_site_settings.sql               # Configuration clé-valeur du site
```

**Temps d'exécution :** ~30 secondes

---

### 2️⃣ Migrations contenu (Content)

Tables pour le contenu du site (peuvent être omises si non utilisées) :

```
01_content/
  ├── 001_team.sql        # Équipe + offres d'emploi (optionnel pour Yoga)
  ├── 002_faq.sql         # FAQ (RECOMMANDÉ)
  └── 003_lexique.sql     # Glossaire (peut être omis)
```

**Recommandations Yoga Pluriel :**
- ✅ **Exécuter FAQ** : utile pour questions fréquentes sur cours/tarifs
- ⚠️ **Team optionnel** : peut servir pour présenter les profs (ou utiliser `instructors` de yoga_core)
- ❌ **Lexique** : probablement pas nécessaire pour un studio de yoga

---

### 3️⃣ Migrations système (System)

Gestion SEO, redirections, popups :

```
02_system/
  ├── 001_seo_pages.sql       # Meta tags dynamiques (RECOMMANDÉ)
  ├── 002_redirects.sql       # Redirections 301/302 + suivi 404 (optionnel)
  └── 003_popups.sql          # Popups/notifications (optionnel)
```

**Recommandations Yoga Pluriel :**
- ✅ **SEO pages** : important pour référencement Google
- ⚠️ **Redirects** : utile si migration d'ancien site
- ⚠️ **Popups** : utile pour annoncer ateliers/événements

---

### 4️⃣ Migrations communication (Communication)

```
03_communication/
  ├── 001_inbox.sql          # Messages formulaires contact (RECOMMANDÉ)
  ├── 002_email_logs.sql     # Tracking emails Resend (RECOMMANDÉ)
  └── 003_newsletter.sql     # Gestion newsletter (optionnel)
```

**Recommandations Yoga Pluriel :**
- ✅ **Inbox** : pour formulaire contact
- ✅ **Email logs** : pour confirmations réservations
- ⚠️ **Newsletter** : si vous envoyez une newsletter régulière

---

### 5️⃣ Migrations YOGA (Spécifiques)

**🎯 OBLIGATOIRES pour Yoga Pluriel !**

```
04_optional/
  ├── 001_yoga_core.sql          # Tables principales yoga
  └── 002_yoga_memberships.sql   # Adhésions + suivi
```

**Contient :**
- `instructors` : Professeurs de yoga
- `class_types` : Types de cours (Hatha, Vinyasa, etc.)
- `rooms` : Salles
- `sessions` : Séances planifiées
- `bookings` : Réservations
- `membership_plans` : Formules d'abonnement
- `memberships` : Adhésions utilisateurs
- `attendance` : Suivi de présence
- `session_reviews` : Avis sur les cours

---

### 6️⃣ Storage Buckets

Créer les buckets de stockage :

```
storage/buckets.sql   # Configuration des buckets + RLS
```

**Buckets utiles pour Yoga :**
- `team-photos` → Photos des professeurs
- `user-avatars` → Avatars membres
- `popup-images` → Images événements/ateliers
- `general-uploads` → Images cours/témoignages

---

## 🚀 Guide d'installation rapide

### Option A : Via Supabase Dashboard (RECOMMANDÉ)

1. **Aller sur votre projet Supabase**
   - URL : https://supabase.com/dashboard/project/nfwgpwbjfgfqtkwmuljm

2. **SQL Editor**
   - Menu : SQL Editor > New Query

3. **Exécuter dans l'ordre**

```sql
-- 1. Core (OBLIGATOIRE)
-- Copier-coller 001_extensions_and_functions.sql → Run
-- Copier-coller 002_user_profiles.sql → Run
-- Copier-coller 003_site_settings.sql → Run

-- 2. Content (RECOMMANDÉ: FAQ uniquement)
-- Copier-coller 002_faq.sql → Run

-- 3. System (RECOMMANDÉ: SEO)
-- Copier-coller 001_seo_pages.sql → Run

-- 4. Communication (RECOMMANDÉ)
-- Copier-coller 001_inbox.sql → Run
-- Copier-coller 002_email_logs.sql → Run

-- 5. YOGA (OBLIGATOIRE)
-- Copier-coller 001_yoga_core.sql → Run
-- Copier-coller 002_yoga_memberships.sql → Run

-- 6. Storage
-- Copier-coller buckets.sql → Run
```

4. **Charger les données d'exemple (seeds)**

```sql
-- Données de base
-- seeds/01_core.sql → Run (crée settings par défaut)

-- Données demo FAQ
-- seeds/02_demo_content.sql → Run (optionnel)

-- Données YOGA
-- seeds/03_yoga_data.sql → Run (cours, profs, tarifs exemples)
```

---

### Option B : Via CLI Supabase

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref nfwgpwbjfgfqtkwmuljm

# 4. Appliquer les migrations
supabase db push

# 5. Charger les seeds
supabase db seed
```

---

## 👤 Créer votre premier admin

### Via Dashboard Supabase

1. **Créer votre compte utilisateur**
   - Dashboard > Authentication > Add User
   - Email : `admin@yogapluriel.com` (ou votre email)
   - Mot de passe : définir un mot de passe sécurisé
   - Auto Confirm User : ✅ (cocher)

2. **Donner les droits super_admin**
   - SQL Editor > New Query
   - Exécuter :

```sql
UPDATE user_profiles
SET roles = '["super_admin"]'::jsonb
WHERE email = 'admin@yogapluriel.com';  -- Remplacer par votre email
```

3. **Vérifier**

```sql
SELECT
  id,
  name,
  email,
  roles
FROM user_profiles
WHERE roles ? 'super_admin';
```

---

## 🧪 Tester la configuration

### Vérifier que tout est bien créé

```sql
-- Lister toutes les tables yoga
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'instructors',
    'class_types',
    'rooms',
    'sessions',
    'bookings',
    'membership_plans',
    'memberships',
    'attendance'
  )
ORDER BY tablename;

-- Compter les données seed
SELECT 'class_types' as table_name, COUNT(*) as count FROM class_types
UNION ALL SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'membership_plans', COUNT(*) FROM membership_plans;
```

---

## 📊 Générer les types TypeScript

Après avoir appliqué toutes les migrations :

```bash
npm run db:types
```

Cela génère `src/lib/database.types.ts` avec tous les types de votre BDD.

---

## 🎨 Personnaliser les données seed

Le fichier `seeds/03_yoga_data.sql` contient des **données d'exemple**. À modifier :

### Professeurs

```sql
-- Remplacer par vos vrais professeurs
UPDATE instructors
SET
  first_name = 'VotreNom',
  last_name = 'VotrePrenom',
  email = 'votre.email@yogapluriel.com',
  bio = 'Votre vraie bio...'
WHERE first_name = 'Sophie';  -- Exemple
```

### Types de cours

```sql
-- Ajouter vos propres types de cours
INSERT INTO class_types (name, slug, description, ...)
VALUES ('Kundalini Yoga', 'kundalini', 'Description...', ...);
```

### Tarifs

```sql
-- Modifier les prix
UPDATE membership_plans
SET price = 20.00
WHERE slug = 'cours-unite';
```

---

## 🔐 Sécurité : Vérifier RLS

Toutes les tables ont Row Level Security (RLS) activé. Vérifier :

```sql
-- Lister toutes les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🆘 Problèmes fréquents

### Erreur : "relation already exists"

→ Normal si vous réexécutez une migration. Utiliser `DROP TABLE IF EXISTS` ou ignorer.

### Erreur : "column does not exist"

→ Vérifier que les migrations core ont bien été exécutées en premier.

### RLS bloque mes requêtes

→ Vérifier que votre user a bien le rôle `super_admin` dans `user_profiles`.

### Les fonctions ne marchent pas

→ Vérifier que `001_extensions_and_functions.sql` a été exécuté en premier.

---

## 📚 Ressources

- **Docs Supabase** : https://supabase.com/docs
- **Docs Boilerplate** : Voir dossier `/docs/`
- **Guide Database** : `/docs/03-DATABASE.md`
- **Guide Deployment** : `/docs/08-DEPLOYMENT.md`

---

## ✅ Checklist de setup

- [ ] Migrations core exécutées (001, 002, 003)
- [ ] Migration FAQ exécutée
- [ ] Migration SEO exécutée
- [ ] Migrations communication (inbox, email_logs)
- [ ] **Migrations YOGA exécutées (core + memberships)**
- [ ] Storage buckets créés
- [ ] Seeds de base chargés
- [ ] **Seeds yoga chargés (cours, profs, tarifs)**
- [ ] Premier admin créé et testé
- [ ] Types TypeScript générés (`npm run db:types`)
- [ ] RLS vérifié
- [ ] Données personnalisées (profs, tarifs réels)

---

**🎉 Votre base de données Yoga Pluriel est prête !**

Prochaine étape : Développer les interfaces (planning, réservations, dashboard membre).
