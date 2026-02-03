# 🚀 Déployer le Serveur Email sur Hostinger

Puisque vous hébergez déjà votre site sur Hostinger, déployons le serveur email sur le même hébergeur.

## Option 1 : Via SSH (VPS Hostinger)

Si vous avez un VPS Hostinger avec accès SSH :

### 1. Se connecter en SSH

```bash
ssh votre-utilisateur@votre-ip-hostinger
```

### 2. Installer Node.js (si pas déjà installé)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Créer un dossier pour le serveur email

```bash
mkdir -p /home/votre-utilisateur/email-server
cd /home/votre-utilisateur/email-server
```

### 4. Uploader les fichiers du serveur

Copiez ces fichiers sur votre serveur :
- `server/email-server.js`
- `server/package.json`
- Créez un fichier `.env` avec vos variables

### 5. Installer les dépendances

```bash
npm install
```

### 6. Créer le fichier `.env`

```bash
nano .env
```

Contenu :
```
EMAIL_FROM=contact@gèretondjai.com
EMAIL_FROM_NAME=GèreTonDjai
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@gèretondjai.com
SMTP_PASSWORD=votre_mot_de_passe_mailbox
EMAIL_SERVER_PORT=3001
NODE_ENV=production
```

### 7. Installer PM2 (pour garder le serveur actif)

```bash
npm install -g pm2
```

### 8. Démarrer le serveur avec PM2

```bash
pm2 start email-server.js --name email-server
pm2 save
pm2 startup
```

### 9. Configurer Nginx (si nécessaire)

Si vous voulez accéder via `https://api.geretondjai.com` :

```nginx
server {
    listen 80;
    server_name api.geretondjai.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis redémarrez Nginx :
```bash
sudo systemctl restart nginx
```

### 10. Configurer le frontend

Dans les variables d'environnement de votre site Hostinger, ajoutez :

```
VITE_EMAIL_SERVER_URL=https://api.geretondjai.com
```

Ou si vous n'avez pas de sous-domaine :

```
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

## Option 2 : Via le Panel Hostinger (Hébergement Web)

Si vous avez un hébergement web Hostinger (pas VPS) :

### 1. Accéder au File Manager

1. Connectez-vous à votre panel Hostinger
2. Allez dans "File Manager"

### 2. Créer un dossier pour le serveur

Créez un dossier `email-server` à la racine de votre site

### 3. Uploader les fichiers

Uploadez :
- `server/email-server.js`
- `server/package.json`

### 4. Créer le fichier `.env`

Créez un fichier `.env` dans le dossier `email-server` avec vos variables SMTP

### 5. Installer Node.js via le panel

1. Allez dans "Node.js" dans votre panel Hostinger
2. Créez une nouvelle application Node.js
3. Sélectionnez le dossier `email-server`
4. Version Node.js : 20.x
5. Start Command : `node email-server.js`
6. Port : 3001

### 6. Configurer les variables d'environnement

Dans la section "Environment Variables" de votre application Node.js, ajoutez :
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_SERVER_PORT`
- `NODE_ENV=production`

### 7. Démarrer l'application

Cliquez sur "Start" dans le panel Node.js

### 8. Obtenir l'URL

Hostinger génère une URL pour votre application Node.js (ex: `https://email-server.votre-domaine.com`)

### 9. Configurer le frontend

Dans les variables d'environnement de votre site, ajoutez :

```
VITE_EMAIL_SERVER_URL=https://email-server.votre-domaine.com
```

## Option 3 : Utiliser un sous-domaine (Recommandé)

1. Créez un sous-domaine `api.geretondjai.com` dans votre panel Hostinger
2. Pointez-le vers le dossier du serveur email
3. Configurez Nginx pour proxy vers le port 3001
4. Utilisez `https://api.geretondjai.com` comme `VITE_EMAIL_SERVER_URL`

## Vérification

1. Testez le serveur : `https://votre-url-hostinger/health`
   - Devrait retourner : `{"status":"ok","service":"email-server"}`

2. Testez l'inscription sur votre site en production

3. Vérifiez les logs dans le panel Hostinger ou via SSH

## Dépannage

### Le serveur ne démarre pas
- Vérifiez les logs dans le panel Hostinger
- Vérifiez que Node.js est bien installé
- Vérifiez que le port 3001 n'est pas bloqué

### Erreur "Cannot find module"
- Vérifiez que `npm install` a bien été exécuté
- Vérifiez que tous les fichiers sont bien uploadés

### Les emails ne partent pas
- Vérifiez les variables SMTP dans `.env`
- Testez la connexion SMTP avec `test-smtp.js` en local d'abord
- Vérifiez les logs du serveur

