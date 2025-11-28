#!/bin/bash

# Script de démarrage Paginea
# Lance le backend et le frontend en parallèle

echo "🚀 Démarrage de Paginea..."
echo ""

# Vérifier que PostgreSQL tourne
echo "📊 Vérification de PostgreSQL..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL ne semble pas tourner!"
    echo "   Assurez-vous que Postgres.app est démarré"
    echo "   Ou lancez : brew services start postgresql"
    exit 1
fi
echo "✅ PostgreSQL est actif"
echo ""

# Fonction pour tuer les processus sur un port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "🔄 Port $port occupé, libération..."
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Libérer les ports si nécessaire
kill_port 3001
kill_port 3000

# Démarrer le backend
echo "🔧 Démarrage du Backend (port 3001)..."
cd /Users/alex/Documents/Paginea/backend
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
npm run dev > /tmp/paginea-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Attendre que le backend démarre
sleep 3

# Vérifier que le backend fonctionne
if curl -s http://localhost:3001/health | grep -q "ok"; then
    echo "✅ Backend démarré avec succès!"
else
    echo "❌ Erreur au démarrage du backend"
    echo "   Consultez les logs: tail -f /tmp/paginea-backend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo ""

# Démarrer le frontend
echo "🎨 Démarrage du Frontend (port 3000)..."
cd /Users/alex/Documents/Paginea/web
npm run dev > /tmp/paginea-web.log 2>&1 &
WEB_PID=$!
echo "   Frontend PID: $WEB_PID"

# Attendre que le frontend compile
echo "   ⏳ Compilation en cours..."
sleep 8

# Vérifier que le frontend répond
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|304"; then
    echo "✅ Frontend démarré avec succès!"
else
    echo "⚠️  Frontend en cours de démarrage..."
    echo "   Attendez quelques secondes et accédez à http://localhost:3000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Paginea est maintenant accessible !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend : http://localhost:3000"
echo "🔧 Backend  : http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Backend  : tail -f /tmp/paginea-backend.log"
echo "   Frontend : tail -f /tmp/paginea-web.log"
echo ""
echo "🛑 Pour arrêter les serveurs :"
echo "   kill $BACKEND_PID $WEB_PID"
echo "   Ou utilisez : ./stop-all.sh"
echo ""
echo "💡 Ouvrez http://localhost:3000 dans votre navigateur!"
echo ""

# Garder le script actif
wait

