import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { friendshipId } = params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Amitié non trouvée' },
        { status: 404 }
      );
    }

    if (
      friendship.initiatorId !== userId &&
      friendship.receiverId !== userId
    ) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({ message: 'Ami retiré' });
  } catch (error: any) {
    console.error('Remove friend error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait de l\'ami' },
      { status: 500 }
    );
  }
}

