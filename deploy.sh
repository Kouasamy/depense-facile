#!/bin/bash
# Script de déploiement pour Hostinger
# Ce script s'exécute automatiquement après chaque push sur GitHub

echo "🚀 Démarrage du déploiement..."

# Installer les dépendances du projet principal
echo "📦 Installation des dépendances principales..."
npm install

# Build du frontend
echo "🔨 Build du frontend..."
npm run build

# Installer les dépendances du serveur email
echo "📦 Installation des dépendances du serveur email..."
cd server
npm install
cd ..

# Créer le dossier logs pour le serveur email
mkdir -p server/logs

# Démarrer le serveur email en arrière-plan (si pas déjà démarré)
if ! pgrep -f "email-server.js" > /dev/null; then
    echo "🚀 Démarrage du serveur email..."
    cd server
    nohup node email-server.js > logs/email-server.log 2>&1 &
    cd ..
    echo "✅ Serveur email démarré"
else
    echo "ℹ️ Serveur email déjà en cours d'exécution"
fi

echo "✅ Déploiement terminé !"

