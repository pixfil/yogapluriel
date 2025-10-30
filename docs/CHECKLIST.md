# ✅ Checklist de Validation & Déploiement

> Liste complète pour valider votre application avant le déploiement

---

## 📋 Installation & Setup

### Configuration Initiale

- [ ] ✅ Projet cloné ou copié
- [ ] ✅ Dépendances installées (`npm install`)
- [ ] ✅ `.env.local` créé et configuré
- [ ] ✅ Projet Supabase créé
- [ ] ✅ Clés Supabase ajoutées dans `.env.local`

### Base de Données

- [ ] ✅ Migrations core (00_core/) appliquées
- [ ] ✅ Migrations content (01_content/) appliquées
- [ ] ✅ Migrations system (02_system/) appliquées
- [ ] ✅ Migrations communication (03_communication/) appliquées
- [ ] ✅ RLS policies appliquées (`rls/functions.sql` + `rls/policies.sql`)
- [ ] ✅ Storage buckets configurés (`storage/buckets.sql`)
- [ ] ✅ Seeds core appliqués (`seeds/01_core.sql`)
- [ ] ✅ Types TypeScript régénérés (`npm run db:types`)

### Premier Lancement

- [ ] ✅ `npm run dev` démarre sans erreur
- [ ] ✅ Homepage s'affiche (`http://localhost:3000`)
- [ ] ✅ Aucune erreur dans la console browser
- [ ] ✅ Aucune erreur dans le terminal

---

## 🔐 Authentification

### Setup

- [ ] ✅ Super admin créé (via seeds ou manuellement)
- [ ] ✅ Email super admin ajouté dans `SUPER_ADMIN_EMAILS`
- [ ] ✅ Connexion admin fonctionne (`/admin/login`)
- [ ] ✅ Dashboard admin s'affiche (`/admin`)

### Tests Fonctionnels

- [ ] ✅ Login avec bon mot de passe → OK
- [ ] ✅ Login avec mauvais mot de passe → Erreur
- [ ] ✅ Logout fonctionne
- [ ] ✅ Accès `/admin` sans connexion → Redirect login
- [ ] ✅ Session persiste après refresh

### Rôles & Permissions

- [ ] ✅ Super admin peut accéder à tout
- [ ] ✅ Admin peut gérer le contenu
- [ ] ✅ Éditeur peut créer/modifier
- [ ] ✅ Visiteur ne peut que lire
- [ ] ✅ RLS protège bien les données (testé avec différents rôles)

---

## 👨‍💼 Admin Panel

### Navigation

- [ ] ✅ Sidebar admin s'affiche
- [ ] ✅ Tous les menus sont accessibles
- [ ] ✅ Logout button fonctionne
- [ ] ✅ User menu affiche les bonnes infos

### Modules CRUD

Pour CHAQUE module activé :

**Utilisateurs** (si module activé)
- [ ] ✅ Liste des utilisateurs s'affiche
- [ ] ✅ Recherche fonctionne
- [ ] ✅ Création utilisateur → OK
- [ ] ✅ Modification utilisateur → OK
- [ ] ✅ Soft delete → OK
- [ ] ✅ Restore → OK
- [ ] ✅ Changement de rôle → OK
- [ ] ✅ Changement de status → OK

**Projects / Portfolio**
- [ ] ✅ Liste s'affiche
- [ ] ✅ Création → OK
- [ ] ✅ Upload image → OK
- [ ] ✅ Modification → OK
- [ ] ✅ Delete → OK
- [ ] ✅ Restore → OK
- [ ] ✅ Toggle published → OK
- [ ] ✅ Toggle featured → OK

**Team**
- [ ] ✅ Liste s'affiche
- [ ] ✅ CRUD complet fonctionne
- [ ] ✅ Upload photo → OK
- [ ] ✅ Drag & drop order → OK

**FAQ**
- [ ] ✅ Liste s'affiche
- [ ] ✅ CRUD complet fonctionne
- [ ] ✅ Catégories fonctionnent

**Lexique**
- [ ] ✅ Liste s'affiche
- [ ] ✅ CRUD complet fonctionne
- [ ] ✅ Recherche fonctionne

**Inbox / Messages**
- [ ] ✅ Liste s'affiche
- [ ] ✅ Changement status → OK
- [ ] ✅ Assignment → OK
- [ ] ✅ Notes admin → OK
- [ ] ✅ Spam score affiché
- [ ] ✅ Delete → OK

**Email Logs**
- [ ] ✅ Liste s'affiche
- [ ] ✅ Tous les champs affichés correctement
- [ ] ✅ Filtres fonctionnent

