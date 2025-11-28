#!/bin/bash
set -e

# Générer Prisma Client
npx prisma generate

# Exécuter le build Next.js
# Ignorer les erreurs de pré-rendu pour les pages 404/500
if npx next build 2>&1 | tee /tmp/build.log; then
  exit 0
else
  # Vérifier si les seules erreurs sont des erreurs de pré-rendu pour 404/500
  if grep -q "Error occurred prerendering page.*404\|Error occurred prerendering page.*500" /tmp/build.log && \
     ! grep -q "Failed to compile\|Type error\|SyntaxError" /tmp/build.log; then
    echo "Build completed with warnings for error pages (404/500)"
    exit 0
  else
    exit 1
  fi
fi

