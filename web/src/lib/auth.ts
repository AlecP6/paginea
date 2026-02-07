import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Extrait et valide le token JWT de la requête
 * @param request - La requête Next.js
 * @returns L'ID utilisateur ou null si invalide
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return null;
    }

    // Vérifier le format "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.warn('Invalid authorization header format');
      return null;
    }

    const token = parts[1];

    if (!token || token.length === 0) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      throw new Error('JWT_SECRET not configured');
    }

    // Vérifier et décoder le token avec options strictes
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'], // Spécifier l'algorithme explicitement
      maxAge: '30d', // Vérifier l'expiration
    }) as JWTPayload;
    
    if (!decoded.userId) {
      console.warn('Token payload missing userId');
      return null;
    }

    return decoded.userId;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Middleware pour exiger une authentification
 * @param request - La requête Next.js
 * @returns L'ID utilisateur ou une erreur de réponse
 */
export function requireAuth(request: NextRequest): { userId: string } | { error: Response } {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return {
      error: new Response(
        JSON.stringify({ 
          error: 'Non autorisé. Token manquant ou invalide.',
          code: 'UNAUTHORIZED' 
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="api"'
          } 
        }
      ),
    };
  }

  return { userId };
}

/**
 * Génère un token JWT sécurisé
 * @param userId - L'ID de l'utilisateur
 * @param expiresIn - Durée de validité (défaut: 30 jours)
 * @returns Le token JWT
 */
export function generateToken(userId: string, expiresIn: string | number = '30d'): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  // Payload minimal pour réduire la taille du token
  const payload: JWTPayload = {
    userId,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: expiresIn as string,
    algorithm: 'HS256',
    issuer: 'paginea-api',
    audience: 'paginea-app',
  } as jwt.SignOptions);
}

/**
 * Vérifie si un token est valide sans lever d'exception
 * @param token - Le token JWT
 * @returns true si valide, false sinon
 */
export function isTokenValid(token: string): boolean {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return false;
    }

    jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
    });
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Décode un token sans vérification (pour debug uniquement)
 * NE PAS UTILISER EN PRODUCTION POUR L'AUTHENTIFICATION
 */
export function decodeTokenUnsafe(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}
