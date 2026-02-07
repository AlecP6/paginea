# 🔑 Configuration Google Books API

## Problème
L'API Google Books a des limites de requêtes sans clé API. Vous voyez l'erreur : **"Erreur lors de la recherche de livres"**

---

## ✅ Solution : Ajouter une Clé API Google Books

### Étape 1 : Créer une Clé API

1. **Allez sur Google Cloud Console** :
   👉 https://console.cloud.google.com/

2. **Créez un projet** (si vous n'en avez pas) :
   - Cliquez sur le menu déroulant en haut à gauche
   - "Nouveau projet"
   - Nom : `Paginea` (ou autre)
   - Créer

3. **Activez l'API Google Books** :
   - Menu → "APIs & Services" → "Bibliothèque"
   - Recherchez "Books API"
   - Cliquez sur "Books API"
   - Cliquez sur "Activer"

4. **Créez une clé API** :
   - Menu → "APIs & Services" → "Identifiants"
   - "Créer des identifiants" → "Clé API"
   - **Copiez la clé** (ex: `AIzaSyC...xyz123`)

5. **Sécurisez la clé** (IMPORTANT) :
   - Cliquez sur votre clé nouvellement créée
   - "Restrictions relatives aux applications" → "Sites web"
   - Ajoutez votre domaine Vercel : `https://votre-projet.vercel.app/*`
   - "Restrictions relatives aux API" → "Books API"
   - Enregistrer

---

### Étape 2 : Ajouter la Clé dans Vercel

1. **Allez sur Vercel Dashboard** :
   👉 https://vercel.com/dashboard

2. **Sélectionnez votre projet** Paginea

3. **Settings → Environment Variables**

4. **Ajoutez la variable** :
   - **Key** : `GOOGLE_BOOKS_API_KEY`
   - **Value** : `AIzaSyC...xyz123` (votre clé)
   - **Environments** : Cochez `Production`, `Preview`, `Development`
   - Cliquez sur **Save**

5. **Redéployez** :
   - Allez dans "Deployments"
   - Cliquez sur le dernier déploiement
   - "..." → "Redeploy"

---

### Étape 3 : Test Local (Optionnel)

Si vous voulez tester en local, ajoutez dans votre fichier `.env.local` :

```env
GOOGLE_BOOKS_API_KEY=AIzaSyC...xyz123
```

---

## 📊 Limites

### Sans clé API :
- ❌ **1 000 requêtes / jour**
- ❌ Limites strictes
- ❌ Erreurs fréquentes

### Avec clé API :
- ✅ **1 000 requêtes / jour** (quota gratuit)
- ✅ Peut être augmenté si nécessaire
- ✅ Meilleure fiabilité

### Pour augmenter le quota :
- Google Cloud Console → APIs & Services → Quotas
- Demander une augmentation (souvent accepté gratuitement jusqu'à 10 000/jour)

---

## 🔍 Vérification

Une fois la clé ajoutée et redéployée, testez :

1. Allez sur votre site
2. Recherchez un livre (ex: "Harry Potter")
3. ✅ Ça devrait fonctionner !

---

## 🆘 Si ça ne marche toujours pas

### Vérifiez les logs :
```bash
# Dans Vercel, allez dans "Deployments" → Dernière version → "Runtime Logs"
# Recherchez "Google Books search error"
```

### Erreurs possibles :

1. **"API key not valid"**
   → La clé est incorrecte ou mal copiée

2. **"API key not found"**
   → Vérifiez que la variable d'environnement est bien nommée `GOOGLE_BOOKS_API_KEY`

3. **"Quota exceeded"**
   → Attendez 24h ou augmentez le quota dans Google Cloud

4. **"Invalid API key"**
   → Vérifiez que l'API Books est bien activée dans Google Cloud

---

## 💡 Alternative Sans Clé API

Si vous ne voulez pas de clé API (limites acceptables) :

Les modifications que je viens de faire améliorent déjà la gestion d'erreur :
- ✅ Timeout de 10 secondes
- ✅ Meilleurs messages d'erreur
- ✅ Gestion spéciale erreur 429 (trop de requêtes)

Le code fonctionnera avec ou sans clé, mais **avec une clé c'est mieux** ! 🚀

---

**Date** : 2026-02-07
