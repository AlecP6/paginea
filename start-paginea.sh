#!/bin/bash

echo "🚀 Démarrage de Paginea"
echo "======================="
echo ""

# Vérifier que PostgreSQL est accessible
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas dans le PATH"
    echo ""
    echo "Ajoutez PostgreSQL au PATH avec :"
    echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
fi

# Vérifier que la base de données existe
if ! psql -lqt | cut -d \| -f 1 | grep -qw paginea; then
    echo "📊 Création de la base de données paginea..."
    createdb paginea
    echo "✅ Base de données créée"
fi

echo ""
echo "📊 Application des migrations..."
cd backend && npm run migrate

echo ""
echo "✅ Paginea est prêt !"
echo ""
echo "Pour démarrer les services :"
echo ""
echo "Terminal 1 - Backend :"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Web :"
echo "  cd web && npm run dev"
echo ""
echo "Terminal 3 - Mobile (optionnel) :"
echo "  cd mobile && npx expo start"
echo ""

