import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { rateLimiter, getClientIp, RateLimitConfigs, createRateLimitResponse } from '@/lib/rateLimit';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Rate limiting par IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimiter.check(`login:${clientIp}`, RateLimitConfigs.auth);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter || 1800);
    }

    // Validation avec la nouvelle fonction
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Rate limiting supplémentaire par email pour les tentatives échouées
      rateLimiter.check(`login:email:${email}`, {
        maxAttempts: 3,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000, // 1 heure
      });
      
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec timing attack protection
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Rate limiting par email
      rateLimiter.check(`login:email:${email}`, {
        maxAttempts: 3,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000, // 1 heure
      });
      
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Connexion réussie : réinitialiser les rate limits
    rateLimiter.reset(`login:${clientIp}`);
    rateLimiter.reset(`login:email:${email}`);

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

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

