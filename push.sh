#!/bin/bash
# Script pour pousser les changements sur GitHub

cd /Users/alex/Documents/Paginea

echo "🚀 Push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Push réussi !"
    echo "🌐 Vercel va déployer automatiquement..."
else
    echo "❌ Erreur lors du push"
    echo "💡 Essaye manuellement : git push origin main"
fi
