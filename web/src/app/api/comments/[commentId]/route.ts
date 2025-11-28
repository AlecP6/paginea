import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { commentId } = params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    if (comment.authorId !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Commentaire supprimé' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
}

