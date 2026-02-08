import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findBookCover } from '@/lib/bookCovers';

// GET - Obtenir les critiques
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    if (userId) {
      whereCondition.authorId = userId;
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
          where: {
            userId: authResult.userId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Enrichir avec les couvertures si manquantes
    const enrichedReviews = await Promise.all(
      bookReviews.map(async (review: any) => {
        let bookCover = review.bookCover;

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
  } catch (error) {
    console.error('Get book reviews error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des critiques' },
      { status: 500 }
    );
  }
}

// POST - Créer une critique
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
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
    } = body;

    // Validation
    if (!bookTitle) {
      return NextResponse.json(
        { error: 'Le titre du livre est requis' },
        { status: 400 }
      );
    }

    if (!bookAuthor) {
      return NextResponse.json(
        { error: 'L\'auteur du livre est requis' },
        { status: 400 }
      );
    }

    // Validation de la note (optionnelle maintenant)
    if (rating !== null && rating !== undefined && (rating < 1 || rating > 10)) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 10' },
        { status: 400 }
      );
    }

    const bookReview = await prisma.bookReview.create({
      data: {
        bookTitle,
        bookAuthor,
        bookIsbn,
        bookCover,
        rating: rating ? parseInt(rating) : null, // null si pas de note
        review,
        status,
        startedAt: startedAt ? new Date(startedAt) : null,
        finishedAt: finishedAt ? new Date(finishedAt) : null,
        authorId: authResult.userId,
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

    return NextResponse.json(bookReview, { status: 201 });
  } catch (error) {
    console.error('Create book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la critique' },
      { status: 500 }
    );
  }
}

