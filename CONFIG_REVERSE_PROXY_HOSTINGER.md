# 🔧 Configuration Reverse Proxy Hostinger

## ✅ Solution Hostinger : Reverse Proxy

Hostinger utilise un reverse proxy, donc **pas besoin du port 3001** dans l'URL publique !

## 📋 Modifications à faire

### 1. Mettre à jour VITE_EMAIL_SERVER_URL

Dans les **Variables d'environnement** de Hostinger, changez :

**AVANT :**
```
VITE_EMAIL_SERVER_URL=https://geretondjai.com:3001
```

**APRÈS :**
```
VITE_EMAIL_SERVER_URL=https://geretondjai.com
```

### 2. Vérifier la configuration Node.js sur Hostinger

Dans hPanel Hostinger :

1. Allez dans **Sites Web** → **Gérer** → **Avancé** → **Node.js**
2. Vérifiez que votre application Node.js est configurée :
   - **Chemin** : `server/` (ou le chemin complet vers le dossier server)
   - **Fichier d'entrée** : `email-server.js`
   - **Version Node.js** : `22.x` (ou la plus récente)
   - **Port interne** : `3001` (dans votre code, pas dans l'URL publique)
   - **Variables d'environnement** : Toutes les variables du fichier `server/.env`
3. Cliquez sur **"Redémarrer l'application"**

### 3. Endpoints disponibles

Votre serveur email expose ces endpoints :

- **Health check** : `GET /health`
  - Test : `https://geretondjai.com/health`
  - Devrait retourner : `{"status":"ok","service":"email-server"}`

- **Envoyer email** : `POST /api/send-email`
  - Le frontend appelle automatiquement : `https://geretondjai.com/api/send-email`

### 4. Configuration SMTP (déjà correcte)

Votre code utilise déjà la bonne configuration :
- Port SMTP : `587` (TLS) ✅
- Host : `smtp.hostinger.com` ✅
- Authentification : Username/Password ✅

## ✅ Vérification

1. **Testez le health check** :
   ```
   https://geretondjai.com/health
   ```
   Devrait retourner : `{"status":"ok","service":"email-server"}`

2. **Testez l'inscription** :
   - Allez sur votre site
   - Inscrivez-vous
   - Vérifiez la console du navigateur (F12)
   - Vous devriez voir : `✅ Welcome email sent successfully`

3. **Vérifiez votre boîte mail** :
   - L'email devrait arriver dans quelques secondes
   - Vérifiez aussi les spams

## 🆘 Si ça ne fonctionne pas

### Problème : `/health` ne fonctionne pas

**Solution :** Vérifiez que :
- L'application Node.js est bien démarrée dans hPanel
- Le chemin est correct (`server/`)
- Le fichier d'entrée est `email-server.js`

### Problème : "Email send failed"

**Solution :** Vérifiez les logs de l'application Node.js dans hPanel pour voir l'erreur exacte

### Problème : Le serveur ne démarre pas

**Solution :** 
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que `package.json` est dans le dossier `server/`
- Vérifiez les logs dans hPanel

## 📝 Résumé

✅ **VITE_EMAIL_SERVER_URL** = `https://geretondjai.com` (sans port)  
✅ **Port interne** = `3001` (dans le code, pas dans l'URL)  
✅ **Endpoint** = `/api/send-email` (déjà configuré dans le code)  
✅ **Reverse proxy** = Géré automatiquement par Hostinger

