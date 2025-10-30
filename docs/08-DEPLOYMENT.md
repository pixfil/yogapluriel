# 🚀 Guide de Déploiement en Production

> Guide complet pour déployer votre application Next.js + Supabase en production

---

## 📋 Checklist Pré-Déploiement

Avant de déployer, assurez-vous d'avoir:

- [ ] ✅ Testé l'application en local (pas d'erreurs)
- [ ] ✅ Build réussit sans erreurs (`npm run build`)
- [ ] ✅ Base de données Supabase de PRODUCTION créée (séparée du dev)
- [ ] ✅ Migrations appliquées sur DB production
- [ ] ✅ Super admin créé en production
- [ ] ✅ Variables d'environnement documentées
- [ ] ✅ Domaine personnalisé réservé (optionnel)
- [ ] ✅ Compte Resend configuré (emails)
- [ ] ✅ Compte Upstash configuré (rate limiting - optionnel)

---

## 🌍 Option 1: Déploiement sur Vercel (Recommandé)

### Pourquoi Vercel ?

- ✅ Optimisé pour Next.js (créé par la même équipe)
- ✅ Déploiement automatique depuis Git
- ✅ CDN global inclus
- ✅ SSL/HTTPS automatique
- ✅ Variables d'environnement faciles
- ✅ Preview deployments (branches)
- ✅ Plan gratuit généreux

### Étapes de Déploiement

#### 1. Préparer le Projet

```bash
# S'assurer que le build fonctionne
npm run build
npm run start  # Tester la version production en local

# Vérifier qu'il n'y a pas d'erreurs TypeScript/ESLint
npm run lint
```

#### 2. Pousser sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit - Ready for production"

# Créer repo sur GitHub et pousser
git remote add origin https://github.com/votre-username/votre-projet.git
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANT:** Vérifiez que `.env.local` est bien dans `.gitignore` !

#### 3. Créer Projet Vercel

**Via l'interface web (Recommandé):**

