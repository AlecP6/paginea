import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest): { userId: string } | { error: Response } {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Token manquant ou invalide' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { userId };
}

