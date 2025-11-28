# 🌐 Configuration du Domaine Personnalisé : Paginea.fr

## 📋 Étapes pour Configurer le Domaine sur Vercel

### 1️⃣ Ajouter le Domaine sur Vercel

1. Allez sur **Vercel** → **Votre Projet** → **Settings** → **Domains**
2. Cliquez sur **"Add Domain"**
3. Entrez `paginea.fr` et cliquez sur **"Add"**
4. Vercel vous donnera des instructions pour configurer les DNS

---

### 2️⃣ Configuration DNS

Vous devez configurer les DNS chez votre registrar (là où vous avez acheté le domaine).

#### Option A : Utiliser les Nameservers de Vercel (Recommandé)

1. Vercel vous donnera des nameservers (ex: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
2. Allez sur votre registrar (ex: OVH, Gandi, Namecheap, etc.)
3. Trouvez la section **"Nameservers"** ou **"DNS"**
4. Remplacez les nameservers par ceux fournis par Vercel
5. Attendez la propagation (peut prendre jusqu'à 48h, généralement quelques heures)

#### Option B : Utiliser des Enregistrements DNS (Si vous gardez vos nameservers actuels)

Ajoutez ces enregistrements DNS chez votre registrar :

| Type | Nom | Valeur |
|------|-----|--------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com.` |

**Note :** Vercel vous donnera les valeurs exactes à utiliser.

---

### 3️⃣ Mettre à Jour les Variables d'Environnement sur Vercel

1. Allez sur **Vercel** → **Votre Projet** → **Settings** → **Environment Variables**
2. Trouvez `NEXT_PUBLIC_SITE_URL`
3. Modifiez la valeur pour :
   ```
   https://paginea.fr
   ```
4. Cliquez sur **"Save"**
5. **Redeployez** le projet

---

### 4️⃣ Mettre à Jour les Fichiers de Configuration

Nous devons mettre à jour certains fichiers pour utiliser le nouveau domaine.

---

### 5️⃣ Vérifier la Configuration

Une fois les DNS propagés (vérifiez avec `dig paginea.fr` ou un outil en ligne) :

1. Allez sur `https://paginea.fr`
2. Vérifiez que le site s'affiche correctement
3. Testez les fonctionnalités (connexion, inscription, etc.)

---

### 6️⃣ Redirection HTTPS

Vercel configure automatiquement le certificat SSL (HTTPS) pour votre domaine. C'est gratuit et automatique.

---

### 7️⃣ Redirection www vers non-www (Optionnel)

Si vous voulez rediriger `www.paginea.fr` vers `paginea.fr` :

1. Ajoutez aussi `www.paginea.fr` comme domaine sur Vercel
2. Vercel redirigera automatiquement vers le domaine principal

---

## 🔍 Vérification de la Propagation DNS

Pour vérifier si les DNS sont bien configurés :

```bash
# Sur macOS/Linux
dig paginea.fr

# Ou utilisez un outil en ligne
# https://dnschecker.org/
```

---

## ⚠️ Important

- La propagation DNS peut prendre **jusqu'à 48 heures**, mais généralement c'est fait en **quelques heures**
- Ne supprimez pas l'ancien domaine Vercel (`*.vercel.app`) tant que le nouveau n'est pas fonctionnel
- Gardez les deux domaines actifs pendant la transition

---

## 📝 Checklist

- [ ] Domaine ajouté sur Vercel
- [ ] DNS configurés (nameservers ou enregistrements)
- [ ] Variable `NEXT_PUBLIC_SITE_URL` mise à jour sur Vercel
- [ ] Projet redeployé
- [ ] DNS propagés (vérifié avec dig ou outil en ligne)
- [ ] Site accessible sur `https://paginea.fr`
- [ ] HTTPS fonctionne (certificat SSL automatique)

---

## 🆘 En Cas de Problème

1. **Le domaine ne se connecte pas :**
   - Vérifiez que les DNS sont bien configurés
   - Attendez la propagation (peut prendre du temps)
   - Vérifiez les logs Vercel

2. **Erreur SSL :**
   - Vercel configure automatiquement le SSL, attendez quelques minutes
   - Vérifiez que le domaine est bien ajouté sur Vercel

3. **Le site ne se charge pas :**
   - Vérifiez que le projet est bien déployé
   - Vérifiez les variables d'environnement
   - Regardez les logs Vercel

