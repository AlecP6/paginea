# 💬 Guide Système de Messagerie - Paginea

## 📋 Vue d'ensemble

Le système de messagerie privée permet aux utilisateurs de Paginea de communiquer entre eux en temps réel de manière sécurisée. Ce guide couvre toutes les fonctionnalités et l'architecture du système.

---

## ✨ Fonctionnalités Implémentées

### 🎯 Fonctionnalités de Base
- ✅ **Conversations privées** entre amis uniquement
- ✅ **Badge compteur** de messages non lus sur la navbar
- ✅ **Liste des conversations** triées par activité récente
- ✅ **Envoi et réception** de messages en temps réel
- ✅ **Marquage automatique** des messages comme lus
- ✅ **Horodatage intelligent** des messages

### 🚀 Fonctionnalités Avancées
- ✅ **Emoji Picker** : 20 émojis populaires intégrés
- ✅ **Recherche de conversations** : Filtrage par nom d'ami
- ✅ **Recherche dans messages** : Recherche dans l'historique d'une conversation
- ✅ **Suppression de messages** : L'auteur peut supprimer ses propres messages
- ✅ **Indicateur "en train d'écrire..."** : Affichage dynamique
- ✅ **Compteur de caractères** : Limite de 2000 caractères par message
- ✅ **Auto-refresh** : Conversations rafraîchies toutes les 10s, messages toutes les 5s
- ✅ **Modal nouvelle conversation** : Liste des amis disponibles pour démarrer un chat
- ✅ **UI/UX moderne** : Design responsive, animations fluides

---

## 🗄️ Structure de la Base de Données

### Modèle `Conversation`

```prisma
model Conversation {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user1Id   String
  user2Id   String
  user1     User      @relation("ConversationUser1", fields: [user1Id], references: [id], onDelete: Cascade)
  user2     User      @relation("ConversationUser2", fields: [user2Id], references: [id], onDelete: Cascade)
  messages  Message[]

  @@unique([user1Id, user2Id])
  @@map("conversations")
}
```

**Caractéristiques :**
- Identifiant unique UUID
- Relations bidirectionnelles avec deux utilisateurs
- Contrainte unique pour éviter les doublons (toujours `user1Id < user2Id`)
- Cascade delete : si un utilisateur est supprimé, ses conversations aussi
- `updatedAt` automatiquement mis à jour pour tri par activité

### Modèle `Message`

```prisma
model Message {
  id             String       @id @default(uuid())
  content        String
  createdAt      DateTime     @default(now())
  isRead         Boolean      @default(false)
  senderId       String
  receiverId     String
  conversationId String
  sender         User         @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver       User         @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}
```

**Caractéristiques :**
- Contenu du message (max 2000 caractères côté client)
- État de lecture pour les notifications
- Relations avec expéditeur, destinataire et conversation
- Cascade delete : si conversation supprimée, tous ses messages aussi

### Relations dans le modèle `User`

```prisma
model User {
  // ... autres champs ...
  conversationsAsUser1 Conversation[] @relation("ConversationUser1")
  conversationsAsUser2 Conversation[] @relation("ConversationUser2")
  sentMessages         Message[]      @relation("SentMessages")
  receivedMessages     Message[]      @relation("ReceivedMessages")
}
```

---

## 🔌 API Routes

### `/api/conversations` (GET)
**Description :** Récupère toutes les conversations de l'utilisateur connecté

**Authentification :** Requise (JWT)

**Réponse :**
```json
[
  {
    "id": "uuid",
    "friend": {
      "id": "uuid",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://..."
    },
    "lastMessage": {
      "id": "uuid",
      "content": "Salut ! Comment vas-tu ?",
      "createdAt": "2026-02-08T10:30:00.000Z",
      "senderId": "uuid",
      "isRead": true
    },
    "unreadCount": 3,
    "updatedAt": "2026-02-08T10:30:00.000Z"
  }
]
```

**Fonctionnalités :**
- Tri par `updatedAt` décroissant (conversations les plus récentes en premier)
- Calcul automatique du nombre de messages non lus
- Inclut le dernier message pour l'aperçu
- Identifie l'ami dans la conversation

---

### `/api/conversations` (POST)
**Description :** Crée une nouvelle conversation ou récupère une existante

**Authentification :** Requise (JWT)

**Corps de la requête :**
```json
{
  "friendId": "uuid"
}
```

**Vérifications :**
- ✅ Les utilisateurs doivent être amis (status ACCEPTED)
- ✅ Si une conversation existe déjà, elle est renvoyée
- ✅ Sinon, une nouvelle conversation est créée

**Réponse :**
```json
{
  "id": "uuid",
  "friend": { ... },
  "createdAt": "2026-02-08T10:30:00.000Z"
}
```

**Codes d'erreur :**
- `400` : friendId manquant
- `403` : Utilisateurs pas amis
- `500` : Erreur serveur

---

### `/api/conversations/[conversationId]/messages` (GET)
**Description :** Récupère tous les messages d'une conversation

**Authentification :** Requise (JWT)

