# Database
DATABASE_URL="postgresql://username:password@localhost:5432/paginea?schema=public"

# JWT Secret - IMPORTANT: Générez une clé sécurisée aléatoire
# Utilisez: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"

# Vercel Blob (pour upload d'images en production)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Google Books API (optionnel)
GOOGLE_BOOKS_API_KEY="your-google-books-api-key"

# Amazon Affiliate (pour les liens de livre)
AMAZON_AFFILIATE_ID="votreid-21"

# IMPORTANT - Sécurité
# 1. JWT_SECRET doit être une chaîne aléatoire d'au moins 32 caractères
# 2. Ne JAMAIS committer ce fichier avec des vraies valeurs
# 3. En production, utilisez les variables d'environnement de votre hébergeur
# 4. Changez tous les secrets avant le déploiement
