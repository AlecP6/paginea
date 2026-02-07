import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authResult = requireAuth(request);
  if ('error' in authResult) return authResult.error;
  const { userId } = authResult;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      ),
    };
  }

  return { userId };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const adminResult = await requireAdmin(request);
    if ('error' in adminResult) return adminResult.error;

    const { commentId } = params;

    // Vérifier d'abord si le commentaire existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé ou déjà supprimé' },
        { status: 404 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Commentaire supprimé par l\'administrateur' });
  } catch (error: any) {
    console.error('Admin delete comment error:', error);
    
    // Gestion spécifique pour les erreurs Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Commentaire non trouvé ou déjà supprimé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
}

