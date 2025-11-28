import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getTopBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;

    const topBooks = await prisma.bookReview.groupBy({
      by: ['bookTitle', 'bookAuthor', 'bookCover'],
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          rating: 'desc',
        },
      },
      take: limit,
      having: {
        id: {
          _count: {
            gte: 1,
          },
        },
      },
    });

    // Formater les résultats
    const formattedBooks = topBooks.map((book) => ({
      title: book.bookTitle,
      author: book.bookAuthor,
      cover: book.bookCover,
      averageRating: book._avg.rating ? Math.round(book._avg.rating * 10) / 10 : 0,
      reviewCount: book._count.id,
    }));

    res.json(formattedBooks);
  } catch (error) {
    console.error('Get top books error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des meilleurs livres' });
  }
};

