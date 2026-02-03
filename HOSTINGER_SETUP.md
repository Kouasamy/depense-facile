# 🚀 Configuration Hostinger - Déploiement Automatique

Ce guide explique comment configurer votre projet pour qu'il se déploie automatiquement sur Hostinger depuis GitHub.

## 📋 Prérequis

- Compte Hostinger avec hébergement web
- Repository GitHub connecté à Hostinger
- Mailbox Hostinger configuré

## 🔧 Configuration sur Hostinger

### 1. Variables d'environnement à configurer

Dans le panel Hostinger, allez dans **"Variables d'environnement"** ou **".env"** et ajoutez :

#### Pour le Frontend (variables VITE_*)
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
VITE_EMAIL_FROM=contact@gèretondjai.com
VITE_EMAIL_FROM_NAME=GèreTonDjai
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

**OU** si vous créez un sous-domaine pour le serveur email :
```
VITE_EMAIL_SERVER_URL=https://api.geretondjai.com
```

#### Pour le Serveur Email (dans le dossier server/)
Créez un fichier `.env` dans le dossier `server/` sur Hostinger avec :
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

### 2. Configuration du déploiement automatique

#### Option A : Via Git (Recommandé)

1. Dans le panel Hostinger, allez dans **"Git"** ou **"Déploiement"**
2. Connectez votre repository GitHub
3. Configurez le **"Build Command"** :
   ```bash
   npm install && npm run build
   ```
4. Configurez le **"Start Command"** (si nécessaire) :
   ```bash
   # Pour le frontend (généralement géré automatiquement)
   # Pour le serveur email, voir Option B
   ```

#### Option B : Démarrer le serveur email automatiquement

**Méthode 1 : Via Cron Job (Recommandé pour Hostinger)**

1. Dans le panel Hostinger, allez dans **"Cron Jobs"**
2. Créez un nouveau cron job :
   - **Commande** : `cd /home/votre-utilisateur/public_html/server && node email-server.js > /dev/null 2>&1 &`
   - **Fréquence** : `@reboot` (démarre au boot du serveur)

**Méthode 2 : Via Script de démarrage**

Créez un fichier `start-email-server.sh` à la racine :
```bash
#!/bin/bash
cd server
nohup node email-server.js > email-server.log 2>&1 &
```

Rendez-le exécutable :
```bash
chmod +x start-email-server.sh
```

Appelez-le dans votre script de déploiement ou via cron.

**Méthode 3 : Via Node.js Manager (si disponible)**

Si Hostinger propose un gestionnaire Node.js :
1. Créez une nouvelle application Node.js
2. Sélectionnez le dossier `server/`
3. Start Command : `node email-server.js`
4. Port : 3001
5. Ajoutez les variables d'environnement

### 3. Structure des fichiers sur Hostinger

Après le déploiement, votre structure devrait ressembler à :
```
public_html/
├── index.html (frontend build)
├── assets/ (fichiers statiques du frontend)
├── server/
│   ├── email-server.js
│   ├── package.json
│   ├── .env (variables d'environnement)
│   └── node_modules/
└── .htaccess
```

### 4. Vérification après déploiement

1. **Testez le frontend** : Visitez `https://geretondjai.com`
2. **Testez le serveur email** : Visitez `https://geretondjai.com:3001/health`
   - Devrait retourner : `{"status":"ok","service":"email-server"}`
3. **Testez l'inscription** : Inscrivez-vous sur le site et vérifiez votre boîte mail

## 🔍 Dépannage

### Le serveur email ne démarre pas

1. Vérifiez les logs dans le panel Hostinger
2. Vérifiez que Node.js est installé : `node --version`
3. Vérifiez que les dépendances sont installées : `cd server && npm install`
4. Vérifiez les permissions : `chmod +x server/start.sh`

### Les emails ne sont pas envoyés

1. Vérifiez que le serveur email est démarré : `ps aux | grep email-server`
2. Vérifiez les variables SMTP dans `server/.env`
3. Vérifiez les logs : `tail -f server/email-server.log`
4. Testez la connexion SMTP avec `test-smtp.js` en local

### Erreur "Port already in use"

Le port 3001 est peut-être déjà utilisé. Changez `EMAIL_SERVER_PORT` dans `server/.env` vers un autre port (ex: 3002, 3003).

### Le frontend ne trouve pas le serveur email

1. Vérifiez que `VITE_EMAIL_SERVER_URL` est correctement configuré
2. Vérifiez que le serveur email est accessible (testez `/health`)
3. Vérifiez les CORS dans `server/email-server.js` (déjà configuré)

## 📝 Notes importantes

- Le fichier `.env` dans `server/` ne doit **PAS** être commité sur GitHub (déjà dans `.gitignore`)
- Créez le fichier `.env` directement sur Hostinger après le premier déploiement
- Le serveur email doit tourner en permanence pour que les emails fonctionnent
- Utilisez PM2 ou un cron job pour maintenir le serveur actif

## ✅ Checklist de déploiement

- [ ] Variables d'environnement frontend configurées sur Hostinger
- [ ] Fichier `server/.env` créé sur Hostinger avec les identifiants SMTP
- [ ] Serveur email démarré (via cron, PM2, ou Node.js Manager)
- [ ] Test `/health` fonctionne
- [ ] Test d'inscription envoie bien l'email
- [ ] Logs vérifiés et sans erreur

