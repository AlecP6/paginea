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

    const recentReviews = await prisma.bookReview.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const enrichedBooks = await Promise.all(
      recentReviews.map(async (review) => {
        let bookCover = review.bookCover;

        // Si la couverture n'est pas présente, essayer de la récupérer via Google Books
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
            console.log('Impossible de récupérer la couverture depuis Google Books:', err);
          }
        }

        // S'assurer que l'URL de la couverture est complète
        if (bookCover && !bookCover.startsWith('http')) {
          bookCover = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${bookCover}`;
        }

        return {
          title: review.bookTitle,
          author: review.bookAuthor,
          coverImage: bookCover,
          isbn: review.bookIsbn || '',
          rating: review.rating,
          starRating: review.rating / 2, // Convertir de /10 à /5
          review: review.review || '',
          status: review.status,
          publishedBy: review.author.username,
          publishedByAvatar: review.author.avatar || '',
          publishedAt: review.createdAt,
        };
      })
    );

    return NextResponse.json(enrichedBooks);
  } catch (error: any) {
    console.error('Community recent books error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dernières publications' },
      { status: 500 }
    );
  }
}

