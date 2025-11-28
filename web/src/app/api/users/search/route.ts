import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Paramètre de recherche manquant' },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
      take: 20,
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

