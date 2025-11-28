# 🔌 Paginea Backend API

API REST pour Paginea, construite avec Node.js, Express, TypeScript et Prisma.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/      # Logique métier des routes
│   ├── routes/           # Définition des routes API
│   ├── middleware/       # Middlewares (auth, etc.)
│   ├── utils/            # Utilitaires (Prisma client)
│   └── index.ts          # Point d'entrée de l'application
├── prisma/
│   └── schema.prisma     # Schéma de la base de données
└── package.json
```

## 🗄️ Modèle de Données

### User (Utilisateur)
- Informations de base (email, username, password)
- Profil (firstName, lastName, bio, avatar)
- Relations : posts, bookReviews, comments, likes, friendships

### Post (Publication)
- Contenu textuel
- Type : PUBLIC (mur public) ou FRIENDS (amis uniquement)
- Relations : author, comments, likes

### BookReview (Critique de livre)
- Informations du livre (titre, auteur, ISBN, cover)
- Note de 1 à 10
- Avis textuel
- Statut de lecture : WANT_TO_READ, READING, READ, ABANDONED
- Relations : author, comments, likes

### Friendship (Amitié)
- Relation entre deux utilisateurs
- Statut : PENDING, ACCEPTED, REJECTED, BLOCKED

### Comment (Commentaire)
- Contenu textuel
- Peut être lié à un Post ou une BookReview

### Like (J'aime)
- Peut être lié à un Post ou une BookReview

## 🛣️ Routes API

### Authentication (`/api/auth`)

```
POST   /register      - Inscription
POST   /login         - Connexion
GET    /me            - Obtenir l'utilisateur connecté
```

### Users (`/api/users`)

```
GET    /search?q=     - Rechercher des utilisateurs
GET    /:userId       - Obtenir un profil utilisateur
PUT    /profile       - Mettre à jour son profil
```

### Posts (`/api/posts`)

```
POST   /              - Créer un post
GET    /              - Obtenir les posts (feed)
GET    /:postId       - Obtenir un post spécifique
DELETE /:postId       - Supprimer un post
POST   /:postId/like  - Liker un post
DELETE /:postId/like  - Unliker un post
```

### Book Reviews (`/api/book-reviews`)

```
POST   /                    - Créer une critique
GET    /                    - Obtenir les critiques
GET    /:reviewId           - Obtenir une critique
PUT    /:reviewId           - Mettre à jour une critique
DELETE /:reviewId           - Supprimer une critique
POST   /:reviewId/like      - Liker une critique
DELETE /:reviewId/like      - Unliker une critique
```

### Friendships (`/api/friendships`)

```
POST   /request/:userId           - Envoyer une demande d'ami
PUT    /request/:friendshipId     - Répondre à une demande
GET    /friends                   - Obtenir la liste des amis
GET    /requests                  - Obtenir les demandes en attente
DELETE /:friendshipId             - Retirer un ami
```

### Comments (`/api/comments`)

```
POST   /              - Créer un commentaire
DELETE /:commentId    - Supprimer un commentaire
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

**Header requis pour les routes protégées :**
```
Authorization: Bearer <token>
```

## 🚀 Scripts Disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run migrate

# Ouvrir Prisma Studio (interface visuelle)
npm run prisma:studio
```

## 📝 Variables d'Environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/paginea"
JWT_SECRET="your_secret_key"
PORT=3001
NODE_ENV=development
```

## 🧪 Exemple d'Utilisation

### Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Créer un Post

```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Je viens de terminer un livre incroyable !",
    "type": "PUBLIC"
  }'
```

## 🛡️ Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT avec expiration (30 jours)
- Validation des entrées avec express-validator
- Protection CORS configurée

## 📊 Base de Données

### Migrations Prisma

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Reset la base de données (⚠️ EFFACE LES DONNÉES)
npx prisma migrate reset
```

### Prisma Studio

Interface visuelle pour gérer vos données :

```bash
npm run prisma:studio
```

Ouvre une interface web sur http://localhost:5555

## 🔍 Debugging

Les logs sont affichés dans la console. Pour plus de détails :

```typescript
// Activer les logs Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

Pour plus d'informations, consultez le [README principal](../README.md).

