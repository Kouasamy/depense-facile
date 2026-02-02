# 🗑️ Guide pour Supprimer TOUS les Utilisateurs Supabase Auth

Le problème que tu rencontres ("Cet email est déjà utilisé") signifie que les utilisateurs existent toujours dans **Supabase Auth**, même si les données des tables ont été supprimées.

---

## 🔍 Pourquoi ça ne fonctionne pas ?

Quand tu exécutes `DELETE FROM expenses` etc., ça supprime seulement les **données** des tables, mais **PAS les utilisateurs** dans `auth.users`. 

Supabase Auth vérifie toujours si l'email existe dans `auth.users`, donc même si les tables sont vides, tu ne peux pas recréer un compte avec le même email.

---

## ✅ Solution : 3 Méthodes pour Supprimer les Utilisateurs

### **Méthode 1 : Via le Dashboard Supabase (RECOMMANDÉ - Le plus simple)**

1. **Connecte-toi à Supabase**
   - Va sur [https://app.supabase.com](https://app.supabase.com)
   - Sélectionne ton projet "GèreTonDjai"

2. **Va dans Authentication → Users**
   - Clique sur "Authentication" dans le menu de gauche
   - Clique sur "Users"

3. **Supprime tous les utilisateurs**
   - **Option A** : Sélectionne tous les utilisateurs (coche en haut à gauche)
   - Clique sur "Delete" ou "Delete selected"
   - Confirme la suppression
   
   - **Option B** : Supprime un par un
     - Clique sur chaque utilisateur
     - Clique sur "Delete user"
     - Confirme

4. **Vérifie que c'est vide**
   - La liste devrait être vide
   - Tu peux maintenant créer un nouveau compte

---

### **Méthode 2 : Via SQL Editor (Nécessite service_role)**

1. **Récupère ta clé service_role**
   - Va dans Supabase Dashboard → Settings → API
   - Copie la clé **"service_role"** (⚠️ NE JAMAIS l'exposer publiquement)
   - Cette clé a les droits admin

2. **Ouvre le SQL Editor**
   - Clique sur "SQL Editor" → "New query"

3. **Exécute ce script** :
   ```sql
   -- Supprimer toutes les données d'abord
   DELETE FROM expenses;
   DELETE FROM incomes;
   DELETE FROM budgets;
   DELETE FROM user_profiles;
   DELETE FROM user_onboarding;
   
   -- Supprimer tous les utilisateurs Auth
   DELETE FROM auth.users;
   
   -- Vérifier
   SELECT COUNT(*) as total_users FROM auth.users;
   ```

4. **Si ça ne fonctionne pas** (erreur de permissions) :
   - Utilise la Méthode 1 (Dashboard) ou Méthode 3 (Script Node.js)

---

### **Méthode 3 : Via Script Node.js (Programmatique)**

1. **Installe les dépendances** (si pas déjà fait) :
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Configure ta clé service_role** :
   - Ouvre ton fichier `.env`
   - Ajoute :
     ```env
     SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role_ici
     ```
   - ⚠️ **IMPORTANT** : Ne commite JAMAIS cette clé dans Git !

3. **Exécute le script** :
   ```bash
   node delete-users-admin.js
   ```

4. **Le script va** :
   - Lister tous les utilisateurs
   - Les supprimer un par un
   - Te donner un résumé

---

## 🔧 Script SQL Complet (À exécuter dans Supabase SQL Editor)

J'ai créé le fichier **`DELETE_ALL_USERS.sql`** avec le script complet. Voici comment l'utiliser :

1. **Ouvre Supabase SQL Editor**
2. **Ouvre le fichier `DELETE_ALL_USERS.sql`**
3. **Copie tout le contenu**
4. **Colle dans l'éditeur SQL**
5. **Clique sur "Run"**

**Si tu as une erreur de permissions**, utilise la Méthode 1 (Dashboard) à la place.

---

## ✅ Vérification

Après avoir supprimé les utilisateurs :

1. **Vérifie dans Supabase Dashboard**
   - Authentication → Users → Devrait être vide

2. **Vérifie les tables**
   - Table Editor → Toutes les tables devraient être vides

3. **Teste l'inscription**
   - Essaie de créer un compte avec un email
   - Ça devrait fonctionner maintenant !

---

## 🐛 Dépannage

### **Erreur "permission denied" dans SQL Editor ?**

- Tu n'as pas les droits admin
- **Solution** : Utilise la Méthode 1 (Dashboard) ou Méthode 3 (Script Node.js)

### **Les utilisateurs ne se suppriment pas via le Dashboard ?**

- Vérifie que tu es bien connecté en tant qu'admin du projet
- Essaie de supprimer un par un au lieu de tous en même temps

### **Le script Node.js ne fonctionne pas ?**

- Vérifie que `SUPABASE_SERVICE_ROLE_KEY` est bien dans ton `.env`
- Vérifie que tu as installé les dépendances : `npm install @supabase/supabase-js dotenv`
- Vérifie que la clé service_role est correcte (commence par `eyJ...`)

---

## 📝 Fichiers Disponibles

- **`DELETE_ALL_USERS.sql`** : Script SQL pour supprimer tous les utilisateurs
- **`delete-users-admin.js`** : Script Node.js pour supprimer via l'API Admin
- **`SUPPRIMER_UTILISATEURS.md`** : Ce guide

---

## 🎯 Résultat Attendu

Après avoir suivi une des méthodes :

- ✅ **Supabase Auth** : Aucun utilisateur
- ✅ **Tables** : Toutes vides
- ✅ **Inscription** : Tu peux créer un nouveau compte sans problème

---

## ⚠️ Important

- La clé **service_role** a des droits ADMIN complets
- **NE JAMAIS** l'exposer publiquement ou la commiter dans Git
- Utilise-la uniquement pour les scripts d'administration locaux
- Pour l'application, utilise toujours la clé **anon**

---

**Bonne chance ! 🚀**