**Paramètres :**
- `conversationId` : UUID de la conversation

**Réponse :**
```json
[
  {
    "id": "uuid",
    "content": "Bonjour !",
    "createdAt": "2026-02-08T10:00:00.000Z",
    "isRead": true,
    "senderId": "uuid",
    "sender": {
      "id": "uuid",
      "username": "john_doe",
      "avatar": "https://..."
    }
  }
]
```

**Fonctionnalités :**
- Tri par `createdAt` croissant (plus vieux en premier)
- Limite de 50 messages (à adapter si besoin)
- Marque automatiquement les messages non lus comme lus
- Vérifie que l'utilisateur est participant de la conversation

**Codes d'erreur :**
- `404` : Conversation non trouvée ou utilisateur non participant
- `500` : Erreur serveur

---

### `/api/conversations/[conversationId]/messages` (POST)
**Description :** Envoie un nouveau message dans une conversation

**Authentification :** Requise (JWT)

**Paramètres :**
- `conversationId` : UUID de la conversation

**Corps de la requête :**
```json
{
  "content": "Voici mon message !"
}
```

**Vérifications :**
- ✅ Contenu non vide
- ✅ Utilisateur participant de la conversation

**Réponse :**
```json
{
  "id": "uuid",
  "content": "Voici mon message !",
  "createdAt": "2026-02-08T10:30:00.000Z",
  "isRead": false,
  "senderId": "uuid",
  "sender": { ... }
}
```

**Codes d'erreur :**
- `400` : Contenu vide
- `404` : Conversation non trouvée ou utilisateur non participant
- `500` : Erreur serveur

---

### `/api/messages/[messageId]` (DELETE) ✨ NOUVEAU
**Description :** Supprime un message (auteur uniquement)

**Authentification :** Requise (JWT)

**Paramètres :**
- `messageId` : UUID du message

**Vérifications :**
- ✅ Message existe
- ✅ L'utilisateur est l'auteur du message

**Réponse :**
```json
{
  "success": true
}
```

**Codes d'erreur :**
- `403` : L'utilisateur n'est pas l'auteur
- `404` : Message non trouvé
- `500` : Erreur serveur

---

## 🎨 Interface Utilisateur

### Page `/messages`

**Composants principaux :**

1. **Sidebar Conversations** (1/3 de la largeur sur desktop)
   - Badge compteur messages non lus sur navbar
   - Bouton "+" pour nouvelle conversation
   - Barre de recherche de conversations
   - Liste des conversations avec :
     - Avatar de l'ami
     - Nom complet ou username
     - Dernier message (prévisualisation)
     - Badge de messages non lus
     - Horodatage relatif (ex: "5min", "2h", "3j")

2. **Zone de Chat** (2/3 de la largeur sur desktop)
   - En-tête avec :
     - Avatar et nom de l'ami
     - Indicateur "en train d'écrire..." (dynamique)
     - Barre de recherche dans les messages
   - Zone de messages :
     - Messages alignés à droite (envoyés) ou gauche (reçus)
     - Bulles colorées (primary pour envoyés, gris pour reçus)
     - Horodatage sous chaque message
     - Indicateur "Lu" pour messages envoyés
     - Bouton de suppression (hover, auteur uniquement)
   - Formulaire d'envoi :
     - Bouton emoji picker
     - Champ de texte avec compteur (2000 max)
     - Bouton d'envoi

3. **Modal Nouvelle Conversation** ✨ NOUVEAU
   - Liste de tous les amis
   - Recherche dans la liste
   - Création automatique de conversation au clic

### Emoji Picker ✨ NOUVEAU
**20 émojis populaires :**
😊 😂 ❤️ 👍 🎉 😍 🔥 ✨ 👏 😢 😮 🤔 😎 🙏 💪 📚 📖 ✅ ❌ 👋

**Fonctionnement :**
- Bouton smiley pour ouvrir/fermer
- Ajout au clic dans le champ de texte
- Auto-fermeture après sélection

### Auto-refresh ✨ NOUVEAU
- **Conversations** : Rafraîchissement toutes les 10 secondes
- **Messages** : Rafraîchissement toutes les 5 secondes (conversation active)
- **Badge navbar** : Rafraîchissement toutes les 10 secondes

### Recherche ✨ NOUVEAU
- **Recherche conversations** : Filtre par username, prénom, nom
- **Recherche messages** : Filtre l'historique de la conversation active

---

## 🔐 Sécurité

### Authentification
- ✅ Toutes les routes nécessitent un JWT valide
- ✅ Middleware `requireAuth` pour vérifier le token

### Autorisation
- ✅ Un utilisateur ne peut voir que ses propres conversations
- ✅ Un utilisateur ne peut envoyer des messages qu'à ses amis
- ✅ Un utilisateur ne peut supprimer que ses propres messages
- ✅ Vérification de la participation à la conversation avant chaque action

### Validation
- ✅ Contenu des messages ne peut pas être vide
- ✅ Limite de 2000 caractères côté client
- ✅ Vérification de l'amitié avant création de conversation

