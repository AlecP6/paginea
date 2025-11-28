import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export const createBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bookTitle,
      bookAuthor,
      bookIsbn,
      bookCover,
      rating,
      review,
      status = 'READ',
      startedAt,
      finishedAt,
    } = req.body;

    const bookReview = await prisma.bookReview.create({
      data: {
        bookTitle,
        bookAuthor,
        bookIsbn,
        bookCover,
        rating: parseInt(rating),
        review,
        status,
        startedAt: startedAt ? new Date(startedAt) : null,
        finishedAt: finishedAt ? new Date(finishedAt) : null,
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

    res.status(201).json(bookReview);
  } catch (error) {
    console.error('Create book review error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la critique' });
  }
};

export const getBookReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    if (userId) {
      whereCondition.authorId = userId as string;
    }

    if (status) {
      whereCondition.status = status;
    }

    const bookReviews = await prisma.bookReview.findMany({
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

    // Enrichir avec les couvertures Google Books si nécessaire
    const enrichedReviews = await Promise.all(
      bookReviews.map(async (review) => {
        let bookCover = review.bookCover || '';
        
        // Si pas de couverture, chercher sur Google Books
        if (!bookCover) {
          try {
            const searchQuery = `${review.bookTitle} ${review.bookAuthor}`;
            const googleResponse = await axios.get(GOOGLE_BOOKS_API, {
              params: {
                q: searchQuery,
                maxResults: 1,
              },
            });

            if (googleResponse.data.items && googleResponse.data.items.length > 0) {
              const bookData = googleResponse.data.items[0].volumeInfo;
              bookCover = bookData.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                          bookData.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
                          '';
            }
          } catch (err) {
            console.log('Impossible de récupérer la couverture depuis Google Books');
          }
        }

        return {
          ...review,
          bookCover: bookCover,
          isLiked: review.likes.length > 0,
          likes: undefined,
        };
      })
    );

    res.json(enrichedReviews);
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des critiques' });
  }
};

export const getBookReviewById = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const bookReview = await prisma.bookReview.findUnique({
      where: { id: reviewId },
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

    if (!bookReview) {
      return res.status(404).json({ error: 'Critique non trouvée' });
    }

    const reviewWithLikeStatus = {
      ...bookReview,
      isLiked: bookReview.likes.length > 0,
      likes: undefined,
    };

    res.json(reviewWithLikeStatus);
  } catch (error) {
    console.error('Get book review error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la critique' });
  }
};

export const updateBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const {
      bookTitle,
      bookAuthor,
      bookIsbn,
      bookCover,
      rating,
      review,
      status,
      startedAt,
      finishedAt,
    } = req.body;

    const existingReview = await prisma.bookReview.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Critique non trouvée' });
    }

    if (existingReview.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updatedReview = await prisma.bookReview.update({
      where: { id: reviewId },
      data: {
        ...(bookTitle && { bookTitle }),
        ...(bookAuthor && { bookAuthor }),
        ...(bookIsbn !== undefined && { bookIsbn }),
        ...(bookCover !== undefined && { bookCover }),
        ...(rating && { rating: parseInt(rating) }),
        ...(review !== undefined && { review }),
        ...(status && { status }),
        ...(startedAt !== undefined && { startedAt: startedAt ? new Date(startedAt) : null }),
        ...(finishedAt !== undefined && { finishedAt: finishedAt ? new Date(finishedAt) : null }),
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

    res.json(updatedReview);
  } catch (error) {
    console.error('Update book review error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la critique' });
  }
};

export const deleteBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const bookReview = await prisma.bookReview.findUnique({
      where: { id: reviewId },
    });

    if (!bookReview) {
      return res.status(404).json({ error: 'Critique non trouvée' });
    }

    if (bookReview.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.bookReview.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Critique supprimée' });
  } catch (error) {
    console.error('Delete book review error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la critique' });
  }
};

export const likeBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const bookReview = await prisma.bookReview.findUnique({
      where: { id: reviewId },
    });

    if (!bookReview) {
      return res.status(404).json({ error: 'Critique non trouvée' });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_bookReviewId: {
          userId: req.userId!,
          bookReviewId: reviewId,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Critique déjà likée' });
    }

    const like = await prisma.like.create({
      data: {
        userId: req.userId!,
        bookReviewId: reviewId,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Like book review error:', error);
    res.status(500).json({ error: 'Erreur lors du like' });
  }
};

export const unlikeBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const like = await prisma.like.findUnique({
      where: {
        userId_bookReviewId: {
          userId: req.userId!,
          bookReviewId: reviewId,
        },
      },
    });

    if (!like) {
      return res.status(404).json({ error: 'Like non trouvé' });
    }

    await prisma.like.delete({
      where: {
        userId_bookReviewId: {
          userId: req.userId!,
          bookReviewId: reviewId,
        },
      },
    });

    res.json({ message: 'Like retiré' });
  } catch (error) {
    console.error('Unlike book review error:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du like' });
  }
};

export const uploadBookCover = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier n\'a été uploadé.' });
    }

    const bookReview = await prisma.bookReview.findUnique({
      where: { id: reviewId },
    });

    if (!bookReview) {
      return res.status(404).json({ error: 'Critique non trouvée' });
    }

    if (bookReview.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const coverPath = `/uploads/${req.file.filename}`;

    const updatedReview = await prisma.bookReview.update({
      where: { id: reviewId },
      data: {
        bookCover: coverPath,
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

    res.json(updatedReview);
  } catch (error) {
    console.error('Upload book cover error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la couverture' });
  }
};

