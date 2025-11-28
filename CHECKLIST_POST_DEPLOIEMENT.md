# ✅ Checklist Post-Déploiement Vercel

Maintenant que le build fonctionne, voici les étapes pour finaliser votre déploiement :

---

## 🔐 1. Vérifier les Variables d'Environnement sur Vercel

Allez sur **Vercel** → **Votre Projet** → **Settings** → **Environment Variables**

Vérifiez que vous avez **TOUTES** ces variables :

| Variable | Valeur | Status |
|----------|--------|--------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@ep-calm-water-abos7zoz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require` | ⬜ |
| `JWT_SECRET` | Un secret aléatoire long (min 32 caractères) | ⬜ |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-site.vercel.app` | ⬜ |
| `NODE_ENV` | `production` | ⬜ |

**⚠️ Important** :
- Si `JWT_SECRET` n'existe pas, générez-en un :
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `NEXT_PUBLIC_SITE_URL` doit être l'URL exacte de votre site Vercel

---

## 🗄️ 2. Vérifier la Connexion à la Base de Données

Les migrations Prisma ont déjà été exécutées (fait précédemment).

Vérifiez que la base de données est accessible :
- ✅ Base de données Neon PostgreSQL créée
- ✅ Migrations appliquées
- ✅ `DATABASE_URL` correcte dans Vercel

---

## 🧪 3. Tester l'Application

### 3.1. Accéder au Site

1. Allez sur l'URL de votre site Vercel (ex: `https://paginea.vercel.app`)
2. Vérifiez que la page d'accueil s'affiche

### 3.2. Tester l'Inscription

1. Cliquez sur **"S'inscrire"** ou allez sur `/register`
2. Créez un compte de test
3. ✅ Vérifiez que l'inscription fonctionne

### 3.3. Tester la Connexion

1. Connectez-vous avec le compte créé
2. ✅ Vérifiez que la connexion fonctionne

### 3.4. Tester les Fonctionnalités Principales

- ✅ **Dashboard** : Créer un post-it
- ✅ **Mes Livres** : Ajouter un livre avec une critique
- ✅ **Librairie** : Voir les dernières publications
- ✅ **Profil** : Modifier le profil
- ✅ **Amis** : Rechercher des utilisateurs

---

## 🔍 4. Vérifier les Logs en Cas d'Erreur

Si quelque chose ne fonctionne pas :

1. Allez sur **Vercel** → **Votre Projet** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **"Functions"** ou **"Logs"**
4. Vérifiez les erreurs éventuelles

---

## 🎨 5. Personnaliser le Domaine (Optionnel)

Si vous voulez un domaine personnalisé :

1. Allez sur **Vercel** → **Votre Projet** → **Settings** → **Domains**
2. Ajoutez votre domaine (ex: `paginea.fr`)
3. Suivez les instructions pour configurer les DNS

---

## 📊 6. Configurer le Monitoring (Optionnel)

Pour surveiller les performances :

1. **Vercel Analytics** : Activé automatiquement
2. **Vercel Speed Insights** : Activé automatiquement
3. Vérifiez dans **Analytics** → **Web Vitals**

---

## 🔄 7. Déploiements Automatiques

Votre configuration est déjà en place :
- ✅ Webhook GitHub configuré
- ✅ Chaque push sur `main` → Déploiement automatique
- ✅ Pull requests → Preview deployments

---

## 🆘 8. En Cas de Problème

### Erreur 500 sur l'API
- Vérifiez les logs Vercel
- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que `JWT_SECRET` est défini

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que la base de données Neon est accessible
- Vérifiez les migrations Prisma

### Erreur CORS
- Les API Routes Next.js n'ont pas besoin de configuration CORS
- Si vous avez des erreurs, vérifiez que vous utilisez bien `/api/*`

---

## ✅ Checklist Finale

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Site accessible sur l'URL Vercel
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible
- [ ] Ajout de livre fonctionne
- [ ] Librairie affiche les livres
- [ ] Profil modifiable
- [ ] Pas d'erreurs dans les logs

---

**🎉 Félicitations ! Votre application Paginea est maintenant déployée sur Vercel !**

