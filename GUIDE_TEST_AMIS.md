# ✅ Guide de Test - Système d'Amis

## 🎯 Tests à Effectuer

---

## Test 1️⃣ : Refus puis Nouvelle Demande (Bug Principal)

### Prérequis
- 2 comptes utilisateurs : User A et User B
- Les deux ne sont pas amis

### Étapes

1. **Se connecter en tant que User A**
2. Aller sur `/friends`
3. Chercher "User B"
4. Cliquer sur "Ajouter"
5. **Vérifier** : Toast "Demande envoyée !"

6. **Se déconnecter et se connecter en tant que User B**
7. Aller sur `/friends`
8. Voir la demande de User A dans "Demandes d'amis"
9. Cliquer sur ❌ (refuser)
10. **Vérifier** : Toast "Demande refusée"

11. **Se reconnecter en tant que User A**
12. Aller sur `/friends`
13. Chercher "User B"
14. Cliquer sur "Ajouter" à nouveau
15. **Vérifier** : ✅ Toast "Demande envoyée !" (pas d'erreur)

### ✅ Résultat Attendu
- Aucune erreur "Une demande d'amitié existe déjà"
- La nouvelle demande est créée avec succès
- User B voit la nouvelle demande

---

## Test 2️⃣ : Suppression puis Nouvelle Demande

### Prérequis
- User A et User B sont déjà amis

### Étapes

1. **Se connecter en tant que User A**
2. Aller sur `/friends`
3. Survoler User B dans la liste d'amis
4. Cliquer sur le bouton ❌ (UserMinus)
5. Confirmer la suppression
6. **Vérifier** : Toast "Ami retiré"

7. Chercher "User B" dans la recherche
8. Cliquer sur "Ajouter"
9. **Vérifier** : ✅ Toast "Demande envoyée !" (pas d'erreur)

### ✅ Résultat Attendu
- La demande est envoyée avec succès
- User B voit la nouvelle demande

---

## Test 3️⃣ : Protection Demande en Attente

### Prérequis
- User A et User B ne sont pas amis

### Étapes

1. **Se connecter en tant que User A**
2. Aller sur `/friends`
3. Chercher "User B"
4. Cliquer sur "Ajouter"
5. **Vérifier** : Toast "Demande envoyée !"

6. **Sans se déconnecter**, chercher "User B" à nouveau
7. Cliquer sur "Ajouter" encore une fois
8. **Vérifier** : ❌ Toast "Une demande d'amitié est déjà en attente"

### ✅ Résultat Attendu
- Impossible d'envoyer plusieurs demandes en même temps
- Message d'erreur clair et précis

---

## Test 4️⃣ : Protection Déjà Amis

### Prérequis
- User A et User B sont déjà amis

### Étapes

1. **Se connecter en tant que User A**
2. Aller sur `/friends`
3. **Vérifier** : User B apparaît dans "Mes amis"

4. Chercher "User B" dans la recherche
5. Cliquer sur "Ajouter"
6. **Vérifier** : ❌ Toast "Vous êtes déjà amis"

### ✅ Résultat Attendu
- Impossible d'envoyer une demande à un ami existant
- Message d'erreur approprié

---

## Test 5️⃣ : Acceptation de Demande (Normal)

### Prérequis
- User A a envoyé une demande à User B

### Étapes

1. **Se connecter en tant que User B**
2. Aller sur `/friends`
3. Voir la demande de User A
4. Cliquer sur ✅ (accepter)
5. **Vérifier** : Toast "Ami ajouté !"
6. **Vérifier** : User A apparaît dans "Mes amis"

7. **Se reconnecter en tant que User A**
8. Aller sur `/friends`
9. **Vérifier** : User B apparaît dans "Mes amis"

### ✅ Résultat Attendu
- Les deux utilisateurs sont maintenant amis
- Apparaissent dans la liste de chacun

---

## Test 6️⃣ : Cycle Complet

### Étapes Complètes

```
1. User A envoie demande à User B
   ✅ Demande créée (PENDING)

2. User B refuse
   ✅ Demande supprimée de la BDD

3. User A renvoie demande
   ✅ Nouvelle demande créée (PENDING)

4. User B accepte
   ✅ Statut mis à jour (ACCEPTED)

5. User A supprime User B
   ✅ Amitié supprimée de la BDD

6. User B envoie demande à User A
   ✅ Nouvelle demande créée (PENDING)

7. User A accepte
   ✅ Amis à nouveau !
```

### ✅ Résultat Attendu
- Tout le cycle fonctionne sans erreur
- Aucun blocage à aucune étape

---

## 📊 Vérifications Backend

### Console Logs (F12)

Côté frontend, vous ne verrez que les toasts.

---

### Vercel Logs (Production)

Après avoir effectué les tests, vérifier les logs Vercel :

**Quand une demande est refusée** :
```
❌ Demande refusée et supprimée: {
  friendshipId: "...",
  initiatorId: "...",
  receiverId: "..."
}
```

**Quand une ancienne demande REJECTED est réutilisée** :
```
🗑️ Ancienne demande REJECTED supprimée, création d'une nouvelle
```

**Quand une demande est acceptée** :
```
✅ Demande acceptée: {
  friendshipId: "...",
  initiator: "username_a",
  receiver: "username_b"
}
```

---

### Vérification Base de Données

**Après les tests, exécuter** :
```sql
-- Ne doit retourner AUCUNE ligne
SELECT * FROM friendships WHERE status = 'REJECTED';
```

**Résultat attendu** : 0 lignes

**Explication** : Toutes les demandes refusées sont maintenant supprimées immédiatement.

---

## 🐛 Problèmes Potentiels

### Problème : "Une demande d'amitié existe déjà" après refus

**Cause** : Le nouveau code n'est pas déployé

**Solution** :
1. Vérifier que les fichiers ont été modifiés
2. Relancer `npm run dev` en local
3. En production, vérifier le déploiement Vercel

---

### Problème : Demande acceptée mais pas dans "Mes amis"

**Cause** : Cache frontend ou problème de rafraîchissement

**Solution** :
1. Actualiser la page (F5)
2. Se déconnecter/reconnecter
3. Vérifier les logs console (F12)

---

### Problème : "Non autorisé" lors du refus

**Cause** : Vous essayez de refuser une demande que vous n'avez pas reçue

**Solution** : Seul le **receiver** peut accepter/refuser une demande

---

## 📝 Checklist Complète

### Avant de Déployer
- [ ] Test 1 : Refus puis nouvelle demande ✅
- [ ] Test 2 : Suppression puis nouvelle demande ✅
- [ ] Test 3 : Protection demande en attente ✅
- [ ] Test 4 : Protection déjà amis ✅
- [ ] Test 5 : Acceptation normale ✅
- [ ] Test 6 : Cycle complet ✅
- [ ] Vérifier logs console (pas d'erreur) ✅
- [ ] Vérifier BDD (pas de REJECTED) ✅

### Après Déploiement
- [ ] Tester en production (https://www.paginea.fr)
- [ ] Vérifier Vercel Logs
- [ ] Tester sur mobile
- [ ] Tester avec plusieurs utilisateurs

---

## 🎉 Résultat Final Attendu

```
✅ Refus puis nouvelle demande : OK
✅ Suppression puis nouvelle demande : OK
✅ Protection spam (demande en attente) : OK
✅ Protection déjà amis : OK
✅ Acceptation normale : OK
✅ Cycle complet : OK
✅ Base de données propre : OK
✅ Logs détaillés : OK
```

---

**Date** : 8 février 2026  
**Statut** : 🟢 Prêt pour tests  
**Prochaine action** : Lancer `npm run dev` et tester avec 2 comptes
