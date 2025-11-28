import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, postId, bookReviewId } = req.body;

    // Vérifier qu'au moins un ID est fourni
    if (!postId && !bookReviewId) {
      return res.status(400).json({ error: 'postId ou bookReviewId requis' });
    }

    // Vérifier que le post ou la critique existe
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }
    }

    if (bookReviewId) {
      const review = await prisma.bookReview.findUnique({ where: { id: bookReviewId } });
      if (!review) {
        return res.status(404).json({ error: 'Critique non trouvée' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.userId!,
        ...(postId && { postId }),
        ...(bookReviewId && { bookReviewId }),
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
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
};

