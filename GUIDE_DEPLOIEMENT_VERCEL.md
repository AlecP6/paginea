# 🚀 Guide de Configuration Vercel pour Paginea

## 🔧 Corrections Appliquées

### 1. Configuration Node.js
✅ **package.json** : Changé `"node": "20.x"` → `"node": ">=20.x"`
✅ **vercel.json** : Ajout de `installCommand` et `devCommand`

---

## ⚙️ Configuration dans le Dashboard Vercel

Si le déploiement échoue toujours, suivez ces étapes dans votre dashboard Vercel :

### 1. Accéder aux Settings du Projet

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet **paginea**
3. Cliquez sur **Settings**

### 2. Configurer le Root Directory

**Important** : Votre projet utilise un monorepo, il faut indiquer le bon répertoire.

1. Dans **Settings** → **General** → **Root Directory**
2. Cliquez sur **Edit**
3. Entrez : `web`
4. Cliquez sur **Save**

### 3. Configurer Node.js Version

1. Dans **Settings** → **General** → **Node.js Version**
2. Sélectionnez : **20.x** (ou la dernière version disponible)
3. Cliquez sur **Save**

### 4. Configurer les Build Settings

1. Dans **Settings** → **General** → **Build & Development Settings**
2. Vérifiez :
   - **Framework Preset** : `Next.js`
   - **Build Command** : `npm run build` (ou laissez vide pour auto-détection)
   - **Output Directory** : `.next` (ou laissez vide)
   - **Install Command** : `npm install` (ou laissez vide)

### 5. Variables d'Environnement

⚠️ **CRITIQUE** : Sans ces variables, votre application ne fonctionnera pas !

1. Dans **Settings** → **Environment Variables**
2. Ajoutez les variables suivantes :

```
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require
JWT_SECRET=[votre_secret_jwt_très_long_et_sécurisé]
BLOB_READ_WRITE_TOKEN=[votre_token_vercel_blob]
NEXT_PUBLIC_ADSENSE_CLIENT_ID=[votre_id_adsense_optionnel]
```

**Pour DATABASE_URL** :
- Si vous utilisez Vercel Postgres, copiez l'URL depuis l'onglet Storage
- Si vous utilisez Supabase, Railway, ou autre, copiez l'URL de connexion

**Pour JWT_SECRET** :
- Générez un secret fort : `openssl rand -base64 64`
- Ou utilisez : `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`

**Pour BLOB_READ_WRITE_TOKEN** :
- Allez dans **Storage** → **Vercel Blob**
- Créez un token avec permissions Read/Write

3. Pour chaque variable :
   - Cliquez sur **Add New**
   - Entrez le **Key** et la **Value**
   - Sélectionnez tous les environnements : **Production**, **Preview**, **Development**
   - Cliquez sur **Save**

---

## 🔍 Débogage

### Si le build échoue encore

1. **Vérifiez les logs** :
   - Allez dans **Deployments**
   - Cliquez sur le déploiement qui a échoué
   - Lisez les logs pour identifier l'erreur

2. **Erreurs courantes** :

#### "Cannot find module '@prisma/client'"
→ Ajoutez un script `postinstall` dans `package.json` :
```json
"postinstall": "prisma generate"
```
✅ Déjà fait !

#### "DATABASE_URL is not defined"
→ Ajoutez la variable d'environnement dans Vercel

#### "JWT_SECRET is not defined"
→ Ajoutez la variable d'environnement dans Vercel

#### "Node.js version mismatch"
→ Vérifiez que Root Directory est bien configuré à `web`

### Forcer un nouveau déploiement

1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **⋯** (trois points)
4. Cliquez sur **Redeploy**

---

## 📝 Checklist de Déploiement

- [ ] Root Directory configuré à `web`
- [ ] Node.js version configurée (20.x)
- [ ] Variable `DATABASE_URL` ajoutée
- [ ] Variable `JWT_SECRET` ajoutée
- [ ] Variable `BLOB_READ_WRITE_TOKEN` ajoutée (si upload d'images)
- [ ] Script `postinstall` présent dans package.json
- [ ] Dernier commit poussé sur GitHub
- [ ] Déploiement Vercel déclenché

---

## 🎯 Résultat Attendu

Une fois configuré correctement, vous devriez voir :

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ Collecting build traces

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         123 kB
├ ○ /about                               1.8 kB         95 kB
├ ○ /dashboard                           3.4 kB         98 kB
...

✓ Build completed successfully
```

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez toujours des problèmes :
1. Copiez-collez les logs d'erreur complets
2. Vérifiez que toutes les variables d'environnement sont bien configurées
3. Assurez-vous que votre base de données est accessible depuis Vercel

---

**Dernière mise à jour** : 2026-02-07
