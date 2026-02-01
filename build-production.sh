#!/bin/bash

# Script de build pour la production Hostinger
# Usage: ./build-production.sh

echo "🚀 Building for production..."

# Vérifier que .env.production existe
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "📝 Creating .env.production from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.production
        echo "✅ Please edit .env.production with your Supabase credentials"
        exit 1
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
fi

# Installer les dépendances
echo "📦 Installing dependencies..."
npm install

# Build de production
echo "🔨 Building production bundle..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist folder not found"
    exit 1
fi

# Copier .htaccess dans dist
if [ -f .htaccess ]; then
    echo "📋 Copying .htaccess to dist..."
    cp .htaccess dist/
fi

echo "✅ Build completed successfully!"
echo "📁 Files are ready in the 'dist' folder"
echo "🚀 You can now upload the 'dist' folder to Hostinger's public_html"
echo ""
echo "📝 Next steps:"
echo "   1. Compress the 'dist' folder to ZIP"
echo "   2. Upload to Hostinger File Manager"
echo "   3. Extract in public_html"
echo "   4. Verify your site is working"

