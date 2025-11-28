import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            bookReviews: true,
            friendsInitiated: {
              where: { status: 'ACCEPTED' },
            },
            friendsReceived: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const friendsCount = user._count.friendsInitiated + user._count.friendsReceived;

    return NextResponse.json({
      ...user,
      friendsCount,
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

