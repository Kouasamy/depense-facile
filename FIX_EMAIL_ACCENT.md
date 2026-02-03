# 🔧 Correction : Email avec accent invalide

## ❌ Problème identifié

1. **L'email `contact@gèretondjai.com` n'existe pas** dans Hostinger
2. **Le domaine avec accent (`gèretondjai.com`) est invalide** pour SMTP

## ✅ Solution

### Option 1 : Utiliser un email existant dans Hostinger (Recommandé)

1. **Créez un email valide** dans Hostinger (sans accent dans le domaine) :
   - Exemple : `contact@geretondjai.com` (sans accent)
   - OU : `noreply@geretondjai.com`
   - OU : `info@geretondjai.com`

2. **Mettez à jour les variables d'environnement** :

   **Dans `server/.env` sur Hostinger :**
   ```
   EMAIL_FROM=contact@geretondjai.com
   SMTP_USER=contact@geretondjai.com
   SMTP_PASSWORD=votre_mot_de_passe
   ```

   **Dans les Variables d'environnement frontend :**
   ```
   VITE_EMAIL_FROM=contact@geretondjai.com
   ```

### Option 2 : Utiliser le format Punycode (si le domaine avec accent existe)

Si vous devez absolument utiliser `gèretondjai.com`, utilisez le format Punycode :

**Dans `server/.env` :**
```
EMAIL_FROM=contact@gèretondjai.com
SMTP_USER=contact@xn--gretondjai-z6a.com
SMTP_PASSWORD=votre_mot_de_passe
```

**Note :** Le code convertit automatiquement, mais vous pouvez forcer le format Punycode dans `SMTP_USER`.

## 📋 Étapes à suivre

1. **Créez un email valide** dans Hostinger (sans accent dans le domaine)
2. **Mettez à jour `server/.env`** sur Hostinger avec le nouvel email
3. **Mettez à jour les variables d'environnement frontend** dans Hostinger
4. **Redémarrez l'application Node.js** dans hPanel
5. **Testez l'inscription** à nouveau

## ⚠️ Important

- L'email utilisé dans `SMTP_USER` **DOIT exister** dans Hostinger
- Le domaine **NE DOIT PAS avoir d'accent** pour SMTP (utilisez Punycode si nécessaire)
- Le mot de passe **DOIT être celui de la boîte mail** créée dans Hostinger

