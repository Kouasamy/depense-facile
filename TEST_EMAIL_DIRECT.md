# 🔍 Test Direct - Pourquoi les emails ne partent pas

## ⚠️ Diagnostic étape par étape

### Étape 1 : Vérifier que le serveur Node.js est démarré

**Dans hPanel :**
1. Allez dans **Sites Web** → **Gérer** → **Avancé** → **Node.js**
2. Vérifiez qu'une application existe
3. Vérifiez son statut : **Running** ou **Stopped** ?

**Si l'application n'existe pas ou est arrêtée :**
- Créez-la ou démarrez-la
- Vérifiez les logs pour voir les erreurs

### Étape 2 : Tester le serveur directement

**Test 1 : Health check**
Ouvrez dans votre navigateur :
```
https://xn--gretondjai-z6a.com/health
```

**Résultat attendu :** `{"status":"ok","service":"email-server"}`

**Si ça ne fonctionne pas :**
- Le serveur n'est pas démarré
- OU le reverse proxy n'est pas configuré
- OU le domaine Punycode n'est pas accessible

**Test 2 : Test direct avec curl (dans la console du navigateur)**

Ouvrez la console (F12) et exécutez :

```javascript
fetch('https://xn--gretondjai-z6a.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'votre@email.com',
    subject: 'Test Email',
    html: '<h1>Test</h1><p>Ceci est un test</p>'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Réponse du serveur:', data)
  if (data.success) {
    console.log('✅ Email envoyé avec succès!')
  } else {
    console.error('❌ Erreur:', data.error)
  }
})
.catch(error => {
  console.error('❌ Erreur réseau:', error)
})
```

**Résultats possibles :**

✅ **Si vous voyez `{"success": true}`** → Le serveur fonctionne, le problème vient du frontend

❌ **Si vous voyez une erreur réseau** → Le serveur n'est pas accessible

❌ **Si vous voyez `{"success": false, "error": "..."}`** → Erreur SMTP (voir les détails)

### Étape 3 : Vérifier les logs du serveur Node.js

**Dans hPanel → Node.js → Votre application → Logs**

**Cherchez ces messages :**

✅ **Si vous voyez :**
```
🚀 Serveur email démarré sur 0.0.0.0:3001
📧 Configuration SMTP: {...}
✅ Connexion SMTP vérifiée avec succès!
```
→ Le serveur fonctionne

❌ **Si vous voyez :**
```
❌ SMTP non configuré
```
→ Le fichier `server/.env` n'est pas lu ou n'existe pas

❌ **Si vous voyez :**
```
❌ Erreur d'authentification SMTP
Invalid login: 535 5.7.8 Error: authentication failed
```
→ `SMTP_USER` ou `SMTP_PASSWORD` est incorrect

❌ **Si vous voyez :**
```
❌ Impossible de se connecter au serveur SMTP
```
→ Problème de connexion réseau ou `SMTP_HOST` incorrect

### Étape 4 : Vérifier la console du navigateur lors de l'inscription

1. Allez sur `https://xn--gretondjai-z6a.com` (ou `https://geretondjai.com`)
2. Ouvrez la console (F12 → Console)
3. Inscrivez-vous avec un email
4. Regardez les messages

**Messages à chercher :**

✅ **Si vous voyez :**
```
✅ Email service configured (SMTP Hostinger): {...}
📧 Sending email via SMTP Hostinger to: ...
✅ Email sent successfully via SMTP! Message ID: ...
```
→ Le frontend envoie bien, vérifiez votre boîte mail

❌ **Si vous voyez :**
```
⚠️ Email service not configured for production...
```
→ `VITE_EMAIL_SERVER_URL` n'est pas dans `.env` ou n'est pas chargé

❌ **Si vous voyez :**
```
❌ Email send failed
Le serveur email n'est pas accessible
```
→ Le serveur Node.js n'est pas démarré ou l'URL est incorrecte

❌ **Si vous voyez :**
```
❌ Error sending email: Failed to fetch
```
→ Erreur réseau (CORS, serveur inaccessible, etc.)

### Étape 5 : Vérifier les fichiers .env sur Hostinger

**Dans File Manager :**

1. **Fichier `.env` à la racine** doit contenir :
```
VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com
VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com
VITE_EMAIL_FROM_NAME=GereTonDjai
```

2. **Fichier `server/.env`** doit contenir :
```
EMAIL_FROM=contact@xn--gretondjai-z6a.com
EMAIL_FROM_NAME=GereTonDjai
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@xn--gretondjai-z6a.com
SMTP_PASSWORD=15044245Fd@
EMAIL_SERVER_PORT=3001
NODE_ENV=production
```

**⚠️ Important :**
- Les fichiers doivent s'appeler `.env` (avec le point au début)
- Pas d'espaces avant ou après le `=`
- Pas de guillemets autour des valeurs

### Étape 6 : Vérifier que l'email existe dans Hostinger

1. Allez dans **hPanel** → **Email** ou **Mailboxes**
2. Vérifiez que l'email `contact@xn--gretondjai-z6a.com` existe
3. Vérifiez que le mot de passe est bien `15044245Fd@`

## 🆘 Solutions selon le problème

### Problème : Le serveur ne démarre pas

**Solution :**
1. Vérifiez que Node.js est disponible dans hPanel
2. Vérifiez que le dossier `server/` existe
3. Vérifiez que `email-server.js` et `package.json` sont dans `server/`
4. Vérifiez les logs dans hPanel pour voir l'erreur exacte

### Problème : Erreur d'authentification SMTP

**Solution :**
1. Vérifiez que `SMTP_USER` et `SMTP_PASSWORD` sont corrects
2. Essayez de vous connecter manuellement à la boîte mail pour vérifier le mot de passe
3. Vérifiez que l'email existe dans Hostinger

### Problème : Le frontend n'appelle pas le backend

**Solution :**
1. Vérifiez que `VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com` est dans `.env` à la racine
2. **Redéployez le frontend** (rebuild) pour que les variables soient prises en compte
3. Vérifiez la console du navigateur pour voir les erreurs

### Problème : Le domaine Punycode n'est pas accessible

**Solution :**
- Essayez avec `https://geretondjai.com` au lieu de `https://xn--gretondjai-z6a.com`
- Mettez à jour `VITE_EMAIL_SERVER_URL` avec l'URL qui fonctionne

## 📝 Informations à me donner

Pour que je puisse vous aider, donnez-moi :

1. **Le résultat du test `/health`** : `https://xn--gretondjai-z6a.com/health`
2. **Le résultat du test direct** (code JavaScript dans la console)
3. **Les logs du serveur Node.js** (copiez les dernières lignes)
4. **Les messages dans la console du navigateur** quand vous vous inscrivez
5. **Le statut de l'application Node.js** dans hPanel (Running/Stopped/Error)

