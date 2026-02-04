# 🔧 Fix Reverse Proxy - Le serveur Node.js n'est pas accessible

## ❌ Problème

Quand vous allez sur `https://xn--gretondjai-z6a.com/health`, vous êtes redirigé vers la page d'accueil. Cela signifie que le reverse proxy ne route pas les requêtes vers le serveur Node.js.

## ✅ Solution : Configurer le reverse proxy dans .htaccess

### ÉTAPE 1 : Vérifier que le serveur Node.js est démarré

Dans hPanel → Node.js → Votre application :
- Vérifiez que le statut est **"Running"**
- Vérifiez les logs pour voir : `🚀 Serveur email démarré sur 0.0.0.0:3001`

### ÉTAPE 2 : Créer/modifier le fichier .htaccess

Dans File Manager → `public_html/` → Créez ou modifiez le fichier `.htaccess`

**Ajoutez ce contenu :**

```apache
# Reverse proxy pour le serveur Node.js
RewriteEngine On

# Route /health vers le serveur Node.js
RewriteCond %{REQUEST_URI} ^/health$
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]

# Route /api vers le serveur Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

**⚠️ Important :** Le module `mod_proxy` doit être activé sur Hostinger. Si ça ne fonctionne pas, contactez le support Hostinger pour activer le reverse proxy.

### ÉTAPE 3 : Alternative - Utiliser le domaine principal

Si le reverse proxy ne fonctionne pas, utilisez le domaine principal dans `VITE_EMAIL_SERVER_URL` :

Dans hPanel → Variables d'environnement :
```
VITE_EMAIL_SERVER_URL=https://geretondjai.com/api
```

Au lieu de :
```
VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com/api
```

### ÉTAPE 4 : Vérifier la configuration Node.js

Dans hPanel → Node.js → Votre application :
- **Dossier** : Doit être `server/` ou `public_html/server/`
- **Port** : Doit être `3001`
- **Statut** : Doit être "Running"

## 🆘 Si ça ne fonctionne toujours pas

Contactez le support Hostinger et demandez :
- "Comment configurer le reverse proxy pour router `/api/*` vers mon application Node.js sur le port 3001 ?"
- "Le module mod_proxy est-il activé sur mon hébergement ?"

