# 🚀 Guide de Déploiement Rapide - Hostinger

## ✅ Ce qui a été configuré

Tous les fichiers nécessaires pour le déploiement automatique depuis GitHub vers Hostinger sont maintenant en place :

### Fichiers créés :
- ✅ `server/start.sh` - Script de démarrage Linux
- ✅ `server/start.bat` - Script de démarrage Windows
- ✅ `server/ecosystem.config.js` - Configuration PM2
- ✅ `server/env.example` - Exemple de variables d'environnement
- ✅ `.htaccess` - Configuration Apache pour Hostinger
- ✅ `deploy.sh` - Script de déploiement automatique
- ✅ `HOSTINGER_SETUP.md` - Guide complet de configuration

## 📋 Actions à faire sur Hostinger

### 1. Après le premier push sur GitHub

1. **Connectez votre repo GitHub** dans le panel Hostinger (section Git/Déploiement)
2. **Configurez le Build Command** :
   ```bash
   npm install && npm run build
   ```

### 2. Créer le fichier `.env` pour le serveur email

Dans le **File Manager** de Hostinger :
1. Allez dans le dossier `server/`
2. Créez un fichier `.env` (copiez depuis `env.example`)
3. Remplissez avec vos identifiants SMTP Hostinger :
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

### 3. Configurer les variables d'environnement du frontend

Dans le panel Hostinger, section **Variables d'environnement** :
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
VITE_EMAIL_FROM=contact@gèretondjai.com
VITE_EMAIL_FROM_NAME=GèreTonDjai
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

### 4. Démarrer le serveur email automatiquement

**Option A : Via Cron Job (Recommandé)**

Dans le panel Hostinger, section **Cron Jobs** :
- **Commande** : `cd /home/votre-utilisateur/public_html/server && node email-server.js > /dev/null 2>&1 &`
- **Fréquence** : `@reboot`

**Option B : Via Node.js Manager (si disponible)**

1. Créez une application Node.js
2. Dossier : `server/`
3. Start Command : `node email-server.js`
4. Port : 3001
5. Ajoutez les variables d'environnement

### 5. Vérifier que tout fonctionne

1. **Testez le frontend** : `https://geretondjai.com`
2. **Testez le serveur email** : `https://geretondjai.com:3001/health`
   - Devrait retourner : `{"status":"ok","service":"email-server"}`
3. **Testez l'inscription** : Inscrivez-vous et vérifiez votre boîte mail

## 🔄 Déploiement automatique

Une fois configuré, chaque `git push` sur GitHub déclenchera automatiquement :
1. ✅ Installation des dépendances
2. ✅ Build du frontend
3. ✅ Installation des dépendances du serveur email
4. ✅ Le serveur email redémarre automatiquement (via cron ou PM2)

## 📝 Notes importantes

- Le fichier `server/.env` ne sera **PAS** commité sur GitHub (sécurité)
- Créez-le manuellement sur Hostinger après le premier déploiement
- Le serveur email doit tourner en permanence pour que les emails fonctionnent
- Utilisez un cron job `@reboot` pour maintenir le serveur actif

## 🆘 Dépannage

Si les emails ne fonctionnent pas :
1. Vérifiez que le serveur email est démarré : `ps aux | grep email-server`
2. Vérifiez les logs : `tail -f server/logs/email-server.log`
3. Vérifiez que `VITE_EMAIL_SERVER_URL` est correctement configuré
4. Testez `/health` pour vérifier que le serveur répond

Pour plus de détails, consultez `HOSTINGER_SETUP.md`

