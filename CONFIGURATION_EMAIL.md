# 📧 Configuration Email - Local et Production

## ✅ Réponse Rapide

**OUI**, tu recevras un email de bienvenue que tu sois en **local** ou en **production (hébergé)**, à condition que la clé API Resend soit configurée.

---

## 🔧 Configuration Actuelle

### **En Local (Développement)**

1. **Fichier `.env`** doit contenir :
   ```env
   VITE_RESEND_API_KEY=re_2MLUE38i_GLsXv5MqjKgeYkzwz5XTdSrQ
   VITE_EMAIL_FROM=noreply@geretondjai.com
   VITE_EMAIL_FROM_NAME=GereTonDjai
   ```

2. **Redémarre le serveur** après modification :
   ```bash
   npm run dev
   ```

3. **Teste l'inscription** avec un email réel
4. **Vérifie ta boîte mail** (et les spams)

### **En Production (Hébergé sur Hostinger)**

1. **Fichier `.env.production`** doit contenir les mêmes variables :
   ```env
   VITE_RESEND_API_KEY=re_2MLUE38i_GLsXv5MqjKgeYkzwz5XTdSrQ
   VITE_EMAIL_FROM=noreply@geretondjai.com
   VITE_EMAIL_FROM_NAME=GereTonDjai
   ```

2. **OU configure dans Hostinger** :
   - Va dans cPanel Hostinger
   - Variables d'environnement
   - Ajoute les variables `VITE_RESEND_API_KEY`, etc.

3. **Rebuild l'application** :
   ```bash
   npm run build
   ```

4. **Uploade le dossier `dist`** sur Hostinger

---

## 📨 Quand l'Email est Envoyé

L'email de bienvenue est envoyé **automatiquement** :

1. ✅ **Lors de l'inscription** d'un nouvel utilisateur
2. ✅ **Immédiatement** après la création du compte
3. ✅ **Asynchrone** (ne bloque pas l'inscription)
4. ✅ **Si Resend est configuré** (sinon, un warning dans la console)

---

## 🔍 Comment Vérifier que ça Fonctionne

### **En Local**

1. **Ouvre la console du navigateur** (`F12` → Console)
2. **Crée un compte** avec un email réel
3. **Regarde les messages dans la console** :
   - ✅ `📧 Sending welcome email to: [ton email]`
   - ✅ `✅ Welcome email sent successfully`
   - ⚠️ `⚠️ Email service not configured` (si pas configuré)

4. **Vérifie ta boîte mail** (et les spams)

### **En Production**

1. **Crée un compte** sur le site hébergé
2. **Vérifie ta boîte mail** (peut prendre quelques secondes)
3. **Vérifie dans Resend Dashboard** :
   - Va sur [https://resend.com/emails](https://resend.com/emails)
   - Tu verras tous les emails envoyés avec leur statut

---

## ⚙️ Code qui Envoie l'Email

Dans `src/stores/authStore.ts` (lignes 217-234) :

```typescript
// Send welcome email IMMEDIATELY after successful registration
if (emailService.isConfigured()) {
  console.log('📧 Sending welcome email to:', email)
  emailService.sendWelcomeEmail(email, name)
    .then(result => {
      if (result.success) {
        console.log('✅ Welcome email sent successfully')
      } else {
        console.error('❌ Failed to send welcome email:', result.error)
      }
    })
}
```

**✅ L'email est envoyé automatiquement après chaque inscription réussie !**

---

## 🎯 Conditions pour Recevoir l'Email

### **✅ Ça fonctionne si :**

- ✅ La clé API Resend est configurée (`VITE_RESEND_API_KEY`)
- ✅ L'email d'envoi est configuré (`VITE_EMAIL_FROM`)
- ✅ L'inscription est réussie
- ✅ L'email de destination est valide

### **❌ Ça ne fonctionne pas si :**

- ❌ La clé API Resend n'est pas configurée
- ❌ La clé API est invalide ou expirée
- ❌ L'email d'envoi n'est pas vérifié dans Resend
- ❌ L'email va en spam (vérifie les spams !)

---

## 📊 Différence Local vs Production

| Aspect | Local (dev) | Production (hébergé) |
|--------|-------------|----------------------|
| **Fichier config** | `.env` | `.env.production` ou variables Hostinger |
| **Clé API** | Même clé Resend | Même clé Resend |
| **Envoi email** | ✅ Oui | ✅ Oui |
| **Délai** | Quelques secondes | Quelques secondes |
| **Limite Resend** | 3000 emails/mois (gratuit) | 3000 emails/mois (gratuit) |

**✅ Aucune différence ! L'email fonctionne de la même manière en local et en production.**

---

## 🧪 Test Complet

### **Test 1 : En Local**

1. Vérifie que `.env` contient `VITE_RESEND_API_KEY`
2. Lance `npm run dev`
3. Crée un compte avec un email réel
4. Vérifie la console (messages d'envoi)
5. Vérifie ta boîte mail

### **Test 2 : En Production**

1. Vérifie que `.env.production` contient `VITE_RESEND_API_KEY`
2. Build : `npm run build`
3. Uploade sur Hostinger
4. Crée un compte sur le site hébergé
5. Vérifie ta boîte mail

---

## 🐛 Dépannage

### **L'email n'arrive pas en local ?**

1. **Vérifie la console** : Regarde les messages d'erreur
2. **Vérifie `.env`** : La clé API est-elle présente ?
3. **Redémarre le serveur** : `npm run dev`
4. **Vérifie les spams** : L'email peut être en spam
5. **Vérifie Resend Dashboard** : Va sur resend.com/emails

### **L'email n'arrive pas en production ?**

1. **Vérifie `.env.production`** : La clé API est-elle présente ?
2. **Vérifie Hostinger** : Les variables d'environnement sont-elles configurées ?
3. **Rebuild** : `npm run build` après modification
4. **Vérifie les spams** : L'email peut être en spam
5. **Vérifie Resend Dashboard** : Va sur resend.com/emails

### **Erreur "Email service not configured" ?**

- La variable `VITE_RESEND_API_KEY` n'est pas chargée
- Vérifie le fichier `.env` ou `.env.production`
- Redémarre le serveur ou rebuild

---

## ✅ Résumé

| Question | Réponse |
|----------|---------|
| **Email en local ?** | ✅ Oui, si `VITE_RESEND_API_KEY` est dans `.env` |
| **Email en production ?** | ✅ Oui, si `VITE_RESEND_API_KEY` est dans `.env.production` ou Hostinger |
| **Quand est-il envoyé ?** | ✅ Immédiatement après l'inscription |
| **Qui le reçoit ?** | ✅ L'utilisateur qui s'inscrit |
| **Quel type d'email ?** | ✅ Email de bienvenue avec design personnalisé |

---

## 🎯 Conclusion

**OUI, tu recevras un email de bienvenue que tu sois en local ou en production**, à condition que :

1. ✅ La clé API Resend soit configurée (`VITE_RESEND_API_KEY`)
2. ✅ L'email d'envoi soit configuré (`VITE_EMAIL_FROM`)
3. ✅ L'inscription soit réussie

**L'email est envoyé automatiquement et immédiatement après chaque inscription réussie ! 📧**

---

**Dernière vérification** : Décembre 2024

