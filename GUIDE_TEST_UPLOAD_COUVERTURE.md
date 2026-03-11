# ✅ Guide de Test - Upload Couverture de Livre

## 🎯 Tests à Effectuer

---

## Test 1️⃣ : Upload depuis Recherche (OpenLibrary)

### Étapes
1. Aller sur http://localhost:3000/books
2. Cliquer sur "Ajouter un livre"
3. Dans le champ de recherche, taper "Harry Potter"
4. Cliquer sur "Rechercher"
5. Sélectionner un livre avec une couverture
6. **Vérifier** : L'aperçu de la couverture s'affiche
7. Remplir les autres champs (note, statut, avis)
8. Cliquer sur "Publier"
9. **Vérifier** : La critique apparaît avec la bonne couverture

### Console (F12)
Vous devriez voir :
```
📚 Couverture sélectionnée: {
  titre: "Harry Potter...",
  url: "https://covers.openlibrary.org/...",
  type: "image/jpeg",
  taille: "XXX KB"
}
```

### ✅ Résultat Attendu
- Aperçu visible dans le formulaire
- Couverture affichée après publication
- Aucune erreur console

---

## Test 2️⃣ : Upload Manuel (Fichier Local)

### Étapes
1. Aller sur http://localhost:3000/books
2. Cliquer sur "Ajouter un livre"
3. Remplir titre et auteur manuellement
4. Cliquer sur "Couverture du livre"
5. Sélectionner une image de votre ordinateur (JPG, PNG, GIF, WebP)
6. **Vérifier** : L'aperçu s'affiche
7. Remplir les autres champs
8. Cliquer sur "Publier"
9. **Vérifier** : L'image uploadée s'affiche correctement

### ✅ Résultat Attendu
- Fichier accepté (< 5MB, format valide)
- Aperçu visible
- Image affichée après publication

---

## Test 3️⃣ : Modification de Couverture

### Étapes
1. Aller sur http://localhost:3000/books
2. Trouver une critique existante
3. Cliquer sur l'icône "Modifier" (crayon)
4. Changer la couverture :
   - Option A : Chercher un nouveau livre
   - Option B : Uploader un nouveau fichier
5. Cliquer sur "Modifier"
6. **Vérifier** : La nouvelle couverture remplace l'ancienne

### ✅ Résultat Attendu
- L'ancienne couverture est remplacée
- La nouvelle couverture s'affiche
- L'ancienne image est supprimée du stockage

---

## Test 4️⃣ : Validation des Erreurs

### Test 4A : Fichier trop volumineux
1. Essayer d'uploader un fichier > 5MB
2. **Vérifier** : Message d'erreur "La taille de l'image ne doit pas dépasser 5MB"

### Test 4B : Format invalide
1. Essayer d'uploader un fichier .txt ou .pdf
2. **Vérifier** : Message d'erreur "Seuls les fichiers JPEG, PNG, GIF et WebP sont autorisés"

### Test 4C : Sans couverture
1. Créer un livre sans uploader de couverture
2. **Vérifier** : Icône de livre par défaut s'affiche

---

## 📊 Vérifications Backend

### Logs Vercel (Production)

1. Aller sur https://vercel.com/votre-projet
2. Cliquer sur "Logs"
3. Chercher les logs suivants après un upload :

```
📚 Couverture uploadée: {
  reviewId: "abc123",
  bookTitle: "...",
  oldCover: null,
  newCover: "https://...blob.vercel-storage.com/..."
}

✅ Critique mise à jour avec nouvelle couverture
```

### Vercel Blob Storage

1. Aller sur Vercel → Storage → Blob
2. **Vérifier** : Les nouvelles images apparaissent
3. **Format des noms** : `book-cover-TITRE-ID-TIMESTAMP.ext`

---

## 🐛 Problèmes Potentiels

### Problème : "Erreur lors de l'upload de la couverture"

**Causes possibles** :
1. Variable `BLOB_READ_WRITE_TOKEN` manquante
2. Réseau lent (timeout)
3. Fichier corrompu

**Solution** :
1. Vérifier Vercel Environment Variables
2. Réessayer
3. Essayer avec un autre fichier

---

### Problème : Image ne s'affiche pas après publication

**Causes possibles** :
1. URL incorrecte dans la base de données
2. Permissions Vercel Blob Storage
3. Cache du navigateur

**Solution** :
1. Vérifier les logs console (F12)
2. Actualiser la page (Ctrl+F5)
3. Vérifier la base de données :
```sql
SELECT bookTitle, bookCover FROM BookReview WHERE id = 'ID';
```

---

### Problème : "Vous n'êtes pas autorisé à modifier cette critique"

**Cause** : Vous essayez de modifier la critique d'un autre utilisateur

**Solution** : Connectez-vous avec le bon compte

---

## 📝 Checklist Complète

### Avant de Déployer
- [ ] Test 1 : Upload depuis recherche ✅
- [ ] Test 2 : Upload manuel ✅
- [ ] Test 3 : Modification couverture ✅
- [ ] Test 4A : Validation taille ✅
- [ ] Test 4B : Validation format ✅
- [ ] Test 4C : Sans couverture ✅
- [ ] Vérifier logs console (pas d'erreur) ✅
- [ ] Vérifier que les anciennes images sont supprimées ✅

### Après Déploiement
- [ ] Tester en production (https://www.paginea.fr)
- [ ] Vérifier Vercel Logs
- [ ] Vérifier Vercel Blob Storage
- [ ] Tester sur mobile
- [ ] Tester sur différents navigateurs

---

## 🎉 Résultat Final Attendu

```
✅ Upload depuis recherche fonctionne
✅ Upload manuel fonctionne
✅ Modification de couverture fonctionne
✅ Validations fonctionnent
✅ Anciennes images supprimées automatiquement
✅ Logs détaillés pour debugging
✅ Tous les formats supportés (JPG, PNG, GIF, WebP)
```

---

**Date** : 8 février 2026  
**Statut** : 🟢 Prêt pour tests  
**Prochaine action** : Lancer `npm run dev` et tester localement
