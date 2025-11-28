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
  { params }: { params: { reviewId: string } }
) {
  try {
    const adminResult = await requireAdmin(request);
    if ('error' in adminResult) return adminResult.error;

    const { reviewId } = params;

    await prisma.bookReview.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: 'Critique supprimée par l\'administrateur' });
  } catch (error: any) {
    console.error('Admin delete review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la critique' },
      { status: 500 }
    );
  }
}

