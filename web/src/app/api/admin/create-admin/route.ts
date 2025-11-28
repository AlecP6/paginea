import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, username: targetUsername, email: targetEmail } = body;

    // Vérifier le secret pour éviter la création accidentelle
    // Vous pouvez définir ADMIN_CREATE_SECRET dans vos variables d'environnement
    const expectedSecret = process.env.ADMIN_CREATE_SECRET || 'create-admin-santa-2024';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Secret invalide' },
        { status: 403 }
      );
    }

    // Si un username ou email est spécifié, promouvoir cet utilisateur
    if (targetUsername || targetEmail) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            targetUsername ? { username: targetUsername } : {},
            targetEmail ? { email: targetEmail } : {},
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
    }

    // Sinon, créer le compte Santa par défaut
    const username = 'Santa';
    const email = 'santa@paginea.fr';
    const password = 'Liqini@6';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      // Mettre à jour le rôle si l'utilisateur existe
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' },
        });
        return NextResponse.json({
          message: `Utilisateur "${username}" mis à jour avec le rôle ADMIN`,
          user: {
            username: existingUser.username,
            email: existingUser.email,
            role: 'ADMIN',
          },
        });
      } else {
        return NextResponse.json({
          message: `L'utilisateur "${username}" est déjà admin`,
          user: {
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
          },
        });
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Compte admin créé avec succès !',
      user: admin,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte admin' },
      { status: 500 }
    );
  }
}

