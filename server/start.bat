@echo off
REM Script de démarrage du serveur email pour Hostinger (Windows)

REM Aller dans le dossier du serveur
cd /d "%~dp0"

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call npm install
)

REM Démarrer le serveur
echo 🚀 Démarrage du serveur email...
node email-server.js