**Redirects**
- [ ] ✅ Liste s'affiche
- [ ] ✅ Création redirect → OK
- [ ] ✅ Test redirect → Fonctionne
- [ ] ✅ Wildcard redirect → Fonctionne
- [ ] ✅ Hit counter s'incrémente

**404 Logs**
- [ ] ✅ Liste s'affiche
- [ ] ✅ 404 sont bien loggés
- [ ] ✅ Création redirect depuis 404 → OK

**Popups**
- [ ] ✅ Liste s'affiche
- [ ] ✅ CRUD complet fonctionne
- [ ] ✅ Preview fonctionne
- [ ] ✅ Dates start/end respectées

**Settings**
- [ ] ✅ Tous les tabs s'affichent
- [ ] ✅ Modification settings → OK
- [ ] ✅ Settings sauvegardés en DB
- [ ] ✅ Settings appliqués dans l'app

### Bulk Operations

- [ ] ✅ Sélection multiple fonctionne
- [ ] ✅ Select all fonctionne
- [ ] ✅ Bulk delete → OK
- [ ] ✅ Bulk restore → OK

---

## 📧 Système d'Emails

### Configuration

- [ ] ✅ Compte Resend créé
- [ ] ✅ `RESEND_API_KEY` configuré
- [ ] ✅ `RESEND_FROM_EMAIL` configuré
- [ ] ✅ Domaine vérifié sur Resend (production)
- [ ] ✅ Mode test activé (DEV) : `EMAIL_TEST_MODE=true`

### Tests d'Envoi

- [ ] ✅ Email de test envoyé avec succès
- [ ] ✅ Email reçu (vérifier spam)
- [ ] ✅ Email bien formaté (HTML)
- [ ] ✅ Liens fonctionnent
- [ ] ✅ Log créé dans `email_logs`
- [ ] ✅ Status = "sent" dans logs

### Webhooks (si configuré)

- [ ] ✅ Webhook Resend créé
- [ ] ✅ `RESEND_WEBHOOK_SECRET` configuré
- [ ] ✅ Endpoint `/api/webhooks/resend` accessible
- [ ] ✅ Events received (delivered, opened, etc.)
- [ ] ✅ Logs mis à jour automatiquement

---

## 🛡️ Sécurité

### Configuration

- [ ] ✅ `SUPER_ADMIN_EMAILS` configuré
- [ ] ✅ `.env.local` **NON** commité dans Git
- [ ] ✅ `.gitignore` contient `.env.local`
- [ ] ✅ Service role key gardée secrète

### RLS (Row Level Security)

- [ ] ✅ RLS activé sur toutes les tables
- [ ] ✅ Public ne peut voir que published=true
- [ ] ✅ Users ne peuvent modifier que leur contenu
- [ ] ✅ Admins peuvent tout faire
- [ ] ✅ Service role bypass RLS (normal)

### Rate Limiting (si configuré)

- [ ] ✅ Upstash Redis configuré
- [ ] ✅ `UPSTASH_REDIS_REST_URL` et `TOKEN` configurés
- [ ] ✅ Rate limiting actif sur formulaires
- [ ] ✅ Limite respectée (tester avec plusieurs soumissions)

### Spam Detection

- [ ] ✅ Spam filter activé (si voulu)
- [ ] ✅ Message spam → Score > 50
- [ ] ✅ Message normal → Score < 30
- [ ] ✅ Spam marqué dans inbox

### reCAPTCHA (si configuré)

- [ ] ✅ Compte reCAPTCHA créé
- [ ] ✅ `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` configuré
- [ ] ✅ `RECAPTCHA_SECRET_KEY` configuré
- [ ] ✅ Badge reCAPTCHA visible sur formulaires
- [ ] ✅ Validation fonctionne

---

## 🎨 UI / UX

### Pages Publiques

- [ ] ✅ Homepage s'affiche
- [ ] ✅ Toutes les pages accessibles
- [ ] ✅ Aucun lien cassé
- [ ] ✅ Images chargent correctement
- [ ] ✅ Responsive (mobile, tablet, desktop)

### Formulaires

- [ ] ✅ Contact form fonctionne
- [ ] ✅ Validation côté client → OK
- [ ] ✅ Messages d'erreur clairs
- [ ] ✅ Success message s'affiche
- [ ] ✅ Form reset après succès

### Dark Mode (si activé)

- [ ] ✅ Toggle dark mode fonctionne
- [ ] ✅ Préférence sauvegardée
- [ ] ✅ Toutes les pages OK en dark mode
- [ ] ✅ Contraste suffisant

### Animations

- [ ] ✅ Pas de lag
- [ ] ✅ Pas de flash au chargement
- [ ] ✅ Loading states affichés

---

## 🚀 Performance

### Build

