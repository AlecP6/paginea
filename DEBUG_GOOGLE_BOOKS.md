# 🔍 Debug : Erreur Recherche Google Books

## Comment déboguer l'erreur

### Étape 1 : Vérifier les logs Vercel

1. Allez sur **Vercel Dashboard** → Votre projet
2. **Deployments** → Dernier déploiement
3. Cliquez sur **"Runtime Logs"** ou **"Functions"**
4. Cherchez les logs avec "Google Books search error"

### Étape 2 : Tester l'API directement

Ouvrez votre navigateur et testez l'URL (remplacez `votre-site.vercel.app`) :

```
https://votre-site.vercel.app/api/books/search?query=Harry%20Potter
```

**Réponses possibles** :

#### ✅ Succès :
```json
[
  {
    "googleBooksId": "...",
    "title": "Harry Potter...",
    "authors": ["J.K. Rowling"],
    ...
  }
]
```

#### ❌ Erreur 401/403 :
```json
{
  "error": "Unauthorized"
}
```
→ Problème d'authentification JWT

#### ❌ Erreur 429 :
```json
{
  "error": "Trop de requêtes..."
}
```
→ Limite Google Books dépassée (besoin d'une clé API)

#### ❌ Erreur 500 :
```json
{
  "error": "Erreur lors de la recherche de livres",
  "details": { ... }
}
```
→ Problème avec Google Books API

---

## Solutions par Type d'Erreur

### 🔐 Erreur : "Unauthorized" / 401

**Cause** : Le JWT n'est pas envoyé ou est invalide

**Solution** :
1. Vérifiez que vous êtes bien connecté
2. Essayez de vous déconnecter puis reconnecter
3. Videz le cache du navigateur

### ⏱️ Erreur : "La recherche a pris trop de temps"

**Cause** : Timeout (>10s)

**Solutions** :
1. Google Books API est peut-être lent
2. Réessayez plus tard
3. Vérifiez votre connexion internet

### 🚫 Erreur : "Trop de requêtes"

**Cause** : Limite Google Books dépassée (1000/jour sans clé)

**Solution** :
1. **Ajoutez une clé API** (voir `GOOGLE_BOOKS_API_CONFIG.md`)
2. Ou attendez 24h

### 🌐 Erreur : "Erreur lors de la connexion"

**Cause** : Google Books API indisponible

**Solutions** :
1. Vérifiez que Google Books fonctionne : https://www.googleapis.com/books/v1/volumes?q=test
2. Réessayez dans quelques minutes

---

## Test Manuel de l'API

### Depuis votre terminal local :

```bash
# Test 1 : Vérifier que Google Books fonctionne
curl "https://www.googleapis.com/books/v1/volumes?q=Harry+Potter&maxResults=1"

# Test 2 : Tester votre API (avec votre token)
# D'abord, récupérez votre token depuis localStorage dans la console du navigateur
# localStorage.getItem('token')

curl -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  "https://votre-site.vercel.app/api/books/search?query=Harry%20Potter"
```

---

## Code de Test Temporaire

Ajoutez ceci temporairement dans votre page `/books` pour voir l'erreur complète :

```tsx
const handleSearchBooks = async (query: string) => {
  if (!query || query.length < 2) {
    setSearchResults([]);
    return;
  }

  setIsSearching(true);
  try {
    const response = await booksApi.searchBooks(query);
    console.log('✅ Succès:', response.data);
    setSearchResults(response.data);
  } catch (error: any) {
    console.error('❌ Erreur complète:', error);
    console.error('❌ Response:', error.response?.data);
    console.error('❌ Status:', error.response?.status);
    
    // Message détaillé
    if (error.response?.data?.error) {
      toast.error(`Erreur: ${error.response.data.error}`);
    } else {
      toast.error('Erreur lors de la recherche de livres');
    }
  } finally {
    setIsSearching(false);
  }
};
```

---

## Vérifications Vercel

### Variables d'environnement :

1. **Settings** → **Environment Variables**
2. Vérifiez que ces variables existent :
   - `JWT_SECRET` ✅
   - `DATABASE_URL` ✅
   - `GOOGLE_BOOKS_API_KEY` (optionnel mais recommandé)

### Logs Fonctions :

1. **Functions** (dans le menu)
2. Cliquez sur `/api/books/search`
3. Regardez les dernières invocations
4. Vérifiez les erreurs

---

## Solution Rapide : Désactiver Temporairement

Si rien ne marche, vous pouvez temporairement permettre l'ajout manuel sans recherche Google :

```tsx
// Dans books/page.tsx, modifiez le formulaire pour toujours afficher les champs
const [useManualEntry, setUseManualEntry] = useState(true);

// Et ajoutez un bouton pour basculer
<button onClick={() => setUseManualEntry(!useManualEntry)}>
  {useManualEntry ? '🔍 Rechercher sur Google' : '✏️ Saisie manuelle'}
</button>
```

---

## Contactez-moi avec :

Pour que je puisse vous aider plus précisément, donnez-moi :

1. ✅ L'URL exacte de votre site Vercel
2. ✅ Le message d'erreur EXACT (avec console.log)
3. ✅ Copie d'écran des logs Vercel (si possible)
4. ✅ Réponse du test manuel de l'API

---

**Dernière mise à jour** : 2026-02-07
