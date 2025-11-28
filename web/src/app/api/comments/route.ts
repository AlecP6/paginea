import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const body = await request.json();
    const { content, postId, bookReviewId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    if (!postId && !bookReviewId) {
      return NextResponse.json(
        { error: 'postId ou bookReviewId requis' },
        { status: 400 }
      );
    }

    // Vérifier que le post ou la critique existe
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json(
          { error: 'Post non trouvé' },
          { status: 404 }
        );
      }
    }

    if (bookReviewId) {
      const review = await prisma.bookReview.findUnique({ where: { id: bookReviewId } });
      if (!review) {
        return NextResponse.json(
          { error: 'Critique non trouvée' },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}

