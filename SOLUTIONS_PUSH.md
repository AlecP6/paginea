# 🔧 Solutions pour Pousser vers GitHub

## 🎯 Solution Rapide : Utiliser GitHub Desktop

**La méthode la plus simple si vous avez des problèmes avec Git en ligne de commande :**

1. **Téléchargez GitHub Desktop** (si pas déjà installé) :
   - https://desktop.github.com/

2. **Ouvrez le dépôt** :
   - File → Add Local Repository
   - Sélectionnez `/Users/alex/Documents/Paginea`

3. **Poussez** :
   - Cliquez sur "Push origin" en haut à droite
   - C'est fait ! 🎉

---

## 🔑 Solution : Token d'Accès Personnel (PAT)

Si vous utilisez HTTPS, GitHub nécessite maintenant un token :

### Étape 1 : Créer un Token

1. Allez sur : **https://github.com/settings/tokens/new**
2. Remplissez :
   - **Note** : "Paginea Push"
   - **Expiration** : 90 jours (ou plus)
   - **Permissions** : Cochez **`repo`** (toutes les sous-options)
3. Cliquez sur **"Generate token"**
4. **COPIEZ LE TOKEN** (vous ne le verrez qu'une fois !)

### Étape 2 : Utiliser le Token

```bash
cd /Users/alex/Documents/Paginea
git push https://[VOTRE_TOKEN]@github.com/AlecP6/paginea.git main
```

Remplacez `[VOTRE_TOKEN]` par le token que vous avez copié.

### Étape 3 : Sauvegarder le Token (optionnel)

Pour ne pas retaper le token à chaque fois :

```bash
git config --global credential.helper osxkeychain
git push origin main
```

Lors de la demande :
- **Username** : `AlecP6`
- **Password** : [Collez votre token]

Le token sera sauvegardé dans le keychain macOS.

---

## 🔐 Solution : Basculer vers SSH

**Plus simple à long terme, pas de token à gérer :**

### Étape 1 : Générer une clé SSH

```bash
ssh-keygen -t ed25519 -C "votre-email@exemple.com"
```

Appuyez sur **Entrée** trois fois (utilise les valeurs par défaut).

### Étape 2 : Copier la clé publique

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

(La clé est maintenant dans votre presse-papiers)

### Étape 3 : Ajouter la clé à GitHub

1. Allez sur : **https://github.com/settings/keys**
2. Cliquez sur **"New SSH key"**
3. **Title** : "MacBook Paginea"
4. **Key** : Collez (Cmd+V)
5. Cliquez sur **"Add SSH key"**

### Étape 4 : Changer l'URL et pousser

```bash
cd /Users/alex/Documents/Paginea
git remote set-url origin git@github.com:AlecP6/paginea.git
ssh -T git@github.com  # Test de connexion
git push origin main
```

---

## 🆘 Erreurs Courantes

### "Authentication failed"
→ Vous utilisez votre mot de passe GitHub au lieu d'un token
→ **Solution** : Utilisez un Personal Access Token

### "Support for password authentication was removed"
→ GitHub n'accepte plus les mots de passe
→ **Solution** : Utilisez un token ou SSH

### "Permission denied (publickey)"
→ Votre clé SSH n'est pas configurée
→ **Solution** : Suivez les étapes SSH ci-dessus

### "could not read Username"
→ Git ne peut pas demander vos credentials
→ **Solution** : Utilisez GitHub Desktop ou spécifiez le token dans l'URL

---

## 💡 Ma Recommandation

Pour vous, je recommande dans cet ordre :

1. **GitHub Desktop** (le plus simple, interface graphique)
2. **SSH** (une fois configuré, plus besoin de s'en soucier)
3. **Token HTTPS** (fonctionne partout mais à renouveler)

---

## ✅ Vérification Finale

Une fois poussé avec succès, vérifiez sur :
**https://github.com/AlecP6/paginea/commits/main**

Vous devriez voir votre commit tout en haut ! 🎉
