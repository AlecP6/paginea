# 🔐 Guide de Sécurité Paginea
*Documentation complète des mesures de sécurité implémentées*

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Protection des mots de passe](#protection-des-mots-de-passe)
4. [Tokens JWT](#tokens-jwt)
5. [Rate Limiting](#rate-limiting)
6. [Validation des données](#validation-des-données)
7. [Protection XSS/CSRF](#protection-xsscsrf)
8. [En-têtes HTTP sécurisés](#en-têtes-http-sécurisés)
9. [Bonnes pratiques](#bonnes-pratiques)
10. [Checklist avant production](#checklist-avant-production)

---

## 🎯 VUE D'ENSEMBLE

Paginea implémente plusieurs couches de sécurité pour protéger les données utilisateurs :

### ✅ Mesures Implémentées

- 🔒 **Hashing bcrypt** avec coût 12 pour les mots de passe
- 🎫 **JWT sécurisés** avec algorithme HS256
- 🚫 **Rate limiting** sur toutes les routes sensibles
- ✔️ **Validation stricte** des entrées utilisateur
- 🛡️ **Protection XSS** via sanitization
- 🔐 **En-têtes HTTP** sécurisés (CSP, HSTS, etc.)
- 📊 **Logging** des tentatives suspectes

---

## 🔐 AUTHENTIFICATION

### Inscription (`/api/auth/register`)

**Sécurité implémentée :**
- ✅ Rate limiting : 3 tentatives par heure par IP
- ✅ Validation email avec regex stricte
- ✅ Validation username (3-30 caractères, alphanumérique)
- ✅ Mot de passe fort obligatoire (8+ caractères, majuscule, minuscule, chiffre)
- ✅ Blocage des mots de passe communs
- ✅ Hashing bcrypt avec coût 12
- ✅ Sanitization des champs texte
- ✅ Normalisation email (trim + lowercase)

**Code exemple :**
```typescript
// web/src/app/api/auth/register/route.ts
const hashedPassword = await bcrypt.hash(password, 12); // Coût augmenté à 12
```

### Connexion (`/api/auth/login`)

**Sécurité implémentée :**
- ✅ Rate limiting double :
  - 5 tentatives par 15 min par IP
  - 3 tentatives par 15 min par email (blocage 1h après)
- ✅ Messages d'erreur génériques (pas de fuite d'info)
- ✅ Protection timing attack via bcrypt.compare
- ✅ Réinitialisation rate limit après connexion réussie

**Flux de sécurité :**
1. Vérification rate limit IP
2. Validation email
3. Recherche utilisateur
4. Comparaison mot de passe (timing safe)
5. Rate limit supplémentaire si échec
6. Génération token JWT si succès
7. Reset rate limits

---

## 🔑 PROTECTION DES MOTS DE PASSE

### Exigences Minimales

```typescript
// web/src/lib/validation.ts
export const ValidationRules = {
  password: {
    minLength: 8,        // Augmenté de 6 à 8
    maxLength: 128,
    // Regex : majuscule + minuscule + chiffre
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  },
};
```

### Validation Forte

La fonction `validateStrongPassword()` vérifie :
- ✅ Longueur minimale de 8 caractères
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre
- ✅ Pas dans la liste des 25 mots de passe les plus courants

### Mots de Passe Interdits

```typescript
const commonPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
  // ... 25 au total
];
```

### Hashing bcrypt

```typescript
// Inscription
const hashedPassword = await bcrypt.hash(password, 12);
// Coût 12 = ~250ms par hash = résistance aux attaques brute force

// Connexion
const isValid = await bcrypt.compare(password, user.password);
// Comparaison timing-safe (protection timing attacks)
```

**Pourquoi bcrypt ?**
- ⏱️ Lent intentionnellement (résistance brute force)
- 🧂 Salt automatique inclus
- 📈 Coût ajustable selon la puissance des machines
- ✅ Standard industriel éprouvé

---

## 🎫 TOKENS JWT

### Configuration Sécurisée

```typescript
// web/src/lib/auth.ts
const token = jwt.sign(
  { userId },              // Payload minimal
  jwtSecret,               // Secret fort (32+ caractères)
  {
    expiresIn: '30d',      // Expiration 30 jours
    algorithm: 'HS256',    // Algorithme explicite
    issuer: 'paginea-api', // Émetteur
    audience: 'paginea-app'// Public visé
  }
);
```

### Vérification Stricte

```typescript
jwt.verify(token, jwtSecret, {
  algorithms: ['HS256'],   // Algorithme forcé
  maxAge: '30d',           // Vérification expiration
});
```

**Pourquoi ces options ?**
- `algorithms`: Empêche l'attaque "algorithm confusion" (none, RS256, etc.)
- `maxAge`: Double vérification de l'expiration
- `issuer/audience`: Protection contre la réutilisation de tokens

### Bonnes Pratiques JWT

✅ **À FAIRE :**
- Payload minimal (juste userId)
- Durée de vie limitée (30 jours max)
- Secret fort (32+ caractères aléatoires)
- Vérification à chaque requête
- Logging des tokens invalides

❌ **À NE PAS FAIRE :**
- Stocker des données sensibles dans le payload
- Utiliser un secret court ou prévisible
- Accepter des tokens sans expiration
- Ignorer les erreurs de vérification

### Génération du Secret JWT

```bash
# En ligne de commande
openssl rand -base64 32

# Exemple de résultat
xP8mK9vL2nR4tY6wZ1aB3cD5eF7gH9jK0lM2nO4pQ6=
```

---

## 🚫 RATE LIMITING

### Configuration par Endpoint

```typescript
// web/src/lib/rateLimit.ts
export const RateLimitConfigs = {
  // Authentification (très stricte)
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,      // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 min blocage
  },
  
  // Création contenu (modérée)
  create: {
    maxAttempts: 20,
    windowMs: 60 * 1000,            // 1 minute
    blockDurationMs: 5 * 60 * 1000  // 5 min blocage
  },
  
  // Upload fichiers (stricte)
  upload: {
    maxAttempts: 10,
    windowMs: 60 * 1000,            // 1 minute
    blockDurationMs: 10 * 60 * 1000 // 10 min blocage
  },
};
```

### Utilisation

```typescript
// Dans une API route
import { rateLimiter, getClientIp, RateLimitConfigs } from '@/lib/rateLimit';

const clientIp = getClientIp(request);
const result = rateLimiter.check(`action:${clientIp}`, RateLimitConfigs.auth);

if (!result.allowed) {
  return createRateLimitResponse(result.retryAfter);
}
```

### Avantages

- 🛡️ Protection contre brute force
- 📊 Détection d'activité suspecte
- ⚡ Performance (en mémoire)
- 🧹 Auto-nettoyage des anciennes entrées

---

## ✅ VALIDATION DES DONNÉES

### Fichier Central

Toutes les validations dans `/web/src/lib/validation.ts`

### Fonctions Disponibles

```typescript
// Email
validateEmail(email: string): ValidationResult

// Username
validateUsername(username: string): ValidationResult

// Mot de passe
validatePassword(password: string): ValidationResult
validateStrongPassword(password: string): ValidationResult

// Contenu
validatePostContent(content: string): ValidationResult
validateCommentContent(content: string): ValidationResult
validateBio(bio: string): ValidationResult

// Sanitization
sanitizeString(str: string): string
```

### Exemple d'Utilisation

```typescript
const emailValidation = validateEmail(email);
if (!emailValidation.isValid) {
  return NextResponse.json(
    { error: emailValidation.error },
    { status: 400 }
  );
}
```

### Règles de Validation

```typescript
export const ValidationRules = {
  email: {
    minLength: 5,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/  // Alphanumerique uniquement
  },
  postContent: {
    minLength: 1,
    maxLength: 5000
  },
  // ... etc
};
```

---

## 🛡️ PROTECTION XSS/CSRF

### Protection XSS (Cross-Site Scripting)

**Sanitization des entrées :**
```typescript
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

**Où c'est appliqué :**
- ✅ Prénom, nom (inscription)
- ✅ Bio utilisateur
- ✅ Tous les textes affichés

**React protège automatiquement :**
- Échappement des variables dans JSX
- Dangerously set innerHTML désactivé

### Protection CSRF (Cross-Site Request Forgery)

**Mesures en place :**
- ✅ Tokens JWT dans headers (pas de cookies)
- ✅ SameSite cookies si utilisés
- ✅ Vérification Origin/Referer (navigateur)
- ✅ Double submit cookie pattern (si nécessaire)

**Pourquoi JWT protège :**
- Stocké en localStorage/sessionStorage
- Pas envoyé automatiquement (comme cookies)
- Doit être ajouté manuellement à chaque requête

---

## 🔐 EN-TÊTES HTTP SÉCURISÉS

### Configuration Next.js

```javascript
// web/next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        // Empêche le sniffing MIME
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        
        // Empêche l'affichage en iframe
        { key: 'X-Frame-Options', value: 'DENY' },
        
        // Active le filtre XSS du navigateur
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        
        // Contrôle le referrer
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        
        // Limite les permissions du navigateur
        { 
          key: 'Permissions-Policy', 
          value: 'camera=(), microphone=(), geolocation=()' 
        },
        
        // Force HTTPS
        { 
          key: 'Strict-Transport-Security', 
          value: 'max-age=31536000; includeSubDomains' 
        },
        
        // Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'..."
        },
      ],
    },
  ];
}
```

### Explication des En-têtes

#### X-Content-Type-Options: nosniff
Empêche le navigateur de deviner le type MIME. Protège contre les attaques où un fichier .txt est exécuté comme .js.

#### X-Frame-Options: DENY
Empêche le site d'être affiché dans une iframe. Protège contre le clickjacking.

#### X-XSS-Protection: 1; mode=block
Active le filtre XSS intégré du navigateur (backup si React échoue).

#### Strict-Transport-Security
Force l'utilisation de HTTPS pendant 1 an. Protège contre les attaques man-in-the-middle.

#### Content-Security-Policy (CSP)
Définit quelles ressources peuvent être chargées. Protection puissante contre XSS.

```
default-src 'self'                  // Par défaut, uniquement le même domaine
script-src 'self' 'unsafe-inline'   // Scripts du domaine + inline
img-src 'self' data: https:         // Images du domaine + data URLs + HTTPS
connect-src 'self' https://api...   // APIs autorisées
```

---

## 📝 BONNES PRATIQUES

### 1. Gestion des Secrets

✅ **À FAIRE :**
```bash
# Générer un secret fort
openssl rand -base64 32 > jwt_secret.txt

# Utiliser des variables d'environnement
DATABASE_URL="postgresql://..."
JWT_SECRET="xP8mK9vL2nR4tY6wZ1aB3cD5eF7gH9jK0lM2nO4pQ6="
```

❌ **À NE PAS FAIRE :**
```javascript
// NE JAMAIS hard-coder les secrets
const JWT_SECRET = "mysecret123"; // ❌
```

### 2. Logging Sécurisé

✅ **À FAIRE :**
```typescript
console.log('Login attempt for user:', userId);
console.warn('Invalid token attempt from IP:', clientIp);
```

❌ **À NE PAS FAIRE :**
```typescript
console.log('Password:', password); // ❌ JAMAIS logger les mots de passe
console.log('Token:', token);       // ❌ JAMAIS logger les tokens
```

### 3. Gestion des Erreurs

✅ **Messages génériques :**
```typescript
return NextResponse.json(
  { error: 'Email ou mot de passe incorrect' }, // Generic
  { status: 401 }
);
```

❌ **Messages spécifiques :**
```typescript
// ❌ Fuite d'information
return NextResponse.json({ error: 'User not found' });
return NextResponse.json({ error: 'Wrong password' });
```

### 4. Validation Côté Serveur

✅ **Toujours valider côté serveur :**
```typescript
// Même si validé côté client, TOUJOURS re-valider côté serveur
const validation = validateEmail(email);
if (!validation.isValid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

### 5. HTTPS en Production

✅ **Configuration requise :**
- Certificat SSL/TLS valide
- Redirection automatique HTTP → HTTPS
- HSTS header activé
- Cookies avec flag Secure

---

## ✅ CHECKLIST AVANT PRODUCTION

### Configuration

- [ ] `JWT_SECRET` généré avec `openssl rand -base64 32`
- [ ] `DATABASE_URL` configuré avec mot de passe fort
- [ ] `NODE_ENV=production` défini
- [ ] Variables d'environnement dans Vercel/hébergeur
- [ ] `.env.local` ajouté à `.gitignore`

### Sécurité

- [ ] HTTPS activé sur le domaine
- [ ] Certificat SSL valide
- [ ] HSTS header activé
- [ ] CSP configuré correctement
- [ ] Rate limiting activé
- [ ] Logs d'erreurs configurés (Sentry, LogRocket, etc.)

### Base de Données

- [ ] Utilisateur PostgreSQL avec privilèges limités
- [ ] SSL activé pour connexion DB
- [ ] Sauvegardes automatiques configurées
- [ ] Connection pooling configuré

### Tests de Sécurité

- [ ] Test d'injection SQL (devrait échouer)
- [ ] Test XSS (devrait être sanitized)
- [ ] Test brute force login (devrait être rate limited)
- [ ] Test tokens expirés (devrait être rejeté)
- [ ] Test CSRF (devrait échouer)

### Monitoring

- [ ] Logs d'erreurs centralisés
- [ ] Alertes sur tentatives suspectes
- [ ] Monitoring des taux d'erreur
- [ ] Dashboard de sécurité

---

## 🚨 INCIDENTS DE SÉCURITÉ

### En Cas de Compromission

1. **Immédiat :**
   - Changer le `JWT_SECRET`
   - Révoquer tous les tokens (force re-login)
   - Analyser les logs

2. **Investigation :**
   - Identifier la source
   - Vérifier l'étendue des dégâts
   - Documenter l'incident

3. **Correction :**
   - Patcher la vulnérabilité
   - Mettre à jour les dépendances
   - Renforcer la sécurité

4. **Communication :**
   - Informer les utilisateurs si nécessaire
   - Documenter les changements
   - Mettre à jour ce guide

---

## 📚 RESSOURCES

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Explained](https://www.npmjs.com/package/bcrypt)

### Outils de Test

- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnérabilités
- [Burp Suite](https://portswigger.net/burp) - Test de sécurité web
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Audit des dépendances

### Commandes Utiles

```bash
# Audit des dépendances
npm audit
npm audit fix

# Mettre à jour les dépendances
npm update

# Tester les en-têtes HTTP
curl -I https://votresite.com

# Générer un secret fort
openssl rand -base64 32
```

---

## 📊 RÉSUMÉ DES AMÉLIORATIONS

### Avant vs Après

| Aspect | Avant | Après |
|--------|-------|-------|
| Mot de passe min | 6 caractères | 8 caractères + complexité |
| Bcrypt cost | 10 | 12 |
| Rate limiting | ❌ Aucun | ✅ Multi-niveaux |
| Validation | Basique | Stricte + sanitization |
| JWT algorithm | Implicite | Explicite (HS256) |
| En-têtes sécurité | Partiels | Complets (CSP, HSTS, etc.) |
| Logging | Minimal | Détaillé + sécurisé |

---

**Dernière mise à jour :** 7 février 2026  
**Version :** 2.0  
**Auteur :** Équipe Sécurité Paginea
