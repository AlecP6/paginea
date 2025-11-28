import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { friendshipId } = params;
    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    if (friendship.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      );
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
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

    return NextResponse.json(updatedFriendship);
  } catch (error: any) {
    console.error('Respond to friend request error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réponse à la demande' },
      { status: 500 }
    );
  }
}