### Protection des données
- ✅ Cascade delete : suppression d'un utilisateur supprime ses conversations et messages
- ✅ Pas d'accès direct aux conversations d'autres utilisateurs
- ✅ Filtrage des données sensibles dans les réponses API

---

## 🧪 Tests

### Tests Manuels Recommandés

1. **Création de conversation**
   - Se connecter avec utilisateur A
   - Cliquer sur "+" dans la page Messages
   - Sélectionner un ami et créer une conversation
   - Vérifier que la conversation apparaît dans la liste

2. **Envoi de messages**
   - Envoyer plusieurs messages dans une conversation
   - Vérifier l'affichage dans les bulles
   - Vérifier l'horodatage
   - Vérifier le dernier message dans la liste des conversations

3. **Messages non lus**
   - Se connecter avec utilisateur B
   - Vérifier le badge sur la navbar
   - Vérifier le badge sur la conversation
   - Ouvrir la conversation
   - Vérifier que les badges disparaissent

4. **Recherche**
   - Rechercher une conversation par nom
   - Rechercher un message dans l'historique
   - Vérifier les résultats filtrés

5. **Emojis**
   - Ouvrir le picker
   - Ajouter plusieurs emojis
   - Envoyer le message
   - Vérifier l'affichage

6. **Suppression**
   - Envoyer un message
   - Survoler pour voir le bouton supprimer
   - Supprimer le message
   - Vérifier qu'il disparaît

7. **Responsive**
   - Tester sur mobile
   - Vérifier l'affichage des conversations
   - Vérifier l'affichage des messages

---

## 🐛 Problèmes Connus et Solutions

### 1. Messages non actualisés
**Problème :** Les messages ne s'affichent pas immédiatement

**Solution :**
- Vérifier que l'auto-refresh est actif (toutes les 5s)
- Vérifier la connexion réseau
- Rafraîchir manuellement la page

### 2. Badge compteur ne se met pas à jour
**Problème :** Le badge reste affiché même après lecture

**Solution :**
- Le badge se met à jour toutes les 10 secondes
- Ou au changement de page
- Vérifier que les messages sont bien marqués comme lus côté serveur

### 3. Emoji ne s'affiche pas
**Problème :** L'emoji apparaît comme un carré

**Solution :**
- Utiliser un navigateur moderne (Chrome, Firefox, Safari récent)
- Vérifier le support des emojis Unicode

---

## 🚀 Améliorations Futures Possibles

### Fonctionnalités avancées
- [ ] **WebSockets** : Messagerie en temps réel (remplacer le polling)
- [ ] **Notifications Push** : Alertes navigateur pour nouveaux messages
- [ ] **Pièces jointes** : Images, fichiers PDF
- [ ] **Messages vocaux** : Enregistrement audio
- [ ] **Réactions** : Emojis en réaction aux messages
- [ ] **Édition de messages** : Modifier un message après envoi
- [ ] **Réponse à un message** : Citation/thread
- [ ] **Typing indicators** : Indicateur temps réel (via WebSockets)
- [ ] **Statut en ligne** : Voir qui est connecté
- [ ] **Pagination** : Chargement progressif des anciens messages
- [ ] **Recherche globale** : Rechercher dans toutes les conversations
- [ ] **Archiver conversations** : Masquer sans supprimer
- [ ] **Bloquer utilisateurs** : Empêcher réception de messages
- [ ] **Conversations de groupe** : Messages à plusieurs amis

### Améliorations UI/UX
- [ ] **Thème sombre** : Mode nuit pour les messages
- [ ] **Sons de notification** : Alerte sonore pour nouveaux messages
- [ ] **Aperçu d'image** : Lightbox pour agrandir les images
- [ ] **Infinite scroll** : Chargement automatique des anciens messages
- [ ] **Raccourcis clavier** : Ctrl+Enter pour envoyer, etc.
- [ ] **GIFs** : Intégration Giphy/Tenor
- [ ] **Stickers** : Autocollants personnalisés

### Performance
- [ ] **Cache Redis** : Pour les conversations actives
- [ ] **Lazy loading** : Charger les messages à la demande
- [ ] **Compression** : Compresser les messages longs

---

## 📚 Ressources

### Documentation Next.js
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Documentation Prisma
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Queries](https://www.prisma.io/docs/concepts/components/prisma-client/crud)

### Librairies utilisées
- **React** : Framework UI
- **Tailwind CSS** : Styling
- **Lucide Icons** : Icônes
- **React Hot Toast** : Notifications
- **Axios** : Requêtes HTTP

---

## 🎉 Conclusion

Le système de messagerie de Paginea offre une expérience complète et moderne pour communiquer avec vos amis. Avec les dernières améliorations (emojis, recherche, suppression, indicateurs), l'application est maintenant prête pour une utilisation en production !

**Prochaine étape recommandée :** Implémenter WebSockets pour une messagerie vraiment temps réel ! 🚀

---

**Version :** 2.0 ✨  
**Dernière mise à jour :** 8 février 2026  
**Auteur :** Équipe Paginea
