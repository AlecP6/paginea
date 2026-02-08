#!/bin/bash

# 🚀 Script de Push vers GitHub - Paginea
# Exécutez ce script pour pousser vos changements

echo "📦 Préparation du push vers GitHub..."
echo ""

cd /Users/alex/Documents/Paginea

# Afficher le statut
echo "✅ Commit prêt à être poussé :"
git log -1 --oneline
echo ""
echo "📊 Statistiques du commit :"
git show --stat HEAD
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demander la méthode
echo "Choisissez votre méthode d'authentification :"
echo ""
echo "1️⃣  Push avec HTTPS (token requis)"
echo "2️⃣  Basculer vers SSH puis push"
echo "3️⃣  Annuler"
echo ""
read -p "Votre choix (1, 2 ou 3) : " choice

case $choice in
  1)
    echo ""
    echo "🔐 Push avec HTTPS..."
    echo ""
    echo "⚠️  Si demandé, utilisez votre Personal Access Token comme mot de passe"
    echo "   (Pas votre mot de passe GitHub !)"
    echo ""
    echo "📖 Pour créer un token : https://github.com/settings/tokens/new"
    echo "   Permissions requises : repo"
    echo ""
    git push origin main
    ;;
  2)
    echo ""
    echo "🔑 Basculement vers SSH..."
    git remote set-url origin git@github.com:AlecP6/paginea.git
    echo "✅ Remote changé vers SSH"
    echo ""
    echo "🚀 Push en cours..."
    git push origin main
    ;;
  3)
    echo ""
    echo "❌ Annulé"
    exit 0
    ;;
  *)
    echo ""
    echo "❌ Choix invalide"
    exit 1
    ;;
esac

# Vérifier le résultat
if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✅ Push réussi ! 🎉"
  echo ""
  echo "🌐 Votre dépôt GitHub : https://github.com/AlecP6/paginea"
  echo ""
  echo "📝 Commit poussé :"
  echo "   - 24 fichiers modifiés"
  echo "   - ✨ Interface moderne avec animations"
  echo "   - 🔒 Sécurité renforcée"
  echo "   - 🐛 Corrections de bugs"
  echo "   - 📚 Documentation complète"
  echo ""
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "❌ Erreur lors du push"
  echo ""
  echo "💡 Solutions possibles :"
  echo ""
  echo "   Option A - Token HTTPS :"
  echo "   1. Allez sur https://github.com/settings/tokens/new"
  echo "   2. Créez un token avec permissions 'repo'"
  echo "   3. Réexécutez ce script et utilisez le token comme mot de passe"
  echo ""
  echo "   Option B - SSH :"
  echo "   1. Générez une clé SSH : ssh-keygen -t ed25519 -C 'alex@email.com'"
  echo "   2. Ajoutez-la à GitHub : https://github.com/settings/keys"
  echo "   3. Réexécutez ce script et choisissez l'option SSH"
  echo ""
fi
