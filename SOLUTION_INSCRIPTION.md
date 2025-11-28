# 🔧 Solution : Problème d'Inscription

## 🎯 Étapes de Diagnostic

### 1️⃣ Accéder à la Page de Diagnostic

Une fois le déploiement terminé, allez sur :
```
https://votre-site.vercel.app/test-db
```

Cette page vous montrera :
- ✅ Si la base de données est connectée
- ✅ Si `JWT_SECRET` est configuré
- ✅ Si `DATABASE_URL` est configuré
- ❌ Les erreurs exactes

---

### 2️⃣ Vérifier les Variables d'Environnement sur Vercel

**Allez sur :** Vercel → Votre Projet → **Settings** → **Environment Variables**

#### Variables REQUISES :

| Variable | Valeur | Où la trouver |
|----------|--------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_PCcuQgK1fmX9@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require` | Neon Dashboard |
| `JWT_SECRET` | `26a97068803e2bc37a1a90a9473ac51e46e0a8f793bf23bc8a92364fc64ffe97` | Généré précédemment |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-site.vercel.app` | Votre URL Vercel |
| `NODE_ENV` | `production` | À définir manuellement |

**⚠️ IMPORTANT :**
1. Pour chaque variable, sélectionnez **"Production"**, **"Preview"**, et **"Development"**
2. Cliquez sur **"Save"**
3. **Redeployez** le projet (Settings → Deployments → Redeploy)

---

### 3️⃣ Vérifier les Logs Vercel

1. Allez sur **Vercel** → **Votre Projet** → **Deployments**
2. Cliquez sur le **dernier déploiement**
3. Allez dans l'onglet **"Functions"** ou **"Logs"**
4. Essayez de créer un compte
5. Regardez les logs en temps réel

**Cherchez ces erreurs :**

- ❌ `JWT_SECRET not configured` → Ajoutez `JWT_SECRET`
- ❌ `Can't reach database server` → Vérifiez `DATABASE_URL`
- ❌ `P1001` → Problème de connexion à la base de données
- ❌ `PrismaClientInitializationError` → Problème Prisma

---

### 4️⃣ Vérifier que Prisma est Généré

Sur Vercel, lors du build, Prisma doit être généré automatiquement grâce à :

```json
"postinstall": "prisma generate"
```

**Vérifiez dans les logs de build :**
- Cherchez `Running "prisma generate"`
- Vérifiez qu'il n'y a pas d'erreur

---

### 5️⃣ Vérifier les Migrations

Les migrations doivent être appliquées. Si ce n'est pas le cas :

```bash
cd web
export DATABASE_URL="postgresql://neondb_owner:npg_PCcuQgK1fmX9@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy
```

---

## 🆘 Solutions par Erreur

### Erreur : "JWT_SECRET not configured"

**Solution :**
1. Allez sur Vercel → Settings → Environment Variables
2. Ajoutez `JWT_SECRET` avec une valeur longue (min 32 caractères)
3. Sélectionnez **Production**, **Preview**, **Development**
4. **Redeployez**

---

### Erreur : "Can't reach database server" ou "P1001"

**Solutions :**
1. Vérifiez que `DATABASE_URL` est correcte
2. Vérifiez que la base de données Neon est **active** (pas en pause)
3. Vérifiez que l'URL contient bien `?sslmode=require`
4. Testez la connexion :
   ```bash
   npx prisma db pull
   ```

---

### Erreur : "PrismaClientInitializationError"

**Solutions :**
1. Vérifiez que `DATABASE_URL` est définie
2. Vérifiez que `postinstall` est dans `package.json`
3. Regardez les logs de build Vercel pour voir si `prisma generate` a échoué

---

### Erreur : "500 Internal Server Error" (générique)

**Solution :**
1. Allez sur `/test-db` pour voir le diagnostic
2. Regardez les logs Vercel pour le détail exact
3. Vérifiez toutes les variables d'environnement

---

## 📋 Checklist Complète

- [ ] `DATABASE_URL` est définie sur Vercel (Production, Preview, Development)
- [ ] `JWT_SECRET` est définie sur Vercel (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SITE_URL` est définie sur Vercel
- [ ] `NODE_ENV` est définie à `production`
- [ ] Le projet a été **redeployé** après avoir ajouté les variables
- [ ] La page `/test-db` montre que tout est OK
- [ ] Les logs Vercel ne montrent pas d'erreur
- [ ] La base de données Neon est **active** (pas en pause)

---

## 🔍 Test Rapide

1. Allez sur `https://votre-site.vercel.app/test-db`
2. Si tout est vert ✅ → Le problème vient peut-être du formulaire
3. Si quelque chose est rouge ❌ → Suivez les solutions ci-dessus

---

## 📞 Informations à Me Donner

Si ça ne fonctionne toujours pas, donnez-moi :

1. **Le résultat de `/test-db`** (copiez l'écran ou le JSON)
2. **Les logs Vercel** (les dernières lignes d'erreur)
3. **Le message d'erreur exact** dans le toast/console
4. **Le status code** de la requête (dans l'onglet Network)

