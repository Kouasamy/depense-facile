# 🔧 Mise à jour des variables d'environnement sur Hostinger

## ❌ Variable à corriger

Votre variable `VITE_EMAIL_SERVER_URL` est actuellement :
```
VITE_EMAIL_SERVER_URL=https://geretondjai.com
```

## ✅ Valeur correcte

Elle doit être :
```
VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com/api
```

## 📋 Variables d'environnement complètes (à mettre sur Hostinger)

```
VITE_SUPABASE_URL=https://xghetfduattzfcladnzm.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGV0ZmR1YXR0emZjbGFkbnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDMwNjksImV4cCI6MjA4NTYxOTA2OX0.4tO-TxfLxKDU9zdnkBnA7bgYRryB7v3O7ViSdm_DJxI

VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com

VITE_EMAIL_FROM_NAME=GereTonDjai

VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com/api
```

## 🚀 Étapes à suivre

1. **Dans hPanel → Variables d'environnement**, modifiez :
   - `VITE_EMAIL_SERVER_URL` : Changez de `https://geretondjai.com` à `https://xn--gretondjai-z6a.com/api`

2. **Redéployez le frontend** (c'est crucial !)
   - Les variables `VITE_*` sont intégrées au moment du build
   - Vous devez rebuild et redéployer pour que les changements soient pris en compte

3. **Videz le cache du navigateur**
   - `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

4. **Testez à nouveau l'inscription**

## ⚠️ Important

Après avoir modifié `VITE_EMAIL_SERVER_URL`, le frontend appellera maintenant :
- ✅ `https://xn--gretondjai-z6a.com/api/send-email` (correct)
- ❌ Au lieu de `https://geretondjai.com/api/send-email` (ancien)

