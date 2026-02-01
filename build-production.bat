@echo off
REM Script de build pour la production Hostinger (Windows)
REM Usage: build-production.bat

echo 🚀 Building for production...

REM Vérifier que .env.production existe
if not exist .env.production (
    echo ⚠️  Warning: .env.production not found
    echo 📝 Creating .env.production from .env.example...
    
    if exist .env.example (
        copy .env.example .env.production
        echo ✅ Please edit .env.production with your Supabase credentials
        pause
        exit /b 1
    ) else (
        echo ❌ Error: .env.example not found
        pause
        exit /b 1
    )
)

REM Installer les dépendances
echo 📦 Installing dependencies...
call npm install

REM Build de production
echo 🔨 Building production bundle...
call npm run build

REM Vérifier que le build a réussi
if not exist "dist" (
    echo ❌ Error: Build failed - dist folder not found
    pause
    exit /b 1
)

REM Copier .htaccess dans dist
if exist .htaccess (
    echo 📋 Copying .htaccess to dist...
    copy .htaccess dist\
)

echo ✅ Build completed successfully!
echo 📁 Files are ready in the 'dist' folder
echo 🚀 You can now upload the 'dist' folder to Hostinger's public_html
echo.
echo 📝 Next steps:
echo    1. Compress the 'dist' folder to ZIP
echo    2. Upload to Hostinger File Manager
echo    3. Extract in public_html
echo    4. Verify your site is working
echo.
pause

