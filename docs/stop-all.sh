#!/bin/bash

# Script d'arrêt Paginea
# Arrête tous les serveurs backend et frontend

echo "🛑 Arrêt de Paginea..."
echo ""

# Fonction pour tuer les processus sur un port
kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "🔴 Arrêt du $name (port $port, PID: $pid)..."
        kill -9 $pid 2>/dev/null
        echo "✅ $name arrêté"
    else
        echo "ℹ️  $name n'était pas en cours d'exécution (port $port)"
    fi
}

# Arrêter les serveurs
kill_port 3001 "Backend"
kill_port 3000 "Frontend"

# Nettoyer les logs si l'utilisateur le souhaite
echo ""
read -p "🗑️  Voulez-vous supprimer les logs ? (o/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
    rm -f /tmp/paginea-backend.log /tmp/paginea-web.log
    echo "✅ Logs supprimés"
fi

echo ""
echo "✅ Paginea arrêté!"
echo ""

