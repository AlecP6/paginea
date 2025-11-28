# 🚀 Guide de Déploiement sur Vercel

## 📋 Prérequis

- ✅ Compte GitHub avec le repository `AlecP6/paginea`
- ✅ Compte Vercel (gratuit) : https://vercel.com
- ⚠️ **Important** : Le backend Express doit être déployé séparément (voir section Backend)

---

## 🎯 Étape 1 : Déployer le Frontend Next.js sur Vercel

### 1.1. Créer un compte Vercel

1. Allez sur **https://vercel.com**
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

### 1.2. Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez le repository **`AlecP6/paginea`**
3. Vercel détectera automatiquement Next.js

### 1.3. Configuration du projet

**Root Directory** : 
```
web
```

**Build Settings** (automatique pour Next.js) :
- Framework Preset : Next.js
- Build Command : `npm run build` (automatique)
- Output Directory : `.next` (automatique)
- Install Command : `npm install` (automatique)

### 1.4. Variables d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://votre-backend-url.com/api` | URL de votre backend déployé |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-site.vercel.app` | URL de votre site Vercel (auto-généré) |

**⚠️ Important** : Remplacez `votre-backend-url.com` par l'URL réelle de votre backend déployé.

### 1.5. Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. Votre site sera disponible sur `https://paginea.vercel.app` (ou un nom personnalisé)

---

## 🔧 Étape 2 : Déployer le Backend Express

Vercel ne supporte pas directement les serveurs Express long-running. Options :

### Option A : Railway (Recommandé - Gratuit)

1. Allez sur **https://railway.app**
2. Créez un compte avec GitHub
3. Cliquez sur **"New Project"** → **"Deploy from GitHub repo"**
4. Sélectionnez `AlecP6/paginea`
5. Configurez :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm run dev` (ou `npm start` en production)
6. Ajoutez les variables d'environnement :
   - `DATABASE_URL` : Votre URL PostgreSQL
   - `JWT_SECRET` : Votre secret JWT
   - `PORT` : `3001` (ou laissez Railway gérer)
7. Railway vous donnera une URL comme : `https://paginea-backend.railway.app`
8. Utilisez cette URL dans `NEXT_PUBLIC_API_URL` sur Vercel

### Option B : Render (Alternative gratuite)

1. Allez sur **https://render.com**
2. Créez un compte
3. **New** → **Web Service**
4. Connectez votre repo GitHub
5. Configurez :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
6. Ajoutez les variables d'environnement
7. Render vous donnera une URL

### Option C : Vercel Serverless Functions (Avancé)

Convertir les routes Express en API Routes Next.js (plus complexe).

---

## 🔗 Étape 3 : Connecter Frontend et Backend

Une fois le backend déployé :

1. **Retournez sur Vercel**
2. Allez dans **Settings** → **Environment Variables**
3. Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL de votre backend
4. **Redeployez** le projet

---

## 📝 Variables d'environnement complètes

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
NEXT_PUBLIC_SITE_URL=https://paginea.vercel.app
```

### Backend (Railway/Render)

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre-secret-jwt-tres-long-et-securise
PORT=3001
NODE_ENV=production
```

---

## ✅ Vérification

Après le déploiement :

1. ✅ Frontend accessible sur Vercel
2. ✅ Backend accessible sur Railway/Render
3. ✅ Variables d'environnement configurées
4. ✅ Testez la connexion : Le frontend doit pouvoir appeler le backend

---

## 🔄 Déploiements automatiques

Une fois configuré :
- ✅ Chaque push sur `main` → Déploiement automatique
- ✅ Pull requests → Preview deployments
- ✅ Rollback facile en cas de problème

---

## 🆘 Problèmes courants

### Erreur CORS
- Vérifiez que le backend autorise les requêtes depuis votre domaine Vercel

### Erreur 404 sur l'API
- Vérifiez que `NEXT_PUBLIC_API_URL` est correct
- Vérifiez que le backend est bien démarré

### Erreur de build
- Vérifiez les logs dans Vercel
- Vérifiez que toutes les dépendances sont dans `package.json`

---

## 📚 Ressources

- **Vercel Docs** : https://vercel.com/docs
- **Railway Docs** : https://docs.railway.app
- **Render Docs** : https://render.com/docs

---

**Bon déploiement ! 🚀**

