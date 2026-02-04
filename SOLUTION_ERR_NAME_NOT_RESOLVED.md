# 🔧 Solution définitive : ERR_NAME_NOT_RESOLVED

## ❌ Problème

L'erreur `Failed to load resource: net::ERR_NAME_NOT_RESOLVED` sur `geretondjai.com/api/send-email` signifie que :

1. **Le frontend n'a pas été redéployé** après la mise à jour du `.env`
2. **OU** le serveur Node.js n'est pas accessible via le reverse proxy
3. **OU** le domaine n'est pas correctement configuré

## ✅ Solutions

### Solution 1 : Vérifier et redéployer le frontend

**Étape 1 : Vérifier le fichier `.env` sur Hostinger**

Dans File Manager, ouvrez le fichier `.env` à la racine et vérifiez qu'il contient :

```
VITE_EMAIL_SERVER_URL=https://geretondjai.com
```

**Étape 2 : Redéployer le frontend**

⚠️ **CRUCIAL :** Les variables `VITE_*` sont intégrées au moment du **build**, pas au runtime !

Vous devez **redéployer le frontend** pour que les nouvelles variables soient prises en compte :

1. Dans hPanel → Sites Web → votre site
2. Cherchez **"Deploy"**, **"Build"**, ou **"Redeploy"**
3. Cliquez pour redéployer

**OU** si vous utilisez GitHub :
- Push votre code sur GitHub
- Hostinger redéploiera automatiquement

### Solution 2 : Vérifier que le serveur Node.js est accessible

**Test 1 : Health check**

Ouvrez dans votre navigateur :
```
https://geretondjai.com/health
```

**Résultat attendu :** `{"status":"ok","service":"email-server"}`

**Si ça ne fonctionne pas :**
- Le serveur Node.js n'est pas démarré
- OU le reverse proxy n'est pas configuré

**Test 2 : Vérifier le serveur Node.js dans hPanel**

1. Allez dans **hPanel** → **Sites Web** → **Gérer** → **Avancé** → **Node.js**
2. Vérifiez qu'une application Node.js existe
3. Vérifiez qu'elle est **"Running"** (démarrée)
4. Si elle n'est pas démarrée, démarrez-la

### Solution 3 : Vérifier les logs du serveur

Dans hPanel → Node.js → Votre application → **Logs**

Cherchez :
- `🚀 Serveur email démarré sur 0.0.0.0:3001` → Le serveur fonctionne
- Des erreurs → Indiquez-moi les erreurs

### Solution 4 : Test direct dans la console

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Test 1 : Vérifier que le serveur répond
fetch('https://geretondjai.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Test 2 : Tester l'envoi d'email
fetch('https://geretondjai.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'votre@email.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Résultats possibles :**

✅ **Si les deux tests fonctionnent** → Le serveur fonctionne, le problème vient du frontend qui n'a pas été redéployé

❌ **Si le test 1 échoue** → Le serveur n'est pas démarré ou n'est pas accessible

❌ **Si le test 1 fonctionne mais le test 2 échoue** → Erreur SMTP (voir les logs)

## 📋 Checklist complète

- [ ] Le fichier `.env` à la racine sur Hostinger contient `VITE_EMAIL_SERVER_URL=https://geretondjai.com`
- [ ] Le frontend a été **redéployé** (rebuild) après la mise à jour du `.env`
- [ ] Le serveur Node.js est démarré dans hPanel → Node.js
- [ ] Le test `/health` fonctionne : `https://geretondjai.com/health`
- [ ] Les logs du serveur montrent `🚀 Serveur email démarré sur 0.0.0.0:3001`

## 🆘 Si rien ne fonctionne

Si après avoir tout vérifié, ça ne fonctionne toujours pas :

1. **Vérifiez les logs du serveur Node.js** dans hPanel
2. **Vérifiez la console du navigateur** pour voir les erreurs exactes
3. **Testez avec le code JavaScript** ci-dessus dans la console

Donnez-moi les résultats de ces tests et je vous aiderai à résoudre le problème.

