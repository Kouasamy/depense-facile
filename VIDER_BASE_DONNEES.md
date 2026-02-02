# 🗑️ Guide Complet pour Vider COMPLÈTEMENT la Base de Données

Ce guide t'explique comment supprimer **TOUS** les utilisateurs et **TOUTES** les données pour résoudre définitivement le problème "Cet email est déjà utilisé".

---

## ⚠️ ATTENTION

**Cette action est IRRÉVERSIBLE !** Tous les utilisateurs et toutes les données seront définitivement supprimés.

---

## 🎯 Solution Complète en 3 Étapes

### **Étape 1 : Supprimer les Utilisateurs dans Supabase Dashboard**

C'est la méthode la plus fiable :

1. **Va sur [https://app.supabase.com](https://app.supabase.com)**
2. **Sélectionne ton projet "GèreTonDjai"**
3. **Va dans Authentication → Users**
4. **Supprime TOUS les utilisateurs** :
   - Sélectionne tous les utilisateurs (coche en haut à gauche)
   - Clique sur "Delete" ou "Delete selected"
   - Confirme la suppression
5. **Vérifie que la liste est VIDE**

---

### **Étape 2 : Supprimer les Données des Tables**

1. **Va dans Table Editor**
2. **Pour chaque table, supprime toutes les lignes** :
   - `expenses` → Clique sur "..." → "Delete all rows"
   - `incomes` → Clique sur "..." → "Delete all rows"
   - `budgets` → Clique sur "..." → "Delete all rows"
   - `user_profiles` → Clique sur "..." → "Delete all rows"
   - `user_onboarding` → Clique sur "..." → "Delete all rows"

**OU utilise le script SQL** :

1. **Ouvre SQL Editor → New query**
2. **Copie et colle ce code** :
   ```sql
   DELETE FROM expenses;
   DELETE FROM incomes;
   DELETE FROM budgets;
   DELETE FROM user_profiles;
   DELETE FROM user_onboarding;
   ```
3. **Clique sur "Run"**

---

### **Étape 3 : Nettoyer IndexedDB (Base Locale)**

#### **Méthode 1 : Via le Fichier HTML (Recommandé)**

1. **Ouvre le fichier `NETTOYER_INDEXEDDB.html`** dans ton navigateur
2. **Clique sur "Nettoyer TOUT"**
3. **Attends que la page se recharge**

#### **Méthode 2 : Via la Console du Navigateur**

1. **Ouvre l'application** dans ton navigateur
2. **Ouvre la console** (`F12` → Console)
3. **Colle ce code** :
   ```javascript
   // Supprimer IndexedDB
   indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
     console.log('✅ IndexedDB supprimé');
     
     // Supprimer les caches
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name));
       console.log('✅ Caches supprimés');
     });
     
     // Supprimer localStorage et sessionStorage
     localStorage.clear();
     sessionStorage.clear();
     console.log('✅ Storage nettoyé');
     
     // Recharger
     location.reload();
   };
   ```
4. **Appuie sur Entrée**

#### **Méthode 3 : Via DevTools**

1. **Ouvre DevTools** (`F12`)
2. **Va dans Application** (Chrome) ou **Storage** (Firefox)
3. **Trouve "IndexedDB"** → **"DepenseFacileDB"**
4. **Clique droit → "Delete database"**
5. **Recharge la page** (`F5`)

---

## 🔧 Script SQL Complet

J'ai créé le fichier **`VIDER_TOUT_COMPLET.sql`** avec un script complet.

### **Comment l'utiliser :**

1. **Ouvre Supabase Dashboard → SQL Editor → New query**
2. **Ouvre le fichier `VIDER_TOUT_COMPLET.sql`**
3. **Copie tout le contenu**
4. **Colle dans l'éditeur SQL**
5. **Clique sur "Run"**

**⚠️ Si tu as une erreur de permissions** pour `DELETE FROM auth.users`, utilise la méthode Dashboard (Étape 1) à la place.

---

## ✅ Vérification Complète

Après avoir suivi toutes les étapes, vérifie :

### **1. Supabase Auth**
- Authentication → Users → **Devrait être VIDE** ✅

### **2. Tables Supabase**
- Table Editor → Toutes les tables → **Devraient être VIDES** ✅
  - `expenses` → 0 lignes
  - `incomes` → 0 lignes
  - `budgets` → 0 lignes
  - `user_profiles` → 0 lignes
  - `user_onboarding` → 0 lignes

### **3. IndexedDB Local**
- DevTools → Application → IndexedDB → **Devrait être supprimé ou vide** ✅

### **4. Test d'Inscription**
- Essaie de créer un compte avec ton email
- **Ça devrait fonctionner maintenant !** ✅

---

## 🐛 Si le Problème Persiste

### **Vérifie dans Supabase SQL Editor :**

Exécute cette requête pour voir s'il reste des utilisateurs :

```sql
SELECT id, email, created_at FROM auth.users;
```

Si tu vois encore des utilisateurs, supprime-les manuellement dans le Dashboard.

### **Vérifie les Logs Supabase :**

1. **Va dans Logs → Auth Logs**
2. **Regarde les erreurs** liées à l'inscription
3. **Vérifie les tentatives d'inscription**

### **Test avec un Email Différent :**

1. **Essaie avec un email complètement nouveau** (ex: `test123@example.com`)
2. **Si ça fonctionne**, c'est que l'ancien email est encore quelque part
3. **Si ça ne fonctionne pas**, le problème vient d'ailleurs

---

## 🔄 Alternative : Réinitialiser Complètement le Projet

Si rien ne fonctionne, tu peux réinitialiser complètement :

### **Option 1 : Supprimer et Recréer les Tables**

1. **Dans SQL Editor, exécute** :
   ```sql
   DROP TABLE IF EXISTS expenses CASCADE;
   DROP TABLE IF EXISTS incomes CASCADE;
   DROP TABLE IF EXISTS budgets CASCADE;
   DROP TABLE IF EXISTS user_profiles CASCADE;
   DROP TABLE IF EXISTS user_onboarding CASCADE;
   ```

2. **Recrée les tables** avec `supabase/migrations/001_initial_schema.sql`

### **Option 2 : Créer un Nouveau Projet Supabase**

1. **Crée un nouveau projet** dans Supabase
2. **Réinstalle le schéma** avec le fichier de migration
3. **Met à jour les variables d'environnement** dans `.env` et `.env.production`

---

## 📋 Checklist Complète

- [ ] **Supabase Auth → Users** : Liste complètement vide
- [ ] **Table Editor → expenses** : 0 lignes
- [ ] **Table Editor → incomes** : 0 lignes
- [ ] **Table Editor → budgets** : 0 lignes
- [ ] **Table Editor → user_profiles** : 0 lignes
- [ ] **Table Editor → user_onboarding** : 0 lignes
- [ ] **IndexedDB** : Supprimé ou vide
- [ ] **LocalStorage** : Nettoyé
- [ ] **SessionStorage** : Nettoyé
- [ ] **Cache du navigateur** : Nettoyé
- [ ] **Test d'inscription** : Fonctionne avec ton email

---

## 🎯 Résultat Attendu

Après avoir suivi toutes les étapes :

- ✅ **Supabase Auth** : Aucun utilisateur
- ✅ **Toutes les tables** : Vides
- ✅ **IndexedDB** : Supprimé
- ✅ **Inscription** : Tu peux créer un compte sans problème

---

## 🚀 Prochaines Étapes

Une fois que tout est nettoyé :

1. **Crée un nouveau compte** avec ton email
2. **Vérifie que tu reçois l'email de bienvenue**
3. **Ajoute quelques dépenses** pour tester
4. **Vérifie dans Supabase** que les données sont sauvegardées

---

**Bon courage ! 🎉**

