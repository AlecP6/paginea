import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, type = 'PUBLIC' } = req.body;

    const post = await prisma.post.create({
      data: {
        content,
        type,
        authorId: req.userId!,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { type, userId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Récupérer les amis de l'utilisateur
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: req.userId },
              { receiverId: req.userId },
            ],
          },
          { status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.initiatorId === req.userId ? f.receiverId : f.initiatorId
    );

    let whereCondition: any = {};

    if (type === 'PUBLIC') {
      // Mur public uniquement
      whereCondition = { type: 'PUBLIC' };
    } else if (userId) {
      // Posts d'un utilisateur spécifique
      whereCondition = { authorId: userId as string };
    } else {
      // Feed: posts publics + posts des amis
      whereCondition = {
        OR: [
          { type: 'PUBLIC' },
          {
            AND: [
              { type: 'FRIENDS' },
              { authorId: { in: [...friendIds, req.userId!] } },
            ],
          },
        ],
      };
    }

    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          where: { userId: req.userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Ajouter un flag isLiked
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined, // Retirer le tableau de likes
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
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
        },
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: { userId: req.userId },
          select: { id: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    const postWithLikeStatus = {
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined,
    };

    res.json(postWithLikeStatus);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    if (post.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post supprimé' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Vérifier si le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si déjà liké
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.userId!,
          postId,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post déjà liké' });
    }

    const like = await prisma.like.create({
      data: {
        userId: req.userId!,
        postId,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Erreur lors du like' });
  }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.userId!,
          postId,
        },
      },
    });

    if (!like) {
      return res.status(404).json({ error: 'Like non trouvé' });
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: req.userId!,
          postId,
        },
      },
    });

    res.json({ message: 'Like retiré' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du like' });
  }
};

