# 🗑️ Guide pour Supprimer Toutes les Données Utilisateurs

Ce guide t'explique comment supprimer tous les comptes utilisateurs et vider complètement la base de données pour repartir à zéro.

---

## ⚠️ ATTENTION

**Cette action est IRRÉVERSIBLE !** Toutes les données seront définitivement supprimées. Assure-toi de vouloir vraiment tout supprimer avant de continuer.

---

## 📋 Étapes pour Nettoyer la Base de Données

### **Étape 1 : Supprimer les Données Supabase (Cloud)**

#### Option A : Via SQL Editor (Recommandé)

1. **Connecte-toi à ton dashboard Supabase**
   - Va sur [https://app.supabase.com](https://app.supabase.com)
   - Sélectionne ton projet "GèreTonDjai"

2. **Ouvre le SQL Editor**
   - Clique sur "SQL Editor" dans le menu de gauche
   - Clique sur "New query"

3. **Exécute le script de nettoyage**
   - Ouvre le fichier `CLEAR_ALL_DATA.sql` dans ce projet
   - Copie tout le contenu
   - Colle-le dans l'éditeur SQL de Supabase
   - Clique sur "Run" (ou Ctrl+Enter)

4. **Vérifie que les tables sont vides**
   - Va dans "Table Editor"
   - Vérifie que toutes les tables sont vides :
     - `expenses` → 0 lignes
     - `incomes` → 0 lignes
     - `budgets` → 0 lignes
     - `user_profiles` → 0 lignes
     - `user_onboarding` → 0 lignes

#### Option B : Via Table Editor (Manuel)

1. **Va dans "Table Editor"**
2. **Pour chaque table** :
   - Clique sur la table (expenses, incomes, budgets, etc.)
   - Clique sur "..." (menu) → "Delete all rows"
   - Confirme la suppression

---

### **Étape 2 : Supprimer les Utilisateurs Supabase Auth**

1. **Va dans Authentication → Users**
   - Dans le dashboard Supabase
   - Clique sur "Authentication" dans le menu de gauche
   - Clique sur "Users"

2. **Supprime tous les utilisateurs**
   - Sélectionne tous les utilisateurs (coche en haut)
   - Clique sur "Delete" ou "Delete selected"
   - Confirme la suppression

**OU** utilise cette commande SQL (nécessite service_role) :
```sql
DELETE FROM auth.users;
```

---

### **Étape 3 : Nettoyer la Base de Données Locale (IndexedDB)**

#### Option A : Via la Console du Navigateur (Recommandé)

1. **Ouvre l'application dans ton navigateur**
   - Lance `npm run dev` si ce n'est pas déjà fait
   - Ouvre l'application dans Chrome/Firefox

2. **Ouvre la Console du Navigateur**
   - Appuie sur `F12` ou `Ctrl+Shift+I`
   - Va dans l'onglet "Console"

3. **Exécute le script de nettoyage**
   - Copie le contenu du fichier `clear-database.js`
   - Colle-le dans la console
   - Appuie sur Entrée

4. **Recharge la page**
   - Appuie sur `F5` ou `Ctrl+R`
   - La base de données sera réinitialisée

#### Option B : Via les DevTools (Manuel)

1. **Ouvre les DevTools** (`F12`)
2. **Va dans l'onglet "Application"** (Chrome) ou "Storage" (Firefox)
3. **Trouve "IndexedDB"** dans le menu de gauche
4. **Clique sur "DepenseFacileDB"**
5. **Clique droit → "Delete database"**
6. **Recharge la page**

#### Option C : Via le Code (Programmatique)

Tu peux aussi créer une page temporaire pour nettoyer :

```javascript
// Dans la console du navigateur
indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
  console.log('✅ Base de données supprimée !');
  location.reload();
};
```

---

## ✅ Vérification

Après avoir exécuté toutes les étapes :

1. **Vérifie Supabase**
   - Table Editor → Toutes les tables doivent être vides
   - Authentication → Users → Aucun utilisateur

2. **Vérifie la Base Locale**
   - Ouvre les DevTools → Application → IndexedDB
   - La base de données doit être réinitialisée ou supprimée

3. **Teste l'Application**
   - Crée un nouveau compte
   - Vérifie que tout fonctionne correctement

---

## 🔄 Réinitialisation Complète

Si tu veux vraiment tout réinitialiser (y compris la structure) :

### **Option 1 : Supprimer et Recréer les Tables**

1. Dans Supabase SQL Editor, exécute :
```sql
-- Supprimer toutes les tables
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS incomes CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
```

2. Recrée les tables avec le fichier `supabase/migrations/001_initial_schema.sql`

### **Option 2 : Réinitialiser le Projet Supabase**

1. Va dans Settings → General
2. Clique sur "Delete Project"
3. Crée un nouveau projet
4. Réinstalle le schéma

---

## 📝 Scripts Disponibles

- **`CLEAR_ALL_DATA.sql`** : Script SQL pour supprimer toutes les données Supabase
- **`clear-database.js`** : Script JavaScript pour nettoyer IndexedDB
- **`CLEAR_DATABASE_GUIDE.md`** : Ce guide

---

## 🐛 Dépannage

### **Les données ne se suppriment pas ?**

1. **Vérifie les politiques RLS**
   - Assure-toi d'avoir les droits admin
   - Utilise la clé `service_role` si nécessaire

2. **Vérifie les contraintes de clé étrangère**
   - Certaines tables peuvent avoir des dépendances
   - Supprime dans le bon ordre (d'abord les données, puis les utilisateurs)

3. **Vérifie la connexion**
   - Assure-toi d'être connecté à Supabase
   - Vérifie que les credentials sont corrects

### **La base locale ne se supprime pas ?**

1. **Ferme tous les onglets** de l'application
2. **Ferme le serveur de développement** (`Ctrl+C`)
3. **Réessaye** la suppression
4. **Ouvre les DevTools** et supprime manuellement

---

## ✅ Résultat Attendu

Après avoir suivi toutes les étapes :

- ✅ **Supabase** : Toutes les tables sont vides
- ✅ **Supabase Auth** : Aucun utilisateur
- ✅ **IndexedDB** : Base de données réinitialisée
- ✅ **Application** : Prête pour de nouveaux tests

---

## 🎯 Prochaines Étapes

Une fois la base de données nettoyée :

1. **Crée un nouveau compte** pour tester
2. **Ajoute quelques dépenses** pour vérifier que tout fonctionne
3. **Teste toutes les fonctionnalités** de l'application

---

**Bon test ! 🚀**

