import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const body = await request.json();
    const { username, email, firstName, lastName, bio, avatar } = body;

    // Validation
    if (username && username.length < 3) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'email ou le username est déjà utilisé
    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                email ? { email } : {},
                username ? { username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email ou nom d\'utilisateur déjà utilisé' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

