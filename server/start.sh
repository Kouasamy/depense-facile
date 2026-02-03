#!/bin/bash
# Script de démarrage du serveur email pour Hostinger

# Aller dans le dossier du serveur
cd "$(dirname "$0")"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur email..."
node email-server.js