1. Aller sur [vercel.com](https://vercel.com)
2. "Add New" → "Project"
3. Importer votre repo GitHub
4. Vercel détecte automatiquement Next.js
5. Configurer les variables d'environnement (voir section ci-dessous)
6. Cliquer "Deploy"

**Via CLI (Alternative):**

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Puis suivre les prompts
```

#### 4. Configurer Variables d'Environnement sur Vercel

Dans **Project Settings → Environment Variables**, ajouter:

**OBLIGATOIRES:**
```bash
# Next.js
NEXT_PUBLIC_SITE_NAME=Votre Nom de Site
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com

# Supabase PRODUCTION
NEXT_PUBLIC_SUPABASE_URL=https://xxxyyyzz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ⚠️ ULTRA SECRET

# Admin
SUPER_ADMIN_EMAILS=admin@votre-site.com,boss@votre-site.com
```

**RECOMMANDÉS:**
```bash
# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@votre-domaine.com
EMAIL_TEST_MODE=false               # ⚠️ Important: false en prod
EMAIL_TEST_RECIPIENT=               # Laisser vide en prod

# Sécurité (Upstash Redis - optionnel)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# reCAPTCHA (optionnel)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

**💡 Tip:** Pour chaque variable, choisir l'environnement:
- **Production** (obligatoire)
- **Preview** (pour branches)
- **Development** (pour `vercel dev`)

#### 5. Domaine Personnalisé (Optionnel)

**Dans Vercel:**
1. Project Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS chez votre registrar:
   - Type: `A` Record → `76.76.21.21`
   - Type: `CNAME` www → `cname.vercel-dns.com`
4. Attendre propagation DNS (1h à 48h)
5. SSL automatique activé par Vercel

#### 6. Webhooks Resend (Emails)

**Configuration:**
1. Aller sur [resend.com](https://resend.com) → Webhooks
2. Créer webhook avec URL: `https://votre-domaine.com/api/webhooks/resend`
3. Sélectionner events:
   - `email.sent`
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`
4. Noter le `WEBHOOK_SECRET`
5. Ajouter dans Vercel env vars:
   ```bash
   RESEND_WEBHOOK_SECRET=whsec_...
   ```

#### 7. Vérifications Post-Déploiement

- [ ] ✅ Site accessible via URL Vercel (https://votre-projet.vercel.app)
- [ ] ✅ Domaine custom fonctionne (si configuré)
- [ ] ✅ HTTPS actif (cadenas vert)
- [ ] ✅ Login admin fonctionne
- [ ] ✅ Dashboard charge sans erreur
- [ ] ✅ Formulaire de contact envoie email
- [ ] ✅ Images uploadent correctement
- [ ] ✅ Aucune erreur dans Function Logs (Vercel Dashboard)

---

## 🐳 Option 2: Déploiement sur VPS (Docker)

### Prérequis

- Serveur VPS (DigitalOcean, Hetzner, OVH, etc.)
- Docker installé
- Nginx pour reverse proxy
- Domaine pointant vers le serveur

### 1. Dockerfile

Créer `Dockerfile` à la racine:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copier les fichiers nécessaires
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

### 3. Créer .env.production

```bash
# Copier depuis .env.example et remplir avec valeurs production
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
# ... toutes les autres variables
```

### 4. Déployer

```bash
# Sur le serveur
git clone https://github.com/votre-username/votre-projet.git
cd votre-projet

# Créer .env.production avec les vraies valeurs
nano .env.production

# Build et démarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f web
```

### 5. Nginx Reverse Proxy

Créer `/etc/nginx/sites-available/votre-site`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/votre-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL avec Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 🎯 Option 3: Netlify

### Étapes

1. Connecter repo GitHub sur [netlify.com](https://netlify.com)
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
3. Ajouter variables d'environnement (comme Vercel)
4. Deploy!

**Note:** Netlify nécessite un adaptateur pour Next.js App Router. Vercel reste plus simple.

---

## 🗄️ Base de Données Production

### 1. Créer Projet Supabase Production

**⚠️ TRÈS IMPORTANT:** Créez un projet Supabase **SÉPARÉ** pour la production !

1. Aller sur [supabase.com](https://supabase.com)
2. Créer **nouveau** projet (pas le même que dev!)
3. Choisir région proche de vos utilisateurs
4. Choisir un mot de passe fort
5. Attendre création (~2 min)

### 2. Appliquer Migrations

**Via SQL Editor (Recommandé):**
1. Ouvrir SQL Editor
2. Copier-coller chaque fichier de `supabase/migrations_organized/` dans l'ordre
3. Exécuter un par un

**Via CLI:**
```bash
# Lier au projet production
supabase link --project-ref xxxyyyzz-production

# Appliquer migrations
supabase db push
```

### 3. Appliquer Seeds

**Uniquement `01_core.sql`** (admin + settings):
```sql
-- Copier-coller dans SQL Editor
-- NE PAS appliquer 02_demo_content.sql en production !
```

### 4. Configurer Backups

**Dans Supabase Dashboard:**
1. Database → Backups
2. Activer Daily Backups (gratuit sur plan Pro)
3. Configurer Point-in-Time Recovery (PITR) si besoin

### 5. Monitoring

- ✅ Activer les alertes (Database → Settings)
- ✅ Monitorer les connexions
- ✅ Surveiller l'espace disque
- ✅ Vérifier les logs RLS

---

## 📧 Configuration Email Production

### 1. Domaine Vérifié Resend

**Obligatoire pour envoyer depuis votre domaine:**

1. Aller sur [resend.com](https://resend.com) → Domains
2. Ajouter votre domaine: `votre-domaine.com`
3. Configurer les DNS records (SPF, DKIM, DMARC):
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.io ~all

   Type: TXT
   Name: resend._domainkey
   Value: [fourni par Resend]
   ```
4. Attendre vérification (~15 min)
5. Une fois vérifié, vous pouvez envoyer depuis `noreply@votre-domaine.com`

### 2. Variables d'Environnement

```bash
RESEND_FROM_EMAIL=noreply@votre-domaine.com  # Votre domaine vérifié
EMAIL_TEST_MODE=false                        # ⚠️ Important !
# EMAIL_TEST_RECIPIENT (ne pas définir en prod)
```

---

## 🔒 Sécurité Production

### Checklist Sécurité

- [ ] ✅ `.env.local` **JAMAIS** commité dans Git
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` gardé ultra secret
- [ ] ✅ HTTPS activé (SSL)
- [ ] ✅ RLS activé sur toutes les tables Supabase
- [ ] ✅ Rate limiting activé (Upstash)
- [ ] ✅ reCAPTCHA activé sur formulaires
- [ ] ✅ Headers sécurité configurés (CSP, HSTS, etc.)
- [ ] ✅ Mots de passe admin changés
- [ ] ✅ Monitoring erreurs activé (Sentry optionnel)

### Headers Sécurité (next.config.js)

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics (Intégré)

Gratuit et automatique sur Vercel:
- Vitals Web (performance)
- Trafic
- Erreurs

**Activer:**
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Sentry (Erreurs)

**Installation:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```bash
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### 3. Google Analytics 4 (Optionnel)

```typescript
// app/layout.tsx
import Script from 'next/script';

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

---

## 🔄 CI/CD (Automatisation)

### Vercel (Automatique)

- ✅ Chaque push sur `main` → Deploy production
- ✅ Chaque push sur autre branch → Preview deployment
- ✅ Chaque PR → Preview unique

### GitHub Actions (Optionnel)

Créer `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

## 🐛 Debugging Production

### Logs Vercel

**Function Logs:**
1. Vercel Dashboard → votre projet
2. Onglet "Functions"
3. Voir les logs en temps réel

**Runtime Logs:**
```bash
# Via CLI
vercel logs https://votre-projet.vercel.app
```

### Logs Supabase

**Logs de Requêtes:**
1. Supabase Dashboard → Logs
2. Voir requêtes API, Auth, Database
3. Filtrer par status code, endpoint, etc.

**Logs RLS:**
```sql
-- Voir les policies appliquées
SELECT * FROM pg_policies WHERE tablename = 'votre_table';
```

---

## 📈 Performance

### Optimisations

- ✅ Images Next.js (`<Image />` component)
- ✅ Fonts optimisées (next/font)
- ✅ Code splitting automatique
- ✅ ISR (Incremental Static Regeneration) pour pages
- ✅ CDN Vercel (global)

### Lighthouse Targets

Viser:
- **Performance:** > 90
- **Accessibility:** > 90
- **Best Practices:** > 90
- **SEO:** > 90

---

## 🔙 Rollback (Plan B)

### Sur Vercel

1. Deployments → Voir l'historique
2. Sélectionner un déploiement précédent
3. Cliquer "Promote to Production"
4. Instant rollback!

### Sur VPS

```bash
# Garder les anciennes versions
docker-compose down
git checkout <commit-précédent>
docker-compose up -d --build
```

---

## ✅ Checklist Post-Déploiement

**Jour 1:**
- [ ] ✅ Site accessible et rapide
- [ ] ✅ Login admin fonctionne
- [ ] ✅ Formulaires envoient des emails
- [ ] ✅ Images/uploads fonctionnent
- [ ] ✅ Aucune erreur dans logs
- [ ] ✅ Analytics tracking actif

**Semaine 1:**
- [ ] ✅ Monitorer performances (Vercel Analytics)
- [ ] ✅ Vérifier taux d'erreur (Sentry)
- [ ] ✅ Tester sur différents navigateurs
- [ ] ✅ Tester responsive (mobile/tablet)
- [ ] ✅ Backup DB testé

**Mois 1:**
- [ ] ✅ Review analytics complets
- [ ] ✅ Optimisations si nécessaire
- [ ] ✅ Mise à jour dépendances
- [ ] ✅ Feedback utilisateurs collecté

---

## 🆘 Troubleshooting

### Build Failed

```bash
# Localement, vérifier
npm run build

# Erreurs TypeScript
npm run type-check

# Erreurs ESLint
npm run lint
```

### Variables d'Environnement Manquantes

- Vérifier qu'elles sont bien définies dans Vercel
- Redéployer après ajout de variables

### Emails Non Envoyés

- Vérifier `EMAIL_TEST_MODE=false`
- Vérifier domaine vérifié sur Resend
- Checker logs Resend Dashboard

### Erreurs RLS

```sql
-- Vérifier policies
SELECT * FROM pg_policies WHERE tablename = 'votre_table';

-- Tester en tant que user
SET ROLE authenticated;
SELECT * FROM votre_table;  -- Devrait respecter RLS
```

---

## 📞 Support

**Vercel:** [vercel.com/support](https://vercel.com/support)
**Supabase:** [supabase.com/support](https://supabase.com/support)
**Resend:** [resend.com/docs](https://resend.com/docs)

---

**🎉 Félicitations ! Votre application est en production !**

→ Retour à la [Documentation Principale](../README.md)
