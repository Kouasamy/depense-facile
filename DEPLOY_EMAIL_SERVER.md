# 🚀 Guide de Déploiement du Serveur Email

## Problème
Quand le site est hébergé, les emails ne sont pas envoyés car le serveur email backend n'est pas déployé.

## Solution : Déployer le Serveur Email

### Option 1 : Railway (Recommandé - Gratuit)

1. **Créer un compte sur Railway** : https://railway.app
2. **Créer un nouveau projet**
3. **Connecter votre repository GitHub** ou uploader le dossier `server/`
4. **Configurer les variables d'environnement** :
   ```
   EMAIL_FROM=contact@gèretondjai.com
   EMAIL_FROM_NAME=GèreTonDjai
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=contact@gèretondjai.com (ou format Punycode si nécessaire)
   SMTP_PASSWORD=ton_mot_de_passe_hostinger
   EMAIL_SERVER_PORT=3001
   NODE_ENV=production
   ```
5. **Configurer le start command** : `node server/email-server.js`
6. **Railway génère automatiquement une URL** (ex: `https://votre-projet.up.railway.app`)
7. **Dans votre frontend**, ajoutez dans les variables d'environnement de production :
   ```
   VITE_EMAIL_SERVER_URL=https://votre-projet.up.railway.app
   ```

### Option 2 : Render (Gratuit)

1. **Créer un compte sur Render** : https://render.com
2. **Créer un nouveau "Web Service"**
3. **Connecter votre repository** ou uploader le code
4. **Configurer** :
   - **Build Command** : `npm install` (ou rien si vous uploadez juste le serveur)
   - **Start Command** : `node server/email-server.js`
   - **Environment** : Node
5. **Ajouter les variables d'environnement** (mêmes que Railway)
6. **Render génère une URL** (ex: `https://votre-projet.onrender.com`)
7. **Configurer `VITE_EMAIL_SERVER_URL`** dans votre frontend

### Option 3 : VPS / Serveur Dédié

Si vous avez un VPS (Hostinger, OVH, etc.) :

1. **SSH dans votre serveur**
2. **Installer Node.js** :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. **Cloner ou uploader le projet**
4. **Installer les dépendances** :
   ```bash
   cd /chemin/vers/projet
   npm install
   ```
5. **Créer un fichier `.env`** avec les variables SMTP
6. **Installer PM2** (pour garder le serveur actif) :
   ```bash
   npm install -g pm2
   ```
7. **Démarrer le serveur avec PM2** :
   ```bash
   pm2 start server/email-server.js --name email-server
   pm2 save
   pm2 startup
   ```
8. **Configurer Nginx** (si nécessaire) pour proxy vers le port 3001
9. **Configurer `VITE_EMAIL_SERVER_URL`** dans votre frontend (ex: `https://api.geretondjai.com`)

### Option 4 : Vercel / Netlify Functions (Limité)

⚠️ **Note** : Ces plateformes ont des timeouts courts. Pour un serveur email, Railway ou Render sont préférés.

## Configuration du Frontend

Après avoir déployé le serveur email, **ajoutez dans les variables d'environnement de production** de votre hébergeur frontend :

```
VITE_EMAIL_SERVER_URL=https://votre-serveur-email.up.railway.app
```

## Vérification

1. **Tester le serveur** : Visitez `https://votre-serveur-email.up.railway.app/health`
   - Devrait retourner : `{"status":"ok","service":"email-server"}`

2. **Tester l'envoi d'email** : Inscrivez-vous sur le site en production
   - Vérifiez les logs du serveur email
   - Vérifiez votre boîte mail

## Dépannage

### Erreur : "Le serveur email n'est pas accessible"
- Vérifiez que `VITE_EMAIL_SERVER_URL` est correctement configuré
- Vérifiez que le serveur email est bien démarré
- Vérifiez les logs du serveur email

### Erreur : "SMTP authentication failed"
- Vérifiez que `SMTP_USER` et `SMTP_PASSWORD` sont corrects
- Vérifiez que le format Punycode est utilisé si nécessaire (pour `gèretondjai.com`)

### Le serveur démarre mais les emails ne partent pas
- Vérifiez les logs du serveur email
- Vérifiez que les ports SMTP (465 ou 587) ne sont pas bloqués
- Testez avec `test-smtp.js` en local d'abord

