import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous ajouter vous-même' });
    }

    // Vérifier si l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si une amitié existe déjà
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: req.userId, receiverId: userId },
          { initiatorId: userId, receiverId: req.userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Une demande d\'amitié existe déjà' });
    }

    const friendship = await prisma.friendship.create({
      data: {
        initiatorId: req.userId!,
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(friendship);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande' });
  }
};

export const respondToFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { friendshipId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (friendship.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (friendship.status !== 'PENDING') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.json(updatedFriendship);
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ error: 'Erreur lors de la réponse à la demande' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.userId;

    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: targetUserId as string },
              { receiverId: targetUserId as string },
            ],
          },
          { status: 'ACCEPTED' },
        ],
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Retourner uniquement l'ami (pas l'utilisateur lui-même)
    const friends = friendships.map((f) => {
      if (f.initiatorId === targetUserId) {
        return { friendshipId: f.id, ...f.receiver };
      } else {
        return { friendshipId: f.id, ...f.initiator };
      }
    });

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des amis' });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const friendRequests = await prisma.friendship.findMany({
      where: {
        receiverId: req.userId,
        status: 'PENDING',
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(friendRequests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Amitié non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de cette amitié
    if (
      friendship.initiatorId !== req.userId &&
      friendship.receiverId !== req.userId
    ) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    res.json({ message: 'Ami retiré' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Erreur lors du retrait de l\'ami' });
  }
};

