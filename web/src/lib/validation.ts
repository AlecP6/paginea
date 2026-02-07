/**
 * Validation des données utilisateur
 * Centralise toutes les règles de validation pour la sécurité
 */

export const ValidationRules = {
  email: {
    minLength: 5,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/, // Alphanumerique, underscore, tiret
  },
  password: {
    minLength: 8, // Augmenté de 6 à 8
    maxLength: 128,
    // Au moins une majuscule, une minuscule, un chiffre
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  },
  bio: {
    maxLength: 500,
  },
  postContent: {
    minLength: 1,
    maxLength: 5000,
  },
  commentContent: {
    minLength: 1,
    maxLength: 1000,
  },
  bookTitle: {
    minLength: 1,
    maxLength: 500,
  },
  bookAuthor: {
    minLength: 1,
    maxLength: 255,
  },
  reviewText: {
    maxLength: 5000,
  },
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valide un email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email requis' };
  }

  email = email.trim().toLowerCase();

  if (email.length < ValidationRules.email.minLength) {
    return { isValid: false, error: 'Email trop court' };
  }

  if (email.length > ValidationRules.email.maxLength) {
    return { isValid: false, error: 'Email trop long' };
  }

  if (!ValidationRules.email.pattern.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }

  return { isValid: true };
}

/**
 * Valide un nom d'utilisateur
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Nom d\'utilisateur requis' };
  }

  username = username.trim();

  if (username.length < ValidationRules.username.minLength) {
    return { isValid: false, error: `Le nom d'utilisateur doit contenir au moins ${ValidationRules.username.minLength} caractères` };
  }

  if (username.length > ValidationRules.username.maxLength) {
    return { isValid: false, error: `Le nom d'utilisateur ne peut pas dépasser ${ValidationRules.username.maxLength} caractères` };
  }

  if (!ValidationRules.username.pattern.test(username)) {
    return { isValid: false, error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' };
  }

  return { isValid: true };
}

/**
 * Valide un mot de passe
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Mot de passe requis' };
  }

  if (password.length < ValidationRules.password.minLength) {
    return { isValid: false, error: `Le mot de passe doit contenir au moins ${ValidationRules.password.minLength} caractères` };
  }

  if (password.length > ValidationRules.password.maxLength) {
    return { isValid: false, error: `Le mot de passe est trop long` };
  }

  // Vérifier la complexité
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  return { isValid: true };
}

/**
 * Nettoie et sécurise une chaîne de texte (protection XSS basique)
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide et nettoie le contenu d'un post
 */
export function validatePostContent(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Le contenu ne peut pas être vide' };
  }

  if (content.length > ValidationRules.postContent.maxLength) {
    return { isValid: false, error: `Le contenu ne peut pas dépasser ${ValidationRules.postContent.maxLength} caractères` };
  }

  return { isValid: true };
}

/**
 * Valide et nettoie le contenu d'un commentaire
 */
export function validateCommentContent(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Le commentaire ne peut pas être vide' };
  }

  if (content.length > ValidationRules.commentContent.maxLength) {
    return { isValid: false, error: `Le commentaire ne peut pas dépasser ${ValidationRules.commentContent.maxLength} caractères` };
  }

  return { isValid: true };
}

/**
 * Valide une bio utilisateur
 */
export function validateBio(bio: string): ValidationResult {
  if (bio && bio.length > ValidationRules.bio.maxLength) {
    return { isValid: false, error: `La bio ne peut pas dépasser ${ValidationRules.bio.maxLength} caractères` };
  }

  return { isValid: true };
}

/**
 * Liste de mots de passe courants à interdire
 */
const commonPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
  'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'Football', 'password1'
];

/**
 * Vérifie si le mot de passe est dans la liste des mots de passe communs
 */
export function isCommonPassword(password: string): boolean {
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Valide un mot de passe fort (plus stricte)
 */
export function validateStrongPassword(password: string): ValidationResult {
  const basicValidation = validatePassword(password);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Vérifier les mots de passe communs
  if (isCommonPassword(password)) {
    return { isValid: false, error: 'Ce mot de passe est trop commun. Choisissez-en un plus unique.' };
  }

  // Vérifier la présence de caractères spéciaux (optionnel mais recommandé)
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    // Avertissement mais pas d'erreur
    console.warn('Le mot de passe ne contient pas de caractères spéciaux (recommandé mais non obligatoire)');
  }

  return { isValid: true };
}

/**
 * Rate limiting simple (côté client)
 * Retourne true si l'action est autorisée, false sinon
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }>;
  
  constructor() {
    this.attempts = new Map();
  }

  /**
   * Vérifie si l'action est autorisée
   * @param key - Identifiant unique (ex: email, userId)
   * @param maxAttempts - Nombre max de tentatives
   * @param windowMs - Fenêtre de temps en ms
   */
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Réinitialise les tentatives pour une clé
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Nettoie les anciennes entrées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}
