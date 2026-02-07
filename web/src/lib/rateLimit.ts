/**
 * Rate Limiter middleware pour API Routes
 * Protection contre les attaques par force brute
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitRecord>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.attempts = new Map();
    // Nettoyer les anciennes entrées toutes les 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Vérifie si une requête est autorisée
   * @param key - Identifiant unique (IP, email, etc.)
   * @param config - Configuration du rate limit
   * @returns { allowed: boolean, retryAfter?: number }
   */
  check(
    key: string,
    config: {
      maxAttempts?: number;
      windowMs?: number;
      blockDurationMs?: number;
    } = {}
  ): { allowed: boolean; retryAfter?: number } {
    const {
      maxAttempts = 5,
      windowMs = 15 * 60 * 1000, // 15 minutes
      blockDurationMs = 30 * 60 * 1000, // 30 minutes
    } = config;

    const now = Date.now();
    const record = this.attempts.get(key);

    // Vérifier si l'utilisateur est bloqué
    if (record?.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
      };
    }

    // Si pas d'enregistrement ou fenêtre expirée, créer nouveau
    if (!record || now > record.resetAt) {
      this.attempts.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true };
    }

    // Incrémenter le compteur
    record.count++;

    // Si dépassement, bloquer
    if (record.count > maxAttempts) {
      record.blockedUntil = now + blockDurationMs;
      return {
        allowed: false,
        retryAfter: Math.ceil(blockDurationMs / 1000),
      };
    }

    return { allowed: true };
  }

  /**
   * Réinitialise le compteur pour une clé (après connexion réussie)
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetAt && (!record.blockedUntil || now > record.blockedUntil)) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Détruit le rate limiter (pour tests)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }
}

// Instance globale
const globalForRateLimiter = globalThis as unknown as {
  rateLimiter: RateLimiter | undefined;
};

export const rateLimiter =
  globalForRateLimiter.rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

/**
 * Extrait l'IP du client depuis la requête
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Configurations prédéfinies pour différents endpoints
 */
export const RateLimitConfigs = {
  // Authentification - très stricte
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes de blocage
  },
  
  // Création de contenu - modérée
  create: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  
  // Lecture - permissive
  read: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 2 * 60 * 1000, // 2 minutes
  },
  
  // Upload de fichiers - stricte
  upload: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },
  
  // Recherche - modérée
  search: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 3 * 60 * 1000, // 3 minutes
  },
};

/**
 * Helper pour créer une réponse de rate limit dépassé
 */
export function createRateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Trop de tentatives. Veuillez réessayer plus tard.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
