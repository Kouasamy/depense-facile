@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   NETTOYAGE COMPLET DU CACHE
echo ========================================
echo.

echo [1/5] Nettoyage du cache Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Cache Vite supprimé
) else (
    echo ℹ️  Pas de cache Vite trouvé
)

echo.
echo [2/5] Nettoyage du dossier dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Dossier dist supprimé
) else (
    echo ℹ️  Pas de dossier dist trouvé
)

echo.
echo [3/5] Nettoyage du cache npm...
call npm cache clean --force >nul 2>&1
echo ✅ Cache npm nettoyé

echo.
echo [4/5] Nettoyage des fichiers temporaires...
if exist ".vite" (
    rmdir /s /q ".vite"
)
if exist ".temp" (
    rmdir /s /q ".temp"
)
echo ✅ Fichiers temporaires supprimés

echo.
echo [5/5] Vérification des node_modules...
if not exist "node_modules" (
    echo ⚠️  node_modules manquant, installation en cours...
    call npm install
) else (
    echo ✅ node_modules présent
)

echo.
echo ========================================
echo   ✅ NETTOYAGE TERMINÉ
echo ========================================
echo.
echo 📋 Pour nettoyer le cache du navigateur :
echo    1. Ouvre l'application
echo    2. Appuie sur F12 (Console)
echo    3. Colle ce code :
echo.
echo    localStorage.clear();
echo    sessionStorage.clear();
echo    indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
echo      console.log('✅ Cache nettoyé !');
echo      location.reload();
echo    };
echo.
echo ========================================
echo   🚀 Redémarrage du serveur...
echo ========================================
echo.

timeout /t 2 >nul
call npm run dev

