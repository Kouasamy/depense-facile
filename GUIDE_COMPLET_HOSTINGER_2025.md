# 🚀 Guide Complet - Déploiement Email sur Hostinger 2025

## 📋 Étape par étape depuis le début

### ÉTAPE 1 : Vérifier que votre code est sur GitHub

1. Assurez-vous que votre code est bien pushé sur GitHub
2. Le dossier `server/` doit être dans votre repository

### ÉTAPE 2 : Connecter GitHub à Hostinger

1. Connectez-vous à **hPanel** (le nouveau panel Hostinger)
2. Allez dans **"Websites"** ou **"Gestionnaire de fichiers"**
3. Cherchez **"Git"** ou **"Déploiement automatique"**
4. Connectez votre repository GitHub
5. Configurez le **Build Command** : `npm install && npm run build`

### ÉTAPE 3 : Créer le dossier `server/` sur Hostinger

**Méthode A : Si le dossier apparaît après le déploiement**
- Attendez que le déploiement se termine
- Le dossier `server/` devrait apparaître dans File Manager

**Méthode B : Si le dossier n'apparaît pas (création manuelle)**
1. Allez dans **File Manager** dans hPanel
2. À la **racine** de votre site (même niveau que `package.json`)
3. Cliquez sur **"Nouveau dossier"** ou **"Create Folder"**
4. Nommez-le : `server`
5. Ouvrez le dossier `server/`

### ÉTAPE 4 : Créer les fichiers dans `server/`

Dans le dossier `server/`, créez ces fichiers :

#### Fichier 1 : `.env`

1. Cliquez sur **"Nouveau fichier"** ou **"Create File"**
2. Nommez-le exactement : `.env`
3. Collez ce contenu :
```
EMAIL_FROM=contact@gèretondjai.com
EMAIL_FROM_NAME=GèreTonDjai-CI
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@gèretondjai.com
SMTP_PASSWORD=15044245Fd@
EMAIL_SERVER_PORT=3001
NODE_ENV=production
```
4. **IMPORTANT** : Remplacez `15044245Fd@` par votre **vrai mot de passe** de la boîte mail Hostinger
5. Sauvegardez

#### Fichier 2 : `email-server.js`

1. Créez un nouveau fichier : `email-server.js`
2. Copiez le contenu depuis votre projet local : `server/email-server.js`
3. Sauvegardez

#### Fichier 3 : `package.json`

1. Créez un nouveau fichier : `package.json`
2. Collez ce contenu :
```json
{
  "name": "email-server",
  "version": "1.0.0",
  "description": "Serveur backend pour l'envoi d'emails via SMTP Hostinger",
  "type": "module",
  "main": "email-server.js",
  "scripts": {
    "start": "node email-server.js",
    "dev": "node email-server.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "cors": "^2.8.5",
    "nodemailer": "^6.9.16",
    "dotenv": "^16.4.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```
3. Sauvegardez

### ÉTAPE 5 : Configurer les variables d'environnement du frontend

Dans hPanel Hostinger 2025 :

1. Allez dans **"Websites"** → Votre site → **"Paramètres"** ou **"Settings"**
2. Cherchez **"Variables d'environnement"** ou **"Environment Variables"**
3. Ajoutez ces variables une par une :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
VITE_EMAIL_FROM=contact@gèretondjai.com
VITE_EMAIL_FROM_NAME=GèreTonDjai-CI
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

**⚠️ IMPORTANT** : Remplacez `votre_url_supabase` et `votre_cle_supabase` par vos vraies valeurs Supabase

### ÉTAPE 6 : Démarrer le serveur email

**Option A : Via le gestionnaire Node.js (si disponible)**

