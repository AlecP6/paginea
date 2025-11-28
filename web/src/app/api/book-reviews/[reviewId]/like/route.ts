import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Liker une critique
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { reviewId } = params;

    // Vérifier si le like existe déjà
    const existingLike = await prisma.bookReviewLike.findUnique({
      where: {
        userId_bookReviewId: {
          userId: authResult.userId,
          bookReviewId: reviewId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ message: 'Déjà liké' });
    }

    await prisma.bookReviewLike.create({
      data: {
        userId: authResult.userId,
        bookReviewId: reviewId,
      },
    });

    return NextResponse.json({ message: 'Critique likée avec succès' });
  } catch (error) {
    console.error('Like book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du like' },
      { status: 500 }
    );
  }
}

// DELETE - Unliker une critique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { reviewId } = params;

    await prisma.bookReviewLike.deleteMany({
      where: {
        userId: authResult.userId,
        bookReviewId: reviewId,
      },
    });

    return NextResponse.json({ message: 'Like retiré avec succès' });
  } catch (error) {
    console.error('Unlike book review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait du like' },
      { status: 500 }
    );
  }
}

