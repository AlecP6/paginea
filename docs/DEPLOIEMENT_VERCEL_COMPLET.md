# 🚀 Guide de Déploiement Complet sur Vercel

Votre application est maintenant prête à être déployée entièrement sur Vercel ! Toutes les routes API ont été migrées vers Next.js API Routes.

---

## 📋 Prérequis

- ✅ Compte GitHub avec le repository `AlecP6/paginea`
- ✅ Compte Vercel (gratuit) : https://vercel.com
- ✅ Base de données PostgreSQL (Vercel Postgres, Supabase, ou autre)

---

## 🎯 Étape 1 : Préparer la Base de Données

### Option A : Vercel Postgres (Recommandé - Intégré)

1. Dans votre projet Vercel, allez dans **Storage**
2. Cliquez sur **"Create Database"** → **"Postgres"**
3. Vercel créera automatiquement une base de données et vous donnera la `DATABASE_URL`

### Option B : Supabase (Gratuit - Alternative)

1. Allez sur **https://supabase.com**
2. Créez un projet
3. Récupérez la `DATABASE_URL` dans **Settings** → **Database**

### Option C : Autre PostgreSQL

- Utilisez votre propre instance PostgreSQL
- Récupérez la `DATABASE_URL` au format : `postgresql://user:password@host:port/database`

---

## 🔧 Étape 2 : Exécuter les Migrations Prisma

Une fois la base de données créée :

```bash
# Dans le dossier web
cd web
npx prisma migrate deploy
```

Ou depuis le backend (si vous préférez) :
```bash
cd backend
npm run migrate:prod
```

---

## 🚀 Étape 3 : Déployer sur Vercel

### 3.1. Créer un compte Vercel

1. Allez sur **https://vercel.com**
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

### 3.2. Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez le repository **`AlecP6/paginea`**
3. Vercel détectera automatiquement Next.js

### 3.3. Configuration du projet

**Root Directory** : 
```
web
```

**Build Settings** (automatique pour Next.js) :
- Framework Preset : Next.js
- Build Command : `prisma generate && npm run build` (déjà configuré)
- Output Directory : `.next` (automatique)
- Install Command : `npm install` (automatique)

### 3.4. Variables d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DATABASE_URL` | `postgresql://...` | URL de votre base de données PostgreSQL |
| `JWT_SECRET` | `votre-secret-jwt-tres-long-et-securise` | Secret pour signer les tokens JWT |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-site.vercel.app` | URL de votre site (sera auto-généré) |
| `NODE_ENV` | `production` | Environnement de production |

**⚠️ Important** : 
- `JWT_SECRET` : Générez un secret aléatoire long (minimum 32 caractères)
- `DATABASE_URL` : Utilisez l'URL fournie par Vercel Postgres ou votre fournisseur
- `NEXT_PUBLIC_SITE_URL` : Sera automatiquement rempli par Vercel après le premier déploiement

### 3.5. Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 3-5 minutes
3. Votre site sera disponible sur `https://paginea.vercel.app` (ou un nom personnalisé)

---

## 📝 Variables d'environnement complètes

### Production (Vercel)

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre-secret-jwt-tres-long-et-securise-minimum-32-caracteres
NEXT_PUBLIC_SITE_URL=https://paginea.vercel.app
NODE_ENV=production
```

---

## ✅ Vérification après déploiement

1. ✅ Site accessible sur Vercel
2. ✅ Base de données connectée
3. ✅ Migrations Prisma exécutées
4. ✅ Variables d'environnement configurées
5. ✅ Testez la connexion : Créez un compte et testez les fonctionnalités

---

## 🔄 Déploiements automatiques

Une fois configuré :
- ✅ Chaque push sur `main` → Déploiement automatique
- ✅ Pull requests → Preview deployments
- ✅ Rollback facile en cas de problème

---

## 📁 Structure des API Routes

Toutes les routes API sont maintenant dans `/web/src/app/api/` :

- `/api/auth/*` - Authentification (register, login, me)
- `/api/book-reviews/*` - Critiques de livres
- `/api/books/*` - Recherche de livres (Google Books API)
- `/api/users/*` - Profils utilisateurs (à créer si nécessaire)
- `/api/posts/*` - Posts (à créer si nécessaire)
- `/api/friendships/*` - Amis (à créer si nécessaire)
- `/api/comments/*` - Commentaires (à créer si nécessaire)

---

## 🆘 Problèmes courants

### Erreur "Prisma Client not generated"
- Solution : Vérifiez que `prisma generate` est dans le build command
- Vérifiez que `postinstall` script est présent dans `package.json`

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que la base de données est accessible depuis Internet
- Vérifiez les migrations : `npx prisma migrate deploy`

### Erreur CORS
- Les API Routes Next.js n'ont pas besoin de configuration CORS
- Si vous avez des erreurs, vérifiez que vous utilisez bien `/api/*` et non l'ancien backend

### Erreur 404 sur les routes API
- Vérifiez que les fichiers sont dans `/web/src/app/api/`
- Vérifiez que les noms de fichiers sont corrects (`route.ts` pour Next.js 13+)

---

## 📚 Ressources

- **Vercel Docs** : https://vercel.com/docs
- **Next.js API Routes** : https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Prisma avec Vercel** : https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

## 🎉 C'est tout !

Votre application est maintenant entièrement déployable sur Vercel. Plus besoin de backend séparé !

**Bon déploiement ! 🚀**

