import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtenir une critique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const review = await prisma.bookReview.findUnique({
      where: { id: params.reviewId },
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
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Critique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...review,
      isLiked: review.likes.length > 0,
      likes: undefined,
    });
  } catch (error) {
    console.error('Get book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la critique' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une critique
export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { bookTitle, bookAuthor, bookIsbn, bookCover, rating, review, status } = body;

    // Vérifier que la critique appartient à l'utilisateur
    const existingReview = await prisma.bookReview.findUnique({
      where: { id: params.reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Critique non trouvée' },
        { status: 404 }
      );
    }

    if (existingReview.authorId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette critique' },
        { status: 403 }
      );
    }

    const updatedReview = await prisma.bookReview.update({
      where: { id: params.reviewId },
      data: {
        ...(bookTitle && { bookTitle }),
        ...(bookAuthor && { bookAuthor }),
        ...(bookIsbn !== undefined && { bookIsbn }),
        ...(bookCover !== undefined && { bookCover }),
        ...(rating && { rating: parseInt(rating) }),
        ...(review !== undefined && { review }),
        ...(status && { status }),
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

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Update book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la critique' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une critique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const review = await prisma.bookReview.findUnique({
      where: { id: params.reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Critique non trouvée' },
        { status: 404 }
      );
    }

    if (review.authorId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette critique' },
        { status: 403 }
      );
    }

    await prisma.bookReview.delete({
      where: { id: params.reviewId },
    });

    return NextResponse.json({ message: 'Critique supprimée avec succès' });
  } catch (error) {
    console.error('Delete book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la critique' },
      { status: 500 }
    );
  }
}

