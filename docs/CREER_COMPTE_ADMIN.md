# 🔐 Créer le Compte Admin

## Méthode 1 : Via l'API (Recommandé)

Une fois le site déployé sur Vercel, vous pouvez créer le compte admin via une requête API.

### Étape 1 : Appeler l'endpoint API

Utilisez `curl`, Postman, ou la console du navigateur :

```bash
curl -X POST https://paginea.fr/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"secret": "create-admin-santa-2024"}'
```

Ou depuis la console du navigateur (F12) :

```javascript
fetch('/api/admin/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: 'create-admin-santa-2024' })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Étape 2 : Se connecter

Une fois le compte créé, connectez-vous avec :
- **Username** : `Santa`
- **Password** : `Liqini@6`

---

## Méthode 2 : Via le Script Local (Si vous avez un .env)

Si vous avez un fichier `.env` local avec `DATABASE_URL`, vous pouvez utiliser le script :

```bash
cd web
npm run create-admin
```

**Note** : Assurez-vous d'avoir un fichier `.env` dans le dossier `web/` avec :
```
DATABASE_URL=postgresql://...
```

---

## 🔒 Sécurité

Le secret par défaut est `create-admin-santa-2024`. Pour plus de sécurité, vous pouvez définir une variable d'environnement `ADMIN_CREATE_SECRET` sur Vercel avec une valeur personnalisée.

---

## ✅ Vérification

Après la création, vous devriez voir :
- Un lien **"Admin"** dans la navbar (visible uniquement pour les admins)
- Accès au panel admin sur `/admin`
- Possibilité de gérer les signalements

