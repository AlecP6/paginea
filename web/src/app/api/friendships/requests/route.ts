import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const friendRequests = await prisma.friendship.findMany({
      where: {
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(friendRequests);
  } catch (error: any) {
    console.error('Get friend requests error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}

