import express from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend,
} from '../controllers/friendship.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Envoyer une demande d'ami
router.post('/request/:userId', authMiddleware, sendFriendRequest);

// Répondre à une demande d'ami
router.put('/request/:friendshipId', authMiddleware, respondToFriendRequest);

// Obtenir la liste des amis
router.get('/friends', authMiddleware, getFriends);

// Obtenir les demandes d'amis en attente
router.get('/requests', authMiddleware, getFriendRequests);

// Retirer un ami
router.delete('/:friendshipId', authMiddleware, removeFriend);

export default router;

