import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findBookCover } from '@/lib/bookCovers';

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
      recentReviews.map(async (review: any) => {
        let bookCover = review.bookCover;

        // Si la couverture n'est pas présente, essayer de la récupérer
        if (!bookCover) {
          try {
            const result = await findBookCover(review.bookTitle, review.bookIsbn);
            bookCover = result.coverUrl;
            
            if (bookCover) {
              console.log(`✅ Couverture trouvée via ${result.source} pour: ${review.bookTitle}`);
            }
          } catch (err) {
            console.log('❌ Impossible de récupérer la couverture:', err);
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

    // Headers de cache pour les données qui changent peu souvent
    const headers = {
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
    };

    return NextResponse.json(enrichedBooks, { headers });
  } catch (error: any) {
    console.error('Community recent books error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dernières publications' },
      { status: 500 }
    );
  }
}

