# 🔥 Comment ajouter votre image de feu de cheminée

## 📁 Étape 1 : Préparer votre image

1. **Trouvez une belle image** de feu de cheminée
   - Recommandation : Image haute résolution (1920x1080 minimum)
   - Format : JPG, PNG ou WebP
   - Ambiance chaleureuse et cosy

2. **Renommez l'image** en `fireplace.jpg` (ou `.png`)

3. **Placez-la** dans le dossier : `/Users/alex/Documents/Paginea/web/public/`

---

## 🔧 Étape 2 : Modifier le code

Ouvrez le fichier : **`web/src/app/welcome/page.tsx`**

### Trouvez cette section (ligne ~30) :

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-amber-900">
  {/* Pattern de flammes simulé */}
  <div className="absolute inset-0 opacity-30">
    <div className="absolute inset-0 bg-[radial-gradient(...)] ..."></div>
  </div>
  {/* Effet de lueur */}
  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
</div>
```

### Remplacez par :

```tsx
<div className="absolute inset-0">
  <img 
    src="/fireplace.jpg" 
    alt="Feu de cheminée" 
    className="w-full h-full object-cover"
  />
  {/* Effet de lueur pour meilleure lisibilité */}
  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
</div>
```

---

## 🎨 Ajuster l'opacité (optionnel)

Si l'image est trop lumineuse et le texte difficile à lire, ajoutez un overlay plus foncé.

Juste après l'image, modifiez :

```tsx
{/* Overlay pour meilleure lisibilité */}
<div className="absolute inset-0 bg-black/40"></div>
```

Changez `/40` en `/50` ou `/60` pour plus de contraste.

---

## 🌐 Sources d'images gratuites

### Sites recommandés :
- **Unsplash** : https://unsplash.com/s/photos/fireplace
- **Pexels** : https://www.pexels.com/search/fireplace/
- **Pixabay** : https://pixabay.com/images/search/fireplace/

### Mots-clés de recherche :
- "cozy fireplace"
- "burning fireplace"
- "fireplace close up"
- "warm fire"
- "chimney fire"

---

## 🎯 Résultat attendu

Avec votre image de cheminée :
- ✅ Fond chaleureux et accueillant
- ✅ Texte blanc bien lisible
- ✅ Ambiance cosy et invitante
- ✅ Animation de fondu au chargement

---

## 🔄 Voir les changements

Après avoir ajouté votre image :
1. Rafraîchissez la page : **Cmd+R** (Mac) ou **Ctrl+R** (Windows)
2. Si l'image n'apparaît pas, videz le cache : **Cmd+Shift+R**

---

## 💡 Alternative : Vidéo de feu

Pour une expérience encore plus immersive, utilisez une vidéo !

### Téléchargez une vidéo de feu
- YouTube : Recherchez "fireplace 4k loop"
- Convertissez en MP4 avec un outil en ligne

### Remplacez par :

```tsx
<div className="absolute inset-0">
  <video 
    autoPlay 
    loop 
    muted 
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/fireplace.mp4" type="video/mp4" />
  </video>
  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
</div>
```

⚠️ **Note** : Les vidéos sont plus lourdes, vérifiez la taille du fichier (max 5-10 MB recommandé)

---

## ✅ Checklist

- [ ] Image téléchargée et renommée `fireplace.jpg`
- [ ] Image placée dans `web/public/`
- [ ] Code modifié dans `welcome/page.tsx`
- [ ] Page testée dans le navigateur
- [ ] Texte toujours lisible ✨

---

**En attendant votre image, un dégradé chaleureux orange/rouge simule l'ambiance du feu ! 🔥**

