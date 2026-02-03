# ⚡ Solution Rapide : Emails ne fonctionnent pas en production

## 🔴 Problème
Quand vous vous inscrivez sur le site hébergé, vous ne recevez pas d'email.

## ✅ Solution : Déployer le serveur email sur Hostinger

Puisque vous hébergez déjà sur Hostinger, déployons le serveur email sur le même hébergeur.

### Option A : Via le Panel Hostinger (Hébergement Web - Le plus simple)

1. **Accédez au File Manager** dans votre panel Hostinger
2. **Créez un dossier `email-server`** à la racine de votre site
3. **Uploadez ces fichiers** dans ce dossier :
   - `server/email-server.js`
   - `server/package.json`
4. **Allez dans "Node.js"** dans votre panel Hostinger
5. **Créez une nouvelle application Node.js** :
   - Sélectionnez le dossier `email-server`
   - Version Node.js : 20.x
   - Start Command : `node email-server.js`
   - Port : 3001
6. **Ajoutez les variables d'environnement** :
   - `EMAIL_FROM` = `contact@gèretondjai.com`
   - `EMAIL_FROM_NAME` = `GèreTonDjai`
   - `SMTP_HOST` = `smtp.hostinger.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `contact@gèretondjai.com`
   - `SMTP_PASSWORD` = `votre_mot_de_passe_mailbox`
   - `EMAIL_SERVER_PORT` = `3001`
   - `NODE_ENV` = `production`
7. **Démarrez l'application** (bouton "Start")
8. **Copiez l'URL générée** par Hostinger (ex: `https://email-server.geretondjai.com`)
9. **Dans les variables d'environnement de votre site**, ajoutez :
   ```
   VITE_EMAIL_SERVER_URL=https://email-server.geretondjai.com
   ```

### Option B : Via SSH (VPS Hostinger)

Si vous avez un VPS avec accès SSH, consultez `DEPLOY_HOSTINGER.md` pour les instructions détaillées.

---

## Alternative : Railway (si Hostinger ne supporte pas Node.js)

1. Allez sur https://railway.app et créez un compte
2. Cliquez sur "New Project" → "Deploy from GitHub repo"
3. Sélectionnez votre repository
4. Railway détecte automatiquement le projet
5. **Configurez les variables d'environnement** :
   - `EMAIL_FROM` = `contact@gèretondjai.com`
   - `EMAIL_FROM_NAME` = `GèreTonDjai`
   - `SMTP_HOST` = `smtp.hostinger.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `contact@gèretondjai.com`
   - `SMTP_PASSWORD` = `votre_mot_de_passe_hostinger`
   - `EMAIL_SERVER_PORT` = `3001`
   - `NODE_ENV` = `production`
6. **Changez le "Start Command"** : `node server/email-server.js`
7. Railway génère une URL (ex: `https://email-server-production.up.railway.app`)

### 2. Configurer le frontend

Dans les **variables d'environnement de production** de votre hébergeur frontend (Hostinger, Vercel, etc.) :

```
VITE_EMAIL_SERVER_URL=https://email-server-production.up.railway.app
```

### 3. Tester

1. Visitez `https://email-server-production.up.railway.app/health`
   - Devrait afficher : `{"status":"ok","service":"email-server"}`
2. Inscrivez-vous sur votre site en production
3. Vérifiez votre boîte mail !

## 🆘 Si ça ne marche toujours pas

1. **Vérifiez les logs Railway** : Onglet "Deployments" → Cliquez sur le déploiement → "View Logs"
2. **Vérifiez que `VITE_EMAIL_SERVER_URL` est bien configuré** dans votre frontend
3. **Testez le serveur** : Ouvrez la console du navigateur et regardez les erreurs

## 📝 Alternative : Railway ou Render.com

Si Hostinger ne supporte pas Node.js, utilisez Railway ou Render (gratuit) :

### Railway
1. Allez sur https://railway.app
2. Créez un nouveau projet depuis votre repo GitHub
3. Configurez les variables d'environnement (mêmes que ci-dessus)
4. Changez le "Start Command" : `node server/email-server.js`
5. Utilisez l'URL générée pour `VITE_EMAIL_SERVER_URL`

### Render
1. Créez un compte sur https://render.com
2. "New" → "Web Service"
3. Connectez votre repo GitHub
4. Configurez :
   - **Build Command** : `cd server && npm install`
   - **Start Command** : `cd server && node email-server.js`
5. Ajoutez les mêmes variables d'environnement
6. Utilisez l'URL générée pour `VITE_EMAIL_SERVER_URL`

## 📚 Guide détaillé

Pour plus de détails, consultez `DEPLOY_HOSTINGER.md`

