#!/bin/bash

echo "🐘 Installation de PostgreSQL pour Paginea"
echo "=========================================="
echo ""

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "📦 Installation de Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Ajouter Homebrew au PATH
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

echo ""
echo "📦 Installation de PostgreSQL 14..."
brew install postgresql@14

echo ""
echo "🚀 Démarrage de PostgreSQL..."
brew services start postgresql@14

# Ajouter PostgreSQL au PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc

# Attendre que PostgreSQL démarre
sleep 3

echo ""
echo "🗄️  Création de la base de données Paginea..."
createdb paginea

echo ""
echo "✅ PostgreSQL installé avec succès !"
echo ""
echo "📊 Configuration de la base de données..."
cd backend
npm run migrate

echo ""
echo "🎉 Installation terminée !"
echo ""
echo "Vous pouvez maintenant lancer l'application avec :"
echo "  cd backend && npm run dev"

