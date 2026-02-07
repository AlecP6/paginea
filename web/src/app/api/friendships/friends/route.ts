import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId: currentUserId } = authResult;

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const targetUserId = userIdParam || currentUserId;

    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: targetUserId },
              { receiverId: targetUserId },
            ],
          },
          { status: 'ACCEPTED' },
        ],
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

    const friends = friendships.map((f: any) => {
      if (f.initiatorId === targetUserId) {
        return { friendshipId: f.id, ...f.receiver };
      } else {
        return { friendshipId: f.id, ...f.initiator };
      }
    });

    return NextResponse.json(friends);
  } catch (error: any) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des amis' },
      { status: 500 }
    );
  }
}

