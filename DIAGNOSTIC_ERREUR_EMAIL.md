# 🔍 Diagnostic : Erreur "Cet email est déjà utilisé"

## 🔴 Problème

L'erreur **"Cet email est déjà utilisé"** persiste même après avoir supprimé tous les utilisateurs.

---

## 🔍 Causes Possibles

### **1. Utilisateurs Non Confirmés (Soft Deleted)**

Supabase peut garder des utilisateurs "non confirmés" ou "en attente" qui ne sont pas visibles dans la liste normale.

**Solution :**
- Vérifie dans Supabase Dashboard → Authentication → Users
- Cherche les utilisateurs avec un statut "Unverified" ou "Pending"
- Supprime-les manuellement

### **2. Cache Local (IndexedDB)**

Le cache local peut contenir des informations d'utilisateurs qui interfèrent avec l'inscription.

**Solution :**
1. Ouvre `nettoyer-cache-navigateur.html` dans ton navigateur
2. Clique sur "Nettoyer TOUT le cache"
3. OU utilise la console :
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
     console.log('✅ Cache nettoyé !');
     location.reload();
   };
   ```

### **3. Email Confirmation Activée dans Supabase**

Si l'email confirmation est activée, Supabase peut bloquer les nouvelles inscriptions avec le même email.

**Solution :**
1. Va dans Supabase Dashboard → Authentication → Settings
2. Désactive **"Enable email confirmations"**
3. Sauvegarde

### **4. Problème de Cache Supabase**

Supabase peut avoir un cache interne qui n'est pas immédiatement mis à jour.

**Solution :**
- Attends 1-2 minutes après la suppression
- Redémarre le serveur de développement
- Teste dans un onglet privé

### **5. Utilisateurs dans d'Autres Projets**

Si tu as plusieurs projets Supabase, vérifie que tu supprimes dans le bon projet.

**Solution :**
- Vérifie que l'URL Supabase dans `.env` correspond au bon projet
- Vérifie dans le Dashboard que tu es sur le bon projet

---

## ✅ Solutions à Essayer (dans l'ordre)

### **Solution 1 : Vérifier les Utilisateurs Non Confirmés**

1. Va dans **Supabase Dashboard → Authentication → Users**
2. Regarde tous les utilisateurs (y compris ceux avec statut "Unverified")
3. Supprime **TOUS** les utilisateurs, même ceux non confirmés

### **Solution 2 : Nettoyer le Cache Local**

1. **Ouvre l'application** (`http://localhost:5173`)
2. **Appuie sur `F12`** → Console
3. **Colle ce code** :
   ```javascript
   // Nettoyer TOUT
   localStorage.clear();
   sessionStorage.clear();
   
   // Nettoyer IndexedDB
   const deleteDB = indexedDB.deleteDatabase('DepenseFacileDB');
   deleteDB.onsuccess = () => {
     console.log('✅ IndexedDB nettoyé');
   };
   deleteDB.onerror = () => {
     console.error('❌ Erreur IndexedDB');
   };
   
   // Nettoyer les cookies
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   
   console.log('✅ Cache complètement nettoyé !');
   location.reload();
   ```

### **Solution 3 : Désactiver Email Confirmation**

1. **Supabase Dashboard → Authentication → Settings**
2. **Désactive "Enable email confirmations"**
3. **Sauvegarde**
4. **Redémarre le serveur** (`npm run dev`)

### **Solution 4 : Vérifier le Projet Supabase**

1. **Vérifie l'URL dans `.env`** :
   ```
   VITE_SUPABASE_URL=https://xghetfduattzfcladnzm.supabase.co
   ```
2. **Va dans Supabase Dashboard**
3. **Vérifie que tu es sur le projet avec cette URL**
4. **Vérifie Authentication → Users dans ce projet**

### **Solution 5 : Tester avec un Email Différent**

1. **Teste l'inscription avec un email complètement différent**
2. **Si ça fonctionne**, le problème vient de l'email spécifique
3. **Si ça ne fonctionne pas**, le problème est plus général

### **Solution 6 : Vérifier les Logs Supabase**

1. **Va dans Supabase Dashboard → Logs → Auth Logs**
2. **Regarde les erreurs récentes**
3. **Cherche les messages liés à l'inscription**

---

## 🐛 Debug Avancé

### **Vérifier l'Erreur Exacte**

1. **Ouvre la console** (`F12` → Console)
2. **Tente l'inscription**
3. **Regarde l'erreur exacte dans la console**
4. **Note le message d'erreur complet**

### **Vérifier la Requête Supabase**

1. **Ouvre l'onglet Network** (`F12` → Network)
2. **Filtre par "auth"**
3. **Tente l'inscription**
4. **Regarde la requête et la réponse**
5. **Note le code d'erreur et le message**

---

## 📋 Checklist Complète

- [ ] **Supabase Auth → Users** : Aucun utilisateur (vérifié plusieurs fois)
- [ ] **Tables de données** : Toutes vides
- [ ] **Cache local** : Nettoyé (IndexedDB, localStorage, sessionStorage)
- [ ] **Email confirmation** : Désactivée dans Supabase
- [ ] **Projet Supabase** : Le bon projet vérifié
- [ ] **Serveur** : Redémarré
- [ ] **Onglet privé** : Testé dans un onglet privé
- [ ] **Email différent** : Testé avec un email différent

---

## 🎯 Action Immédiate

**Essaie dans cet ordre :**

1. **Nettoie le cache local** (Solution 2)
2. **Désactive email confirmation** (Solution 3)
3. **Teste dans un onglet privé** avec un email différent
4. **Vérifie les logs Supabase** (Solution 6)

---

**Si rien ne fonctionne, envoie-moi :**
- Le message d'erreur exact de la console
- La réponse de la requête Supabase (onglet Network)
- Une capture d'écran de Supabase Dashboard → Authentication → Users

