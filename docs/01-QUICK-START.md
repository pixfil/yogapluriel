# ⚡ Quick Start Guide - 30 Minutes

> Démarrez votre projet en 30 minutes chrono !

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js 18+** installé ([télécharger](https://nodejs.org))
- ✅ **npm** ou **pnpm** (vient avec Node.js)
- ✅ **Git** installé
- ✅ Un compte **Supabase** ([créer gratuitement](https://supabase.com))
- ✅ (Optionnel) Un compte **Resend** pour les emails ([créer](https://resend.com))

## 🚀 Installation en 5 Étapes

### Étape 1 : Cloner le Boilerplate (2 min)

```bash
# Cloner le repo
git clone https://github.com/votre-org/boilerplate-nextjs-supabase.git mon-nouveau-projet

# Aller dans le dossier
cd mon-nouveau-projet

# Installer les dépendances
npm install
```

**Résultat attendu :**
```
✅ Dossier créé
✅ Dépendances installées (peut prendre 2-3 min)
```

---

### Étape 2 : Créer un Projet Supabase (5 min)

#### 2.1 Créer le Projet

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur **"New Project"**
3. Remplir :
   - **Name** : `mon-nouveau-projet`
   - **Database Password** : (générer un mot de passe fort)
   - **Region** : `Europe West` (ou proche de vous)
4. Cliquer **"Create new project"**
5. ⏳ Attendre 2 minutes (création du projet)

#### 2.2 Récupérer les Clés API

Une fois le projet créé :

1. Aller dans **Settings** (⚙️) → **API**
2. Copier ces 3 valeurs :

```
✅ Project URL : https://xxxyyyzz.supabase.co
✅ anon public : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ service_role (⚠️ secret!) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT : Ne jamais commiter la clé `service_role` dans Git !**

---

### Étape 3 : Configurer `.env.local` (3 min)

#### 3.1 Copier le Template

```bash
cp .env.example .env.local
```

#### 3.2 Remplir les Valeurs

Ouvrir `.env.local` et compléter :

```bash
# =============================================================================
# CONFIGURATION MINIMALE (OBLIGATOIRE)
# =============================================================================

# 1. BRANDING (changez selon votre projet)
NEXT_PUBLIC_SITE_NAME="Mon Application"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # En dev
NEXT_PUBLIC_COMPANY_NAME="Ma Société"

# 2. SUPABASE (valeurs copiées à l'étape 2.2)
NEXT_PUBLIC_SUPABASE_URL="https://xxxyyyzz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. ADMIN (changez l'email)
SUPER_ADMIN_EMAILS="votre.email@example.com"

# =============================================================================
# OPTIONNEL (peut être configuré plus tard)
# =============================================================================

# Email (Resend - optionnel pour l'instant)
# RESEND_API_KEY="re_..."
# EMAIL_TEST_MODE="true"

# Sécurité (optionnel)
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6L..."
# UPSTASH_REDIS_REST_URL="https://..."
```

**✅ Résultat : `.env.local` configuré avec au minimum Supabase**

---

### Étape 4 : Créer la Base de Données (10 min)

C'est l'étape la plus importante ! Deux méthodes possibles :

#### Méthode A : Manuelle (Recommandée pour débutants)

1. **Aller dans Supabase Dashboard** → votre projet

2. **Ouvrir SQL Editor** (icône `</>` dans la sidebar)

3. **Appliquer les migrations dans l'ordre** :

   ```
   📂 supabase/migrations/

   Copier-coller chaque fichier .sql dans l'ordre :

   📁 00_core/  (INDISPENSABLE - à faire absolument)
      ├── 001_enable_extensions.sql
      ├── 002_create_user_profiles.sql
      ├── 003_site_settings.sql
      ├── 004_email_logs.sql
      ├── 005_audit_logs.sql
      └── 006_activity_logs.sql

   📁 01_content/ (Gestion de contenu - recommandé)
      ├── 010_portfolio_items.sql (ou projects)
      ├── 011_team.sql
      ├── 012_faq.sql
      └── 013_lexique.sql

   📁 02_system/ (Features système - recommandé)
      ├── 020_redirects.sql
      ├── 021_404_logs.sql
      ├── 022_popups.sql
      └── 023_pages_seo.sql

   📁 03_communication/ (Formulaires - recommandé)
      ├── 030_contacts.sql
      ├── 031_newsletter.sql
      └── 032_job_applications.sql (optionnel)

   📁 04_optional/ (Optionnel - peut être fait plus tard)
      ├── 040_ai_chatbot.sql
      └── 041_rag_documents.sql
   ```

4. **Pour chaque fichier :**
   - Copier tout le contenu
   - Coller dans SQL Editor
   - Cliquer **"Run"**
   - Vérifier : ✅ "Success. No rows returned"

5. **Appliquer les RLS policies :**
   ```
   📂 supabase/rls/
      ├── functions.sql (d'abord)
      └── policies.sql (ensuite)
   ```

6. **Configurer le Storage :**
   ```
   📂 supabase/storage/
      └── buckets.sql
   ```

7. **Insérer les données de démo :**
   ```
   📂 supabase/seeds/
      ├── 01_core.sql (OBLIGATOIRE - crée l'admin)
      └── 02_demo_content.sql (optionnel - exemples)
   ```

#### Méthode B : Avec Supabase CLI (Avancé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Lier votre projet
supabase link --project-ref xxxyyyzz

# Appliquer toutes les migrations
supabase db push

# ⚠️ Cette méthode nécessite que les migrations soient dans le bon format
```

**✅ Vérifier que tout est OK :**

```sql
-- Dans SQL Editor, exécuter :
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Vous devriez voir au minimum :
-- user_profiles, site_settings, email_logs, etc.
```

---

### Étape 5 : Lancer le Projet (1 min)

```bash
# Lancer le serveur de développement
npm run dev
```

**Résultat :**
```
✓ Ready in 2s
➜ Local:   http://localhost:3000
```

**🎉 Votre application tourne !**

---

## 🔐 Se Connecter à l'Admin

### Créer le Premier Admin

#### Option A : Via Seeds (Recommandé)

Si vous avez appliqué `supabase/seeds/01_core.sql`, un admin a été créé :

```
Email : admin@example.com
Mot de passe : (voir dans le fichier seeds/01_core.sql)
```

#### Option B : Créer Manuellement

1. **Aller sur** : `http://localhost:3000`
2. **S'inscrire** avec l'email défini dans `SUPER_ADMIN_EMAILS`
3. **Aller dans Supabase Dashboard** → Authentication → Users
4. **Copier l'ID** de votre utilisateur
5. **Dans SQL Editor**, exécuter :

```sql
-- Créer le profil avec rôle super_admin
INSERT INTO user_profiles (id, name, roles, status)
VALUES (
  'VOTRE_USER_ID_ICI',
  'Votre Nom',
  '["super_admin"]'::jsonb,
  'active'
);
```

### Accéder à l'Admin

1. **Aller sur** : `http://localhost:3000/admin/login`
2. **Se connecter** avec vos identifiants
3. **🎉 Bienvenue dans l'admin !**

---

## ✅ Vérifications Post-Installation

### Checklist Rapide

- [ ] ✅ Site s'affiche sur `http://localhost:3000`
- [ ] ✅ Connexion admin fonctionne (`/admin/login`)
- [ ] ✅ Dashboard admin s'affiche
- [ ] ✅ Aucune erreur dans la console
- [ ] ✅ Tables visibles dans Supabase Dashboard

### Tester les Fonctionnalités

```bash
# 1. Tester une création (par exemple Team)
Admin → Équipe → Nouveau membre
Remplir le formulaire → Enregistrer
✅ Devrait apparaître dans la liste

# 2. Tester soft delete
Sélectionner un élément → Supprimer
✅ Devrait disparaître (mais récupérable via "Afficher supprimés")

# 3. Tester les permissions
Se déconnecter → Se reconnecter
Essayer d'accéder à /admin sans être connecté
✅ Devrait rediriger vers /admin/login
```

---

## 🎨 Personnalisation Rapide

### Changer le Nom du Site

Dans `.env.local` :
```bash
NEXT_PUBLIC_SITE_NAME="YogaPluriel"  # Votre nom
NEXT_PUBLIC_COMPANY_NAME="Association Yoga Pluriel"
```

Redémarrer le serveur :
```bash
# Ctrl+C pour arrêter
npm run dev
```

### Changer les Couleurs

Dans `src/app/globals.css` :
```css
:root {
  --primary: 220 90% 56%;    /* Couleur principale */
  --secondary: 280 60% 50%;  /* Couleur secondaire */
}
```

### Changer le Logo

Remplacer `/public/logo.svg` par votre logo.

---

## 🐛 Problèmes Courants

### Erreur : "Invalid JWT"

**Cause** : Mauvaise configuration Supabase

**Solution** :
1. Vérifier `.env.local`
2. S'assurer que `NEXT_PUBLIC_SUPABASE_URL` et les clés sont correctes
3. Redémarrer le serveur

### Erreur : "Permission denied for table..."

**Cause** : RLS policies non appliquées

**Solution** :
1. Appliquer `supabase/rls/policies.sql`
2. Vérifier que l'utilisateur a bien le rôle admin

### Page blanche / Erreurs Console

**Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules .next
npm install
npm run dev
```

### Base de données vide

**Cause** : Migrations non appliquées

**Solution** :
1. Voir Étape 4
2. Appliquer au minimum `00_core/` et les seeds

---

## 📚 Prochaines Étapes

Maintenant que votre projet tourne, consultez :

1. **[Architecture](./02-ARCHITECTURE.md)** - Comprendre la structure
2. **[Database](./03-DATABASE.md)** - Schéma DB détaillé
3. **[Customization](./09-CUSTOMIZATION.md)** - Adapter à votre projet
4. **[Deployment](./08-DEPLOYMENT.md)** - Mettre en production

---

## 🎯 Résumé

**Ce que vous avez fait :**
- ✅ Installé le boilerplate
- ✅ Créé un projet Supabase
- ✅ Configuré `.env.local`
- ✅ Créé la base de données
- ✅ Lancé l'application
- ✅ Accédé à l'admin

**Temps total : ~30 minutes**

**Prochaine étape : Personnaliser pour votre projet !**

---

**💡 Besoin d'aide ? → [Troubleshooting](./TROUBLESHOOTING.md)**
