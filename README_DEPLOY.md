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
VITE_EMAIL_FROM=contact@gèretondjai.com
VITE_EMAIL_FROM_NAME=GèreTonDjai-CI
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

### 3. Créer le dossier `server/` et le fichier `.env`

**⚠️ Si le dossier `server/` n'apparaît pas après le push GitHub :**

1. Dans **File Manager** sur Hostinger, créez un nouveau dossier nommé `server`
2. Dans ce dossier, créez un fichier `.env` avec ce contenu :
```
EMAIL_FROM=contact@gèretondjai.com
EMAIL_FROM_NAME=GèreTonDjai-CI
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@gèretondjai.com
SMTP_PASSWORD=15044245Fd@
EMAIL_SERVER_PORT=3001
NODE_ENV=production
```

3. **Copiez aussi ces fichiers** dans le dossier `server/` depuis votre projet local :
   - `server/email-server.js`
   - `server/package.json`

### 4. Démarrer le serveur email (Cron Job)
- **Commande** : `cd /home/votre-utilisateur/public_html/server && node email-server.js > /dev/null 2>&1 &`
- **Fréquence** : `@reboot`

### 5. Vérification
- Frontend : `https://geretondjai.com`
- Serveur email : `https://geretondjai.com:3001/health` → `{"status":"ok","service":"email-server"}`

