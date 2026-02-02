# 🗑️ Supprimer TOUS les Utilisateurs - Guide Définitif

## 🔍 Problème

L'erreur **"Cet email est déjà utilisé"** persiste même après avoir supprimé les données des tables.

**Pourquoi ?** Les utilisateurs sont stockés dans **Supabase Auth** (`auth.users`), pas dans les tables de données. Il faut les supprimer séparément.

---

## ✅ Solution 1 : Via Supabase Dashboard (RECOMMANDÉ - Le Plus Simple)

### **Étape 1 : Accéder à Authentication**

1. Va sur [https://app.supabase.com](https://app.supabase.com)
2. Ouvre ton projet
3. Va dans **Authentication** (menu de gauche)
4. Clique sur **Users**

### **Étape 2 : Supprimer Tous les Utilisateurs**

1. **Si tu as peu d'utilisateurs** :
   - Clique sur chaque utilisateur
   - Clique sur **"Delete user"** ou **"Supprimer"**
   - Confirme la suppression

2. **Si tu as beaucoup d'utilisateurs** :
   - Utilise la **Solution 2** (Script Node.js) ci-dessous

### **Étape 3 : Vérifier**

1. Vérifie que la liste est vide
2. Teste l'inscription avec un email

---

## ✅ Solution 2 : Via Script Node.js (Pour Beaucoup d'Utilisateurs)

### **Étape 1 : Récupérer la Clé Service Role**

1. Va dans **Supabase Dashboard → Settings → API**
2. Cherche **"service_role"** (clé secrète, en rouge)
3. **⚠️ IMPORTANT** : C'est une clé ADMIN, ne la partage JAMAIS !
4. Copie cette clé

### **Étape 2 : Créer le Fichier .env.local**

1. Crée un fichier `.env.local` à la racine du projet
2. Ajoute ces lignes :

```env
SUPABASE_URL=https://ton-projet-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role_ici
```

3. Remplace par tes vraies valeurs

### **Étape 3 : Exécuter le Script**

```bash
node supprimer-tous-utilisateurs.js
```

Le script va :
- Lister tous les utilisateurs
- Attendre 5 secondes (pour te laisser annuler avec Ctrl+C)
- Supprimer tous les utilisateurs
- Vérifier que tout est supprimé

---

## ✅ Solution 3 : Via SQL Editor (Si tu as les Droits Admin)

### **⚠️ ATTENTION : Cette méthode nécessite les privilèges ADMIN**

1. Va dans **Supabase Dashboard → SQL Editor**
2. Crée une nouvelle requête
3. Colle ce code :

```sql
-- Supprimer tous les utilisateurs de Supabase Auth
-- ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !

-- Méthode 1 : Supprimer directement (nécessite les droits admin)
DELETE FROM auth.users;

-- Méthode 2 : Si DELETE ne fonctionne pas, utilise l'API Admin
-- (voir Solution 2 ci-dessus)
```

4. Clique sur **"Run"**
5. Vérifie le résultat

**Note** : Cette méthode peut ne pas fonctionner si tu n'as pas les privilèges admin complets. Dans ce cas, utilise la **Solution 1** ou **Solution 2**.

---

## ✅ Solution 4 : Via l'API Admin (Programmatique)

Si tu veux intégrer la suppression dans ton code, utilise l'API Admin :

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://ton-projet.supabase.co',
  'ta_cle_service_role', // ⚠️ Clé service_role, pas anon !
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Lister tous les utilisateurs
const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

// Supprimer chaque utilisateur
for (const user of users) {
  await supabaseAdmin.auth.admin.deleteUser(user.id)
}
```

---

## 🧹 Nettoyer Aussi IndexedDB (Base Locale)

Après avoir supprimé les utilisateurs Supabase, nettoie aussi le cache local :

### **Option 1 : Fichier HTML**

1. Ouvre `nettoyer-cache-navigateur.html` dans ton navigateur
2. Clique sur **"Nettoyer TOUT le cache"**

### **Option 2 : Console du Navigateur**

1. Ouvre l'application
2. Appuie sur `F12` → Console
3. Colle ce code :

```javascript
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('DepenseFacileDB').onsuccess = () => {
  console.log('✅ Cache nettoyé !');
  location.reload();
};
```

---

## ✅ Checklist Complète

- [ ] **Supabase Auth → Users** : Tous les utilisateurs supprimés
- [ ] **Table Editor** : Toutes les tables vides (expenses, incomes, budgets, etc.)
- [ ] **IndexedDB** : Nettoyé (via `nettoyer-cache-navigateur.html`)
- [ ] **Cache navigateur** : Nettoyé (Ctrl+Shift+Delete ou onglet privé)
- [ ] **Test** : Inscription fonctionne avec un email

---

## 🐛 Si l'Erreur Persiste

### **1. Vérifier que les Utilisateurs sont Vraiment Supprimés**

1. Va dans **Supabase Dashboard → Authentication → Users**
2. Vérifie que la liste est **VIDE**
3. Si des utilisateurs sont encore là, supprime-les manuellement

### **2. Vérifier le Cache Local**

1. Ouvre l'application dans un **onglet privé** (`Ctrl+Shift+N`)
2. Teste l'inscription
3. Si ça fonctionne, c'est un problème de cache

### **3. Vérifier les Variables d'Environnement**

1. Vérifie que `.env` contient les bonnes valeurs :
   ```env
   VITE_SUPABASE_URL=https://ton-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon
   ```
2. Redémarre le serveur après modification

### **4. Vérifier les Tables de Données**

1. Va dans **Table Editor**
2. Vérifie que toutes les tables sont **VIDES** :
   - `expenses` : 0 lignes
   - `incomes` : 0 lignes
   - `budgets` : 0 lignes
   - `user_profiles` : 0 lignes
   - `user_onboarding` : 0 lignes

### **5. Vérifier les Logs**

1. Ouvre la console (`F12` → Console)
2. Regarde les erreurs lors de l'inscription
3. Vérifie les messages Supabase

---

## 📋 Résumé des Fichiers

- **`supprimer-tous-utilisateurs.js`** : Script Node.js pour supprimer tous les utilisateurs
- **`nettoyer-cache-navigateur.html`** : Page pour nettoyer IndexedDB
- **`DELETE_ALL_USERS.sql`** : Script SQL (peut ne pas fonctionner sans droits admin)

---

## 🎯 Action Immédiate

**La méthode la plus simple et la plus sûre :**

1. **Va dans Supabase Dashboard → Authentication → Users**
2. **Supprime manuellement chaque utilisateur**
3. **Ouvre `nettoyer-cache-navigateur.html`** et nettoie IndexedDB
4. **Teste l'inscription** dans un onglet privé

**Si tu as beaucoup d'utilisateurs, utilise le script `supprimer-tous-utilisateurs.js`.**

---

**Une fois tous les utilisateurs supprimés, l'erreur "Cet email est déjà utilisé" disparaîtra ! ✅**

