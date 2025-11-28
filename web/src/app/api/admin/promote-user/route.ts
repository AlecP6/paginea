import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    // Vérifier que l'utilisateur actuel est déjà admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Seuls les admins peuvent promouvoir des utilisateurs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email } = body;

    if (!username && !email) {
      return NextResponse.json(
        { error: 'Username ou email requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          username ? { username } : {},
          email ? { email } : {},
        ].filter(Boolean),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({
        message: `L'utilisateur "${user.username}" est déjà admin`,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Promouvoir en admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `Utilisateur "${updatedUser.username}" promu admin avec succès`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Promote user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la promotion' },
      { status: 500 }
    );
  }
}

