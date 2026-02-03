# 🔍 Diagnostic Rapide - Email ne fonctionne pas

## Test 1 : Vérifier la console du navigateur

1. Allez sur votre site : `https://geretondjai.com`
2. Ouvrez la **console du navigateur** (F12 ou Clic droit → Inspecter → Console)
3. Inscrivez-vous avec un email
4. Regardez les messages dans la console

### Messages à chercher :

**✅ Si vous voyez :**
```
✅ Email service configured (SMTP Hostinger): {...}
📧 Sending welcome email to: votre@email.com
✅ Welcome email sent successfully
```
→ Le frontend fonctionne, l'email devrait être envoyé

**❌ Si vous voyez :**
```
⚠️ Email service not configured for production. Définissez VITE_EMAIL_SERVER_URL...
```
→ **PROBLÈME** : `VITE_EMAIL_SERVER_URL` n'est pas configuré dans Hostinger

**❌ Si vous voyez :**
```
❌ Email send failed
Le serveur email n'est pas accessible
```
→ **PROBLÈME** : Le serveur email n'est pas démarré ou n'est pas accessible

## Test 2 : Vérifier le serveur email

Ouvrez dans votre navigateur :
```
https://geretondjai.com:3001/health
```

**✅ Si ça retourne :** `{"status":"ok","service":"email-server"}`
→ Le serveur fonctionne

**❌ Si ça ne fonctionne pas :**
→ Le serveur n'est pas démarré OU le port 3001 n'est pas accessible

## Test 3 : Vérifier les variables d'environnement

Dans hPanel Hostinger :

1. Allez dans **"Websites"** → Votre site → **"Paramètres"**
2. Cherchez **"Variables d'environnement"**
3. Vérifiez que vous avez :
   - `VITE_EMAIL_SERVER_URL` = `https://geretondjai.com:3001`
   - `VITE_EMAIL_FROM` = `contact@gèretondjai.com`
   - `VITE_EMAIL_FROM_NAME` = `GèreTonDjai-CI`

**Si elles n'existent pas** → Ajoutez-les

## Test 4 : Vérifier le fichier server/.env

Dans File Manager sur Hostinger :

1. Allez dans le dossier `server/`
2. Ouvrez le fichier `.env`
3. Vérifiez que vous avez :
   ```
   SMTP_PORT=587
   SMTP_USER=contact@gèretondjai.com
   SMTP_PASSWORD=votre_vrai_mot_de_passe
   ```

**Si le fichier n'existe pas** → Créez-le (voir GUIDE_COMPLET_HOSTINGER_2025.md)

## Solutions selon le problème

### Problème : "Email service not configured"
**Solution :** Ajoutez `VITE_EMAIL_SERVER_URL` dans les variables d'environnement de Hostinger

### Problème : Le port 3001 n'est pas accessible
**Solution :** Utilisez Railway pour déployer le serveur email (gratuit) - Voir GUIDE_COMPLET_HOSTINGER_2025.md Étape 6 Option B

### Problème : Le serveur ne démarre pas
**Solution :** 
- Si Node.js est disponible : Créez une application Node.js dans hPanel
- Si Node.js n'est pas disponible : Utilisez Railway

### Problème : "SMTP authentication failed"
**Solution :** Vérifiez que le mot de passe dans `server/.env` est correct

## Solution rapide : Utiliser Railway

Si rien ne fonctionne, la solution la plus simple est Railway :

1. Allez sur https://railway.app (gratuit)
2. Créez un compte avec GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Root Directory : `server`
5. Start Command : `node email-server.js`
6. Ajoutez les variables d'environnement
7. Railway génère une URL → Utilisez-la pour `VITE_EMAIL_SERVER_URL`

C'est la solution la plus fiable et la plus simple !

