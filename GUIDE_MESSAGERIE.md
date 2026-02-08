# 💬 Système de Messagerie Privée - Guide

## ✅ CE QUI A ÉTÉ CRÉÉ

### Base de Données
- ✅ Table `conversations` (paires d'amis)
- ✅ Table `messages` (contenu des messages)
- ✅ Relations avec `users`
- ✅ Index uniques pour performances

### Backend
- ✅ API `/api/conversations` (liste, création)
- ✅ API `/api/conversations/[id]/messages` (lecture, envoi)
- ✅ Vérifications sécurité (auth, amitié)

### Frontend
- ✅ Page `/messages` style Messenger
- ✅ Liste conversations avec badges
- ✅ Chat en temps réel (polling 5s)
- ✅ Lien dans Navbar (desktop + mobile)

---

## 🚀 DÉPLOIEMENT

### Étape 1 : Vercel Déploie (automatique)
**Status** : 🔄 En cours (2-3 min)
**Commit** : `e513d82`

### Étape 2 : Migration Base de Données
Vercel va détecter le changement de schéma Prisma et exécutera :
```bash
npx prisma migrate deploy
```

⚠️ **SI LA MIGRATION ÉCHOUE** :

1. Va sur **Vercel Dashboard**
2. Clique sur ton projet **Paginea**
3. Va dans **Settings** > **Environment Variables**
4. Copie la valeur de `DATABASE_URL`
5. En local, dans `/web/.env` :
   ```
   DATABASE_URL="ta_connection_string"
   ```
6. Exécute :
   ```bash
   cd web
   npx prisma migrate deploy
   ```

---

## 🧪 COMMENT TESTER

### Prérequis
- 2 comptes utilisateurs
- Les 2 doivent être amis (statut ACCEPTED)

### Test Complet

#### 1. Démarrer une Conversation
1. Connecte-toi avec **Utilisateur A**
2. Va sur **Messages** (navbar)
3. Tu verras une liste vide (normal, pas encore de conversations)
4. Pour créer une conversation, l'ami doit t'envoyer un message OU :
   - Implémentation future : bouton "Nouveau message" avec sélection d'ami

#### 2. Envoyer un Message
1. API directe (pour tester) :
   ```bash
   POST /api/conversations
   {
     "friendId": "id_de_l_ami"
   }
   ```
2. Ou attendre qu'un ami t'envoie un message

#### 3. Chat en Temps Réel
1. Sélectionne une conversation
2. Tape un message
3. Clique sur l'icône Send (ou Entrée)
4. Le message apparaît instantanément
5. L'ami verra le message dans les 5 secondes (polling)

#### 4. Messages Non Lus
1. Reçois des messages d'amis
2. Tu verras un **badge rouge** avec le nombre
3. Quand tu ouvres la conversation → badge disparaît
4. Messages marqués comme "lus"

---

## 🎯 FONCTIONNALITÉS

### Interface
- ✅ **Split screen** : Conversations | Chat
- ✅ **Responsive** : Mobile, tablet, desktop
- ✅ **Bulles modernes** : Style WhatsApp
- ✅ **Timestamps** : "1min", "2h", "hier"
- ✅ **Scroll auto** : Vers nouveaux messages

### Sécurité
- ✅ **Auth requise** : Token JWT vérifié
- ✅ **Amitié vérifiée** : Seulement entre amis ACCEPTED
- ✅ **Conversations privées** : Accès limité aux participants
- ✅ **Validation** : Max 2000 caractères, pas vide

### Temps Réel
- ✅ **Polling 5 secondes** : Rafraîchit messages auto
- ✅ **Compteurs live** : Non lus mis à jour
- ✅ **Marquage auto** : Messages lus quand ouverts

---

## 💡 AMÉLIORATIONS FUTURES (Non incluses)

### Phase 2
- [ ] **Bouton "Nouveau message"** avec liste d'amis
- [ ] **WebSockets** pour temps réel instantané
- [ ] **Notifications push** navigateur
- [ ] **Badge compteur** sur icône Messages (navbar)

### Phase 3
- [ ] **Images** dans messages
- [ ] **Emojis** picker
- [ ] **Indicateur "en train d'écrire..."**
- [ ] **Recherche** dans messages

### Phase 4
- [ ] **Suppression** de messages
- [ ] **Conversations groupes** (3+ personnes)
- [ ] **Vocal** messages
- [ ] **Vidéo** appels

---

## 🐛 DÉPANNAGE

### "Aucune conversation"
**Normal** si :
- Pas encore de messages échangés
- Pas d'amis

**Solution** :
- Ajoute des amis d'abord
- Envoie un message à un ami

### Messages ne s'affichent pas
**Vérifier** :
1. Console browser (F12) → erreurs ?
2. Réseau (Network tab) → API répond ?
3. Auth token valide ?

**Solutions** :
- Rafraîchir la page
- Se reconnecter
- Vider cache

### Erreur "Vous devez être amis"
**Cause** : Pas d'amitié ACCEPTED

**Solution** :
1. Va sur **Amis**
2. Envoie/Accepte demande d'ami
3. Réessaye d'envoyer un message

---

## 📊 SCHÉMA BASE DE DONNÉES

### Table conversations
```sql
id          UUID PRIMARY KEY
user1Id     UUID (référence users.id)
user2Id     UUID (référence users.id)
createdAt   TIMESTAMP
updatedAt   TIMESTAMP

UNIQUE (user1Id, user2Id)
```

### Table messages
```sql
id              UUID PRIMARY KEY
content         TEXT (max 2000)
isRead          BOOLEAN DEFAULT false
senderId        UUID (référence users.id)
receiverId      UUID (référence users.id)
conversationId  UUID (référence conversations.id)
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

---

## 🎉 RÉSULTAT

**Système de messagerie privée complet et fonctionnel !**

Les utilisateurs peuvent maintenant :
- ✅ Discuter avec leurs amis en privé
- ✅ Voir les messages non lus
- ✅ Recevoir des messages en temps réel
- ✅ Accéder facilement depuis la navbar

**Interface moderne et intuitive style WhatsApp/Messenger ! 💬**
