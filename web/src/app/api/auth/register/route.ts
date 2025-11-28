import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🔵 Register route called');
  try {
    const body = await request.json();
    console.log('🔵 Register body received:', { email: body.email, username: body.username });
    const { email, username, password, firstName, lastName } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ou nom d\'utilisateur déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
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

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: '30d',
    });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Erreurs spécifiques
    if (error.message?.includes('JWT_SECRET') || !process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing!');
      return NextResponse.json(
        { error: 'Configuration serveur manquante. Veuillez contacter le support.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email ou nom d\'utilisateur déjà utilisé' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('Can\'t reach database') || 
        error.message?.includes('P1001') ||
        error.code === 'P1001') {
      console.error('Database connection error!');
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données. Vérifiez DATABASE_URL.' },
        { status: 500 }
      );
    }
    
    // Erreur Prisma Client non généré
    if (error.message?.includes('PrismaClient') || error.message?.includes('prisma')) {
      console.error('Prisma Client error!');
      return NextResponse.json(
        { error: 'Erreur de configuration de la base de données' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'inscription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}

