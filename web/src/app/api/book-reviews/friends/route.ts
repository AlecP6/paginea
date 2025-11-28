import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { userId } = authResult;

    // Récupérer les amis de l'utilisateur
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: userId },
              { receiverId: userId },
            ],
          },
          { status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.initiatorId === userId ? f.receiverId : f.initiatorId
    );

    if (friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // Récupérer uniquement les critiques des amis
    const bookReviews = await prisma.bookReview.findMany({
      where: {
        authorId: { in: friendIds },
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
        likes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Enrichir avec les couvertures Google Books si manquantes
    const enrichedReviews = await Promise.all(
      bookReviews.map(async (review) => {
        let bookCover = review.bookCover;

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

        if (bookCover && !bookCover.startsWith('http')) {
          bookCover = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${bookCover}`;
        }

        return {
          ...review,
          bookCover,
          isLiked: review.likes.length > 0,
          likes: undefined,
        };
      })
    );

    return NextResponse.json(enrichedReviews);
  } catch (error: any) {
    console.error('Get friends reviews error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des critiques des amis' },
      { status: 500 }
    );
  }
}

