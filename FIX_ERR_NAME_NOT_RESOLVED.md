# 🔧 Solution : ERR_NAME_NOT_RESOLVED

## ❌ Problème identifié

L'erreur `POST https://geretondjai.com/api/send-email net::ERR_NAME_NOT_RESOLVED` signifie que :

1. **Le frontend utilise encore l'ancienne URL** `https://geretondjai.com` au lieu de `https://xn--gretondjai-z6a.com`
2. **OU** le fichier `.env` n'a pas été mis à jour sur Hostinger
3. **OU** le frontend n'a pas été redéployé après la mise à jour du `.env`

## ✅ Solution

### Option 1 : Utiliser le domaine sans accent (RECOMMANDÉ)

Si `https://geretondjai.com` fonctionne pour votre site principal, utilisez cette URL au lieu du Punycode.

**Sur Hostinger, dans File Manager :**

1. **Fichier `.env` à la racine**, remplacez :
```
VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com
```

Par :
```
VITE_EMAIL_SERVER_URL=https://geretondjai.com
```

2. **Redéployez le frontend** (rebuild) pour que les nouvelles variables soient prises en compte

### Option 2 : Vérifier que le domaine Punycode fonctionne

Testez d'abord si le domaine Punycode est accessible :

```
https://xn--gretondjai-z6a.com
```

**Si ça ne fonctionne pas :** Utilisez l'Option 1 (domaine sans accent)

**Si ça fonctionne :** Vérifiez que le fichier `.env` contient bien :
```
VITE_EMAIL_SERVER_URL=https://xn--gretondjai-z6a.com
```

## 📋 Checklist

- [ ] Le fichier `.env` à la racine sur Hostinger contient `VITE_EMAIL_SERVER_URL=https://geretondjai.com` (ou le domaine qui fonctionne)
- [ ] Le frontend a été **redéployé** (rebuild) après la mise à jour du `.env`
- [ ] Le serveur Node.js est démarré dans hPanel → Node.js
- [ ] Le test `/health` fonctionne : `https://geretondjai.com/health`

## 🚀 Étapes à suivre

1. **Mettre à jour le fichier `.env` sur Hostinger** avec la bonne URL
2. **Redéployer le frontend** (c'est crucial !)
3. **Tester à nouveau l'inscription**

## ⚠️ Important

**Le frontend doit être redéployé après chaque modification du fichier `.env`** car les variables `VITE_*` sont intégrées au moment du build, pas au runtime.

Si vous modifiez `.env` sans redéployer, le frontend continuera d'utiliser l'ancienne URL.

