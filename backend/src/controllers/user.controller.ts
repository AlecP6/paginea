import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            bookReviews: true,
            friendsInitiated: {
              where: { status: 'ACCEPTED' },
            },
            friendsReceived: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Calculer le nombre total d'amis
    const friendsCount = user._count.friendsInitiated + user._count.friendsReceived;

    res.json({
      ...user,
      friendsCount,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, firstName, lastName, bio, avatar } = req.body;

    // Vérifier si l'email ou le username est déjà utilisé par un autre utilisateur
    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: req.userId } },
            {
              OR: [
                email ? { email } : {},
                username ? { username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email ou nom d\'utilisateur déjà utilisé' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Paramètre de recherche manquant' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
      take: 20,
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Construire l'URL de l'avatar
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Mettre à jour le profil avec la nouvelle URL
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
};

