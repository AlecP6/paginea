# 🐛 Debug : Problème d'Inscription

## 🔍 Étape 1 : Vérifier les Variables d'Environnement sur Vercel

Allez sur **Vercel** → **Votre Projet** → **Settings** → **Environment Variables**

### Variables REQUISES :

| Variable | Doit être définie | Exemple |
|----------|-------------------|---------|
| `DATABASE_URL` | ✅ OUI | `postgresql://neondb_owner:...@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | ✅ OUI | `26a97068803e2bc37a1a90a9473ac51e46e0a8f793bf23bc8a92364fc64ffe97` |
| `NEXT_PUBLIC_SITE_URL` | ✅ OUI | `https://votre-site.vercel.app` |
| `NODE_ENV` | ✅ OUI | `production` |

**⚠️ Si une variable manque :**
1. Cliquez sur **"Add"**
2. Entrez le nom et la valeur
3. Sélectionnez **"Production"** (et **"Preview"** et **"Development"** si vous voulez)
4. Cliquez sur **"Save"**
5. **Redeployez** le projet

---

## 🔍 Étape 2 : Vérifier les Logs Vercel

1. Allez sur **Vercel** → **Votre Projet** → **Deployments**
2. Cliquez sur le **dernier déploiement**
3. Allez dans l'onglet **"Functions"** ou **"Logs"**
4. Essayez de créer un compte
5. Regardez les logs en temps réel

### Erreurs courantes à chercher :

- ❌ `JWT_SECRET not configured` → Ajoutez `JWT_SECRET` dans les variables d'environnement
- ❌ `Can't reach database server` → Vérifiez `DATABASE_URL`
- ❌ `PrismaClientInitializationError` → Problème de connexion à la base de données
- ❌ `500 Internal Server Error` → Regardez les détails dans les logs

---

## 🔍 Étape 3 : Tester l'API Directement

Ouvrez la console du navigateur (F12) et regardez l'onglet **Network** :

1. Allez sur la page d'inscription
2. Remplissez le formulaire
3. Cliquez sur "S'inscrire"
4. Dans l'onglet **Network**, cherchez la requête vers `/api/auth/register`
5. Cliquez dessus et regardez :
   - **Status Code** : Doit être `201` (succès) ou `400`/`500` (erreur)
   - **Response** : Le message d'erreur exact

---

## 🔍 Étape 4 : Vérifier la Connexion à la Base de Données

### Option A : Via Vercel Functions Logs

Les logs Vercel devraient montrer si Prisma arrive à se connecter.

### Option B : Tester localement avec la même DATABASE_URL

```bash
cd web
export DATABASE_URL="postgresql://neondb_owner:npg_PCcuQgK1fmX9@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
npx prisma db pull
```

Si ça fonctionne, la base de données est accessible.

---

## 🔍 Étape 5 : Vérifier que les Migrations sont Appliquées

Les migrations ont été appliquées précédemment, mais vérifions :

```bash
cd web
export DATABASE_URL="postgresql://neondb_owner:npg_PCcuQgK1fmX9@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate status
```

Toutes les migrations doivent être marquées comme **applied**.

---

## 🆘 Solutions Rapides

### Si l'erreur est "JWT_SECRET not configured"

1. Allez sur Vercel → Settings → Environment Variables
2. Ajoutez `JWT_SECRET` avec une valeur longue (min 32 caractères)
3. Redeployez

### Si l'erreur est "Can't reach database server"

1. Vérifiez que `DATABASE_URL` est correcte
2. Vérifiez que la base de données Neon est active
3. Vérifiez que l'URL contient bien `?sslmode=require`

### Si l'erreur est "500 Internal Server Error"

1. Regardez les logs Vercel pour le détail exact
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que Prisma peut se connecter

---

## 📝 Informations à Me Donner

Pour que je puisse vous aider, donnez-moi :

1. **Le message d'erreur exact** (dans le toast ou la console)
2. **Le status code** de la requête (dans l'onglet Network)
3. **Les logs Vercel** (copiez les erreurs)
4. **Les variables d'environnement** que vous avez configurées (sans les valeurs sensibles)

---

## ✅ Checklist de Vérification

- [ ] `DATABASE_URL` est définie sur Vercel
- [ ] `JWT_SECRET` est définie sur Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` est définie sur Vercel
- [ ] `NODE_ENV` est définie à `production`
- [ ] Le projet a été redeployé après avoir ajouté les variables
- [ ] Les logs Vercel sont consultés
- [ ] La console du navigateur est vérifiée

