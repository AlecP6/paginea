import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId: currentUserId } = authResult;

    const { userId } = params;

    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous ajouter vous-même' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: currentUserId, receiverId: userId },
          { initiatorId: userId, receiverId: currentUserId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Une demande d\'amitié existe déjà' },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.create({
      data: {
        initiatorId: currentUserId,
        receiverId: userId,
        status: 'PENDING',
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

    return NextResponse.json(friendship, { status: 201 });
  } catch (error: any) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}

