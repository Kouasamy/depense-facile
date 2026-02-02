# 🔍 Guide Complet pour Vérifier et Nettoyer TOUT

Si tu as toujours le problème "Cet email est déjà utilisé" même après avoir supprimé les utilisateurs, voici un guide complet pour tout vérifier et nettoyer.

---

## 🔍 Étape 1 : Vérifier Supabase Auth

### Dans le Dashboard Supabase :

1. **Va dans Authentication → Users**
   - Vérifie que la liste est **COMPLÈTEMENT VIDE**
   - Si tu vois encore des utilisateurs, supprime-les manuellement

2. **Vérifie les Tables**
   - Va dans Table Editor
   - Vérifie que ces tables sont vides :
     - `expenses` → 0 lignes
     - `incomes` → 0 lignes
     - `budgets` → 0 lignes
     - `user_profiles` → 0 lignes
     - `user_onboarding` → 0 lignes

---

## 🧹 Étape 2 : Nettoyer le Cache du Navigateur

Le navigateur peut garder des informations en cache. Nettoie tout :

### Chrome/Edge :
1. Appuie sur `F12` pour ouvrir les DevTools
2. Clique droit sur le bouton de rechargement (🔄)
3. Sélectionne "Vider le cache et effectuer un rechargement forcé"
4. **OU** :
   - `Ctrl+Shift+Delete`
   - Sélectionne "Images et fichiers en cache"
   - Clique sur "Effacer les données"

### Firefox :
1. `Ctrl+Shift+Delete`
2. Sélectionne "Cache"
3. Clique sur "Effacer maintenant"

---

## 💾 Étape 3 : Supprimer IndexedDB (Base de Données Locale)

La base de données locale peut garder des informations utilisateurs :

### Méthode 1 : Via DevTools (Recommandé)

1. **Ouvre les DevTools** (`F12`)
2. **Va dans l'onglet "Application"** (Chrome) ou "Storage" (Firefox)
3. **Trouve "IndexedDB"** dans le menu de gauche
4. **Clique sur "DepenseFacileDB"**
5. **Clique droit → "Delete database"**
6. **Recharge la page** (`F5`)

### Méthode 2 : Via Console

1. **Ouvre la console** (`F12` → Console)
2. **Copie et colle ce code** :
   ```javascript
   // Supprimer IndexedDB
   indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
     console.log('✅ IndexedDB supprimé !');
     // Supprimer aussi le cache
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name));
       console.log('✅ Cache supprimé !');
       location.reload();
     });
   };
   ```
3. **Appuie sur Entrée**
4. **La page va se recharger automatiquement**

---

## 🔄 Étape 4 : Vérifier les Sessions Supabase

Les sessions peuvent rester actives :

### Via Console du Navigateur :

1. **Ouvre la console** (`F12`)
2. **Copie et colle ce code** :
   ```javascript
   // Vérifier et supprimer les sessions Supabase
   localStorage.clear();
   sessionStorage.clear();
   console.log('✅ LocalStorage et SessionStorage nettoyés !');
   location.reload();
   ```
3. **Appuie sur Entrée**

---

## 🗑️ Étape 5 : Script de Nettoyage Complet

Crée un fichier `clean-all.html` à la racine du projet :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Nettoyage Complet</title>
</head>
<body>
    <h1>Nettoyage Complet de l'Application</h1>
    <button onclick="cleanAll()">Nettoyer TOUT</button>
    <div id="result"></div>
    
    <script>
        async function cleanAll() {
            const result = document.getElementById('result');
            result.innerHTML = '<p>🧹 Nettoyage en cours...</p>';
            
            try {
                // 1. Supprimer IndexedDB
                await new Promise((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase('DepenseFacileDB');
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                    deleteReq.onblocked = () => {
                        alert('⚠️ Ferme tous les onglets de l\'application et réessaye');
                        reject('Blocked');
                    };
                });
                result.innerHTML += '<p>✅ IndexedDB supprimé</p>';
                
                // 2. Supprimer les caches
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                result.innerHTML += '<p>✅ Caches supprimés</p>';
                
                // 3. Supprimer localStorage et sessionStorage
                localStorage.clear();
                sessionStorage.clear();
                result.innerHTML += '<p>✅ Storage nettoyé</p>';
                
                // 4. Supprimer les cookies
                document.cookie.split(";").forEach(c => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                result.innerHTML += '<p>✅ Cookies supprimés</p>';
                
                result.innerHTML += '<p><strong>✅ Nettoyage terminé ! Recharge la page.</strong></p>';
                setTimeout(() => location.reload(), 2000);
                
            } catch (error) {
                result.innerHTML += `<p>❌ Erreur : ${error}</p>`;
            }
        }
    </script>
</body>
</html>
```

Ouvre ce fichier dans ton navigateur et clique sur le bouton.

---

## 🔧 Étape 6 : Vérifier la Configuration Supabase

Assure-toi que les variables d'environnement sont correctes :

1. **Vérifie ton fichier `.env`** :
   ```env
   VITE_SUPABASE_URL=https://ton-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon
   ```

2. **Redémarre le serveur de développement** :
   ```bash
   # Arrête le serveur (Ctrl+C)
   npm run dev
   ```

---

## 🧪 Étape 7 : Test avec un Email Différent

Pour vérifier si c'est vraiment un problème de cache :

1. **Essaie avec un email complètement différent** :
   - Exemple : `test123@example.com`
   - Si ça fonctionne, c'est que l'ancien email est encore en cache quelque part

2. **Si ça ne fonctionne toujours pas** :
   - Le problème vient de Supabase
   - Vérifie à nouveau dans le Dashboard

---

## 🔍 Étape 8 : Vérifier les Logs Supabase

1. **Va dans Supabase Dashboard → Logs**
2. **Regarde les logs d'authentification**
3. **Cherche les erreurs** liées à l'inscription

---

## 🛠️ Solution Ultime : Réinitialiser Complètement

Si rien ne fonctionne :

### Option 1 : Supprimer et Recréer le Projet Supabase

1. **Crée un nouveau projet Supabase**
2. **Réinstalle le schéma** avec `supabase/migrations/001_initial_schema.sql`
3. **Met à jour les variables d'environnement**

### Option 2 : Utiliser un Mode Incognito

1. **Ouvre un onglet en mode navigation privée** (`Ctrl+Shift+N`)
2. **Va sur ton application**
3. **Essaie de créer un compte**
4. Si ça fonctionne, c'est un problème de cache

---

## ✅ Checklist Complète

- [ ] Supabase Auth → Users : Liste vide
- [ ] Tables Supabase : Toutes vides
- [ ] IndexedDB supprimé
- [ ] Cache du navigateur nettoyé
- [ ] LocalStorage/SessionStorage nettoyés
- [ ] Serveur redémarré
- [ ] Testé avec un email différent
- [ ] Testé en mode incognito

---

## 🐛 Si le Problème Persiste

1. **Vérifie les logs de la console** (`F12` → Console)
2. **Regarde les erreurs réseau** (`F12` → Network)
3. **Vérifie les réponses de Supabase** dans les requêtes API

---

**Bon courage ! 🚀**

