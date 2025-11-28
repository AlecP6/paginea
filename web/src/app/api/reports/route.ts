import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const body = await request.json();
    const { reason, description, postId, commentId, bookReviewId } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'La raison du signalement est requise' },
        { status: 400 }
      );
    }

    // Vérifier qu'au moins un ID est fourni
    if (!postId && !commentId && !bookReviewId) {
      return NextResponse.json(
        { error: 'Un post, commentaire ou critique doit être spécifié' },
        { status: 400 }
      );
    }

    // Vérifier que le contenu existe
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json(
          { error: 'Post non trouvé' },
          { status: 404 }
        );
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment) {
        return NextResponse.json(
          { error: 'Commentaire non trouvé' },
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

    const report = await prisma.report.create({
      data: {
        reason,
        description: description || null,
        reporterId: userId,
        postId: postId || null,
        commentId: commentId || null,
        bookReviewId: bookReviewId || null,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }

    const reports = await prisma.report.findMany({
      where: whereCondition,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        comment: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        bookReview: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des signalements' },
      { status: 500 }
    );
  }
}