1. Dans hPanel, cherchez **"Node.js"** ou **"Applications"** ou **"Node.js Manager"**
2. Si vous le trouvez :
   - Cliquez sur **"Créer une application"** ou **"Add Application"**
   - **Nom** : `email-server`
   - **Dossier** : `server/` (ou le chemin complet)
   - **Version Node.js** : `20.x`
   - **Start Command** : `node email-server.js`
   - **Port** : `3001`
   - Ajoutez toutes les variables d'environnement du fichier `server/.env`
   - Cliquez sur **"Créer"**

**Option B : Via Railway (GRATUIT - Si Node.js n'est pas disponible)**

Si vous ne trouvez pas Node.js dans Hostinger :

1. Allez sur https://railway.app
2. Créez un compte (gratuit) avec GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Sélectionnez votre repository
5. Configurez :
   - **Root Directory** : `server`
   - **Start Command** : `node email-server.js`
6. Ajoutez les variables d'environnement (mêmes que dans `server/.env`)
7. Railway génère une URL (ex: `https://email-server.up.railway.app`)
8. Dans Hostinger, changez `VITE_EMAIL_SERVER_URL` avec cette URL Railway

**Option C : Via Cron Job (si SSH disponible)**

1. Allez dans **"Cron Jobs"** dans hPanel
2. Créez un nouveau cron job :
   - **Commande** : `cd /home/votre-utilisateur/public_html/server && /usr/bin/node email-server.js > /dev/null 2>&1 &`
   - **Fréquence** : `@reboot`

### ÉTAPE 7 : Vérifier que tout fonctionne

1. **Testez le serveur email** :
   - Ouvrez : `https://geretondjai.com:3001/health`
   - Devrait retourner : `{"status":"ok","service":"email-server"}`
   - Si ça ne fonctionne pas → Le serveur n'est pas démarré ou le port n'est pas accessible

2. **Testez l'inscription** :
   - Allez sur votre site
   - Inscrivez-vous avec un email
   - Ouvrez la **console du navigateur** (F12)
   - Regardez les messages :
     - ✅ `📧 Sending welcome email to: votre@email.com` → Le frontend essaie d'envoyer
     - ✅ `✅ Welcome email sent successfully` → L'email a été envoyé
     - ❌ `⚠️ Email service not configured` → `VITE_EMAIL_SERVER_URL` n'est pas configuré
     - ❌ `❌ Email send failed` → Le serveur ne répond pas

3. **Vérifiez votre boîte mail** :
   - Vérifiez aussi les **spams**
   - L'email devrait arriver dans quelques secondes

### ÉTAPE 8 : Dépannage

**Problème : Le port 3001 n'est pas accessible**

Solution : Utilisez Railway (Option B de l'Étape 6) - C'est plus simple et gratuit

**Problème : "Email service not configured"**

Vérifiez que `VITE_EMAIL_SERVER_URL` est bien configuré dans les variables d'environnement

**Problème : "SMTP authentication failed"**

1. Vérifiez que le mot de passe dans `server/.env` est correct
2. Vérifiez que `SMTP_USER` est votre adresse email complète
3. Vérifiez les logs du serveur pour voir l'erreur exacte

**Problème : Aucun email n'arrive**

1. Vérifiez les spams
2. Vérifiez les logs du serveur email
3. Testez l'envoi d'email depuis Hostinger directement pour vérifier que la boîte mail fonctionne

## ✅ Checklist finale

- [ ] Dossier `server/` créé sur Hostinger
- [ ] Fichier `server/.env` créé avec le bon mot de passe
- [ ] Fichiers `email-server.js` et `package.json` dans `server/`
- [ ] Variables d'environnement frontend configurées
- [ ] Serveur email démarré (Node.js, Railway, ou Cron Job)
- [ ] Test `/health` fonctionne
- [ ] Test d'inscription envoie l'email

## 🆘 Si rien ne fonctionne

1. **Utilisez Railway** (Option B) - C'est la solution la plus simple et fiable
2. **Vérifiez les logs** du serveur pour voir les erreurs exactes
3. **Testez la connexion SMTP** directement depuis Hostinger pour vérifier que la boîte mail fonctionne

