# 🔧 Correction du fichier .env pour la production

## ❌ Problèmes identifiés dans votre .env

1. **`VITE_EMAIL_SERVER_URL=http://localhost:3001`** → ❌ Incorrect pour la production
2. **Emails avec accent** `contact@gèretondjai.com` → ❌ Doit être en Punycode
3. **`VITE_EMAIL_FROM_NAME=GèreTonDjai`** → Devrait être `GèreTonDjai-CI`

## ✅ Configuration correcte pour la production

### Fichier `.env` (racine du projet)

```env
# ============================================
# VARIABLES FRONTEND (avec préfixe VITE_)
# ============================================

# Supabase
VITE_SUPABASE_URL=https://xghetfduattzfcladnzm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGV0ZmR1YXR0emZjbGFkbnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDMwNjksImV4cCI6MjA4NTYxOTA2OX0.4tO-TxfLxKDU9zdnkBnA7bgYRryB7v3O7ViSdm_DJxI

# Email - Frontend
# IMPORTANT : Utilisez le format Punycode
VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com
VITE_EMAIL_FROM_NAME=GèreTonDjai-CI
# IMPORTANT : En production, utilisez le domaine sans port (Hostinger reverse proxy)
VITE_EMAIL_SERVER_URL=https://geretondjai.com

# ============================================
# VARIABLES BACKEND (sans préfixe VITE_)
# ============================================

# Email expéditeur
# IMPORTANT : Utilisez le format Punycode
EMAIL_FROM=contact@xn--gretondjai-z6a.com
EMAIL_FROM_NAME=GèreTonDjai-CI

# Configuration SMTP Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
# IMPORTANT : Utilisez le format Punycode pour SMTP_USER
SMTP_USER=contact@xn--gretondjai-z6a.com
SMTP_PASSWORD=15044245Fd@

# Port du serveur email
EMAIL_SERVER_PORT=3001

# Environnement
NODE_ENV=production
```

### Fichier `server/.env` (dans le dossier server/)

```env
# Email expéditeur
EMAIL_FROM=contact@xn--gretondjai-z6a.com
EMAIL_FROM_NAME=GèreTonDjai-CI

# Configuration SMTP Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@xn--gretondjai-z6a.com
SMTP_PASSWORD=15044245Fd@

# Port du serveur email
EMAIL_SERVER_PORT=3001

# Environnement
NODE_ENV=production
```

## 🔑 Points importants

### 1. Format Punycode obligatoire

**❌ INCORRECT :**
```env
VITE_EMAIL_FROM=contact@gèretondjai.com
SMTP_USER=contact@gèretondjai.com
```

**✅ CORRECT :**
```env
VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com
SMTP_USER=contact@xn--gretondjai-z6a.com
```

### 2. URL du serveur email en production

**❌ INCORRECT :**
```env
VITE_EMAIL_SERVER_URL=http://localhost:3001
```

**✅ CORRECT :**
```env
VITE_EMAIL_SERVER_URL=https://geretondjai.com
```

**Pourquoi ?** Hostinger utilise un reverse proxy. Le serveur Node.js écoute sur le port 3001 en interne, mais est accessible publiquement via `https://geretondjai.com/api/send-email` (sans port).

### 3. Variables d'environnement dans Hostinger

Après avoir modifié le fichier `.env` localement :

1. **Pushez le code sur GitHub**
2. **Dans Hostinger**, allez dans **Variables d'environnement**
3. **Ajoutez/modifiez** ces variables :
   - `VITE_EMAIL_FROM=contact@xn--gretondjai-z6a.com`
   - `VITE_EMAIL_FROM_NAME=GèreTonDjai-CI`
   - `VITE_EMAIL_SERVER_URL=https://geretondjai.com`
   - `EMAIL_FROM=contact@xn--gretondjai-z6a.com`
   - `EMAIL_FROM_NAME=GèreTonDjai-CI`
   - `SMTP_HOST=smtp.hostinger.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=contact@xn--gretondjai-z6a.com`
   - `SMTP_PASSWORD=15044245Fd@`
   - `EMAIL_SERVER_PORT=3001`
   - `NODE_ENV=production`

4. **Redéployez** l'application

## 📝 Checklist

- [ ] `.env` à la racine utilise le format Punycode
- [ ] `VITE_EMAIL_SERVER_URL=https://geretondjai.com` (sans port)
- [ ] `server/.env` utilise le format Punycode
- [ ] Variables d'environnement configurées dans Hostinger
- [ ] Application redéployée

