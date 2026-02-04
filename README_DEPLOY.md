# 🚀 Configuration Hostinger - Instructions pour l'IA

## 📋 Configuration requise

### 1. Build Command
```bash
npm install && npm run build
```

### 2. Variables d'environnement Frontend
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com
VITE_EMAIL_FROM_NAME=GereTonDjai
VITE_EMAIL_SERVER_URL=https://depense-facile-production.up.railway.app
```

### 3. Créer le dossier `server/` et le fichier `.env`

**⚠️ Si le dossier `server/` n'apparaît pas après le push GitHub :**

1. Dans **File Manager** sur Hostinger, créez un nouveau dossier nommé `server`
2. Dans ce dossier, créez un fichier `.env` avec ce contenu :
```
EMAIL_FROM=contact@xn--gretondjai-z6a.com
EMAIL_FROM_NAME=GereTonDjai
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@xn--gretondjai-z6a.com
SMTP_PASSWORD=LE_VRAI_MDP_DE_CETTE_BOITE
EMAIL_SERVER_PORT=3001
NODE_ENV=production
```

3. **Copiez aussi ces fichiers** dans le dossier `server/` depuis votre projet local :
   - `server/email-server.js`
   - `server/package.json`

4. **Installer les dépendances et démarrer le serveur** :

   **Solution la plus simple : Utiliser le gestionnaire Node.js de Hostinger**
   
   1. Allez dans **Node.js** dans hPanel
   2. Cliquez sur **"Créer une application"** ou **"Add Application"**
   3. Configurez :
      - **Nom** : `email-server`
      - **Dossier** : `server/` (ou le chemin complet vers le dossier server)
      - **Version Node.js** : `20.x` (ou la plus récente)
      - **Start Command** : `node email-server.js`
      - **Port** : `3001`
   4. **Variables d'environnement** : Ajoutez toutes les variables du fichier `server/.env` :
      - `EMAIL_FROM=contact@xn--gretondjai-z6a.com`
      - `EMAIL_FROM_NAME=GereTonDjai`
      - `SMTP_HOST=smtp.hostinger.com`
      - `SMTP_PORT=587`
      - `SMTP_USER=contact@xn--gretondjai-z6a.com`
      - `SMTP_PASSWORD=LE_VRAI_MDP_DE_CETTE_BOITE`
      - `EMAIL_SERVER_PORT=3001`
      - `NODE_ENV=production`
   5. Cliquez sur **"Créer"** ou **"Create"**
   
   **Hostinger va automatiquement :**
   - Installer les dépendances (`npm install`)
   - Démarrer le serveur
   - Le maintenir actif

### 4. Démarrer le serveur email (Cron Job)
- **Commande** : `cd /home/votre-utilisateur/public_html/server && node email-server.js > /dev/null 2>&1 &`
- **Fréquence** : `@reboot`

### 5. Configuration Reverse Proxy Hostinger

**⚠️ IMPORTANT : Hostinger utilise un reverse proxy !**

1. Dans les **Variables d'environnement**, utilisez :
   ```
   VITE_EMAIL_SERVER_URL=https://depense-facile-production.up.railway.app
   ```
   (SANS le port 3001, utilise le domaine principal qui fonctionne)

2. Dans hPanel, allez dans **Sites Web** → **Gérer** → **Avancé** → **Node.js**
3. Créez/Configurez l'application Node.js :
   - **Chemin** : `server/`
   - **Fichier d'entrée** : `email-server.js`
   - **Port interne** : `3001` (dans le code, pas dans l'URL publique)
   - Ajoutez toutes les variables d'environnement du fichier `server/.env`
4. Redémarrez l'application

### 6. Vérification
- Frontend : `https://geretondjai.com`
- Serveur email : `https://geretondjai.com/health` → `{"status":"ok","service":"email-server"}`
- Endpoint email : `https://geretondjai.com/api/send-email` (appelé automatiquement par le frontend)

