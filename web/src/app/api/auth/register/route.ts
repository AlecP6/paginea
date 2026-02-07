import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { 
  validateEmail, 
  validateUsername, 
  validateStrongPassword,
  sanitizeString 
} from '@/lib/validation';
import { rateLimiter, getClientIp, RateLimitConfigs, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  console.log('🔵 Register route called');
  try {
    const body = await request.json();
    console.log('🔵 Register body received:', { email: body.email, username: body.username });
    
    // Rate limiting par IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimiter.check(`register:${clientIp}`, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 heure
      blockDurationMs: 2 * 60 * 60 * 1000, // 2 heures
    });
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter || 7200);
    }
    
    const { email, username, password, firstName, lastName } = body;

    // Validation avec les nouvelles fonctions sécurisées
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() }, 
          { username: username.trim() }
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ou nom d\'utilisateur déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe avec un coût plus élevé pour plus de sécurité
    const hashedPassword = await bcrypt.hash(password, 12);

    // Sanitize les champs optionnels
    const sanitizedFirstName = firstName ? sanitizeString(firstName) : undefined;
    const sanitizedLastName = lastName ? sanitizeString(lastName) : undefined;

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password: hashedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    // Générer le token JWT sécurisé
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id }, 
      jwtSecret, 
      {
        expiresIn: '30d',
        algorithm: 'HS256',
        issuer: 'paginea-api',
        audience: 'paginea-app',
      }
    );

    // Inscription réussie : réinitialiser le rate limit
    rateLimiter.reset(`register:${clientIp}`);

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