- [ ] ✅ `npm run build` réussit
- [ ] ✅ Aucune erreur TypeScript
- [ ] ✅ Aucune erreur ESLint
- [ ] ✅ `npm run start` démarre la prod build

### Optimisations

- [ ] ✅ Images optimisées (Next.js Image)
- [ ] ✅ Lazy loading actif
- [ ] ✅ Bundle size raisonnable (<500KB initial)
- [ ] ✅ Fonts optimisés

### Tests Lighthouse

- [ ] ✅ Performance > 80
- [ ] ✅ Accessibility > 90
- [ ] ✅ Best Practices > 90
- [ ] ✅ SEO > 90

---

## 📊 SEO

### Meta Tags

- [ ] ✅ Title dynamique sur chaque page
- [ ] ✅ Description unique par page
- [ ] ✅ OG images configurés
- [ ] ✅ Twitter cards configurés

### Sitemap & Robots

- [ ] ✅ `sitemap.xml` généré (si implémenté)
- [ ] ✅ `robots.txt` créé
- [ ] ✅ Sitemap soumis à Google Search Console

### Structured Data

- [ ] ✅ Schema.org markup (si implémenté)
- [ ] ✅ Validé avec Google Rich Results Test

---

## 🌍 Production

### Environnement

- [ ] ✅ Projet déployé sur Vercel/Netlify/autre
- [ ] ✅ Toutes les env vars configurées sur la plateforme
- [ ] ✅ Domaine custom configuré
- [ ] ✅ HTTPS activé
- [ ] ✅ SSL certificate valide

### Base de Données Production

- [ ] ✅ Projet Supabase production créé (séparé du dev)
- [ ] ✅ Migrations appliquées
- [ ] ✅ Seeds appliqués (core seulement, pas démo)
- [ ] ✅ Backups configurés

### Email Production

- [ ] ✅ `EMAIL_TEST_MODE=false` en prod
- [ ] ✅ Domaine vérifié sur Resend
- [ ] ✅ Email envoyé avec vrai domaine (`@votresite.com`)

### Monitoring

- [ ] ✅ Sentry configuré (si utilisé)
- [ ] ✅ Analytics configuré (GA, Clarity, etc.)
- [ ] ✅ Uptime monitoring (UptimeRobot, etc.)

### Tests Production

- [ ] ✅ Site accessible via domaine
- [ ] ✅ Admin login fonctionne
- [ ] ✅ Formulaires envoient des emails
- [ ] ✅ Pas d'erreurs dans Sentry
- [ ] ✅ Aucune erreur console

---

## 📝 Documentation

### Code

- [ ] ✅ Code commenté (fonctions complexes)
- [ ] ✅ Types TypeScript à jour
- [ ] ✅ README.md à jour

### Admin

- [ ] ✅ Guide utilisateur admin créé (si besoin)
- [ ] ✅ Vidéo démo enregistrée (optionnel)

---

## 🎯 Post-Déploiement

### Jour 1

- [ ] ✅ Vérifier analytics (trafic enregistré)
- [ ] ✅ Tester formulaire de contact (production)
- [ ] ✅ Vérifier emails reçus
- [ ] ✅ Checker Sentry (aucune erreur)

### Semaine 1

- [ ] ✅ Monitorer performance (Vercel Analytics)
- [ ] ✅ Vérifier taux d'erreur
- [ ] ✅ Collecter feedback utilisateurs
- [ ] ✅ Fix bugs critiques si besoin

### Mois 1

- [ ] ✅ Review analytics complets
- [ ] ✅ Optimisations si nécessaire
- [ ] ✅ Mise à jour dépendances
- [ ] ✅ Backup DB vérifié

---

## ⚠️ Avant de Passer en Production

### CRITIQUE - À FAIRE ABSOLUMENT

1. **Changer TOUS les mots de passe par défaut**
2. **Vérifier que `.env.local` n'est PAS commité**
3. **Tester les backups Supabase**
4. **Configurer les emails avec un vrai domaine**
5. **Activer le mode production** (`EMAIL_TEST_MODE=false`)
6. **Supprimer les données de démo** si présentes
7. **Vérifier les RLS policies** (sécurité !)
8. **Tester avec différents navigateurs**
9. **Configurer monitoring** (Sentry, Analytics)
10. **Préparer procédure de rollback** en cas de problème

---

## 🎉 Checklist Complétée ?

**Si toutes les cases sont cochées : BRAVO ! 🚀**

Votre application est prête pour la production !

**Liens utiles :**
- [Documentation complète](./00-OVERVIEW.md)
- [Guide déploiement](./08-DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**💡 Conseil** : Imprimez ou sauvegardez cette checklist pour chaque nouveau projet !
