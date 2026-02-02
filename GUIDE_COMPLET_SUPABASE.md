# 🚀 Guide Complet : Créer et Configurer Supabase

Tu n'as pas encore de projet Supabase. Voici comment en créer un et le configurer.

---

## 📋 Étape 1 : Créer un Compte Supabase

1. **Va sur [https://supabase.com](https://supabase.com)**
2. **Clique sur "Start your project"** (gratuit)
3. **Crée un compte** avec :
   - GitHub (recommandé)
   - Google
   - Email
4. **Confirme ton email** si nécessaire

---

## 🆕 Étape 2 : Créer un Nouveau Projet

1. **Une fois connecté, clique sur "New Project"** (bouton vert)
2. **Remplis le formulaire** :
   - **Organization** : Sélectionne ou crée une organisation
   - **Name** : `GèreTonDjai` (ou un nom de ton choix)
   - **Database Password** : 
     - ⚠️ **Choisis un mot de passe fort** (minimum 12 caractères)
     - ⚠️ **NOTE-LE BIEN** quelque part (tu en auras besoin)
     - Exemple : `GereTonDjai2024!@#`
   - **Region** : **Europe (West)** ou **Europe (Central)**
   - **Pricing Plan** : **Free** (gratuit)
3. **Clique sur "Create new project"**
4. **Attends 2-3 minutes** (tu verras une barre de progression)

---

## 🔑 Étape 3 : Récupérer les Credentials

Une fois le projet créé :

1. **Dans le Dashboard, va dans Settings** (⚙️ en bas à gauche)
2. **Clique sur "API"** dans le menu
3. **Copie ces deux valeurs** :

   ### **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - C'est l'URL de ton projet
   - **Copie cette URL** 📋

   ### **anon public key**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk5ODQwMCwiZXhwIjoxOTYxNTc0NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - C'est la clé publique (celle que tu utiliseras)
   - **Copie cette clé** 📋

---

## ⚙️ Étape 4 : Configurer l'Application

### **1. Mettre à jour `.env`**

1. **Ouvre le fichier `.env`** à la racine du projet
2. **Ajoute ces lignes** (ou modifie si elles existent) :
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```
3. **Remplace** :
   - `https://ton-projet-id.supabase.co` par ton **Project URL**
   - `ta_cle_anon_ici` par ta **anon public key**
4. **Sauvegarde**

### **2. Mettre à jour `.env.production`**

1. **Ouvre le fichier `.env.production`**
2. **Ajoute les mêmes lignes** :
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```
3. **Sauvegarde**

---

## 🗄️ Étape 5 : Créer les Tables (Schéma de Base de Données)

1. **Dans Supabase Dashboard, va dans SQL Editor** (icône SQL dans le menu)
2. **Clique sur "New query"**
3. **Ouvre le fichier `supabase/migrations/001_initial_schema.sql`** de ton projet
4. **Sélectionne tout** (`Ctrl+A`) et **copie** (`Ctrl+C`)
5. **Colle dans l'éditeur SQL** de Supabase (`Ctrl+V`)
6. **Clique sur "Run"** (ou `Ctrl+Enter`)
7. **Attends quelques secondes**
8. **Tu devrais voir** : "Success. No rows returned"

### **Vérifier que les Tables sont Créées**

1. **Va dans Table Editor** (icône table dans le menu)
2. **Tu devrais voir ces 5 tables** :
   - ✅ `expenses`
   - ✅ `incomes`
   - ✅ `budgets`
   - ✅ `user_profiles`
   - ✅ `user_onboarding`

---

## 🧹 Étape 6 : Nettoyer la Base de Données (Partir de Zéro)

Maintenant que tout est configuré, nettoie la base de données :

### **Méthode 1 : Via SQL Editor (Rapide)**

1. **Va dans SQL Editor → New query**
2. **Copie et colle ce code** :
   ```sql
   -- Supprimer toutes les données des tables
   DELETE FROM expenses;
   DELETE FROM incomes;
   DELETE FROM budgets;
   DELETE FROM user_profiles;
   DELETE FROM user_onboarding;
   
   -- Supprimer tous les utilisateurs Auth
   DELETE FROM auth.users;
   ```
3. **Clique sur "Run"**

**⚠️ Si tu as une erreur pour `DELETE FROM auth.users`**, utilise la Méthode 2.

### **Méthode 2 : Via Dashboard (Manuel)**

1. **Va dans Authentication → Users**
2. **Sélectionne tous les utilisateurs** (coche en haut)
3. **Clique sur "Delete"**
4. **Confirme**

5. **Va dans Table Editor**
6. **Pour chaque table** :
   - Clique sur la table
   - Clique sur "..." → "Delete all rows"
   - Confirme

---

## ✅ Étape 7 : Tester

1. **Redémarre ton serveur** :
   ```bash
   npm run dev
   ```

2. **Ouvre la console** (`F12` → Console)
3. **Regarde les messages** :
   - ✅ `✅ Supabase client initialized` = OK !
   - ⚠️ `⚠️ Supabase not configured` = Vérifie ton `.env`

4. **Teste l'inscription** :
   - Crée un compte avec ton email
   - Vérifie dans Supabase : **Authentication → Users** → Ton compte devrait apparaître
   - Vérifie ta boîte mail : Email de bienvenue

---

## 📝 Exemple de Fichier `.env` Complet

Ton fichier `.env` devrait ressembler à ça :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk5ODQwMCwiZXhwIjoxOTYxNTc0NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Resend Email Configuration
VITE_RESEND_API_KEY=re_2MLUE38i_GLsXv5MqjKgeYkzwz5XTdSrQ
VITE_EMAIL_FROM=noreply@geretondjai.com
VITE_EMAIL_FROM_NAME=GereTonDjai
VITE_RESEND_API_URL=https://api.resend.com
```

---

## 🎯 Checklist

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Project URL copiée
- [ ] anon public key copiée
- [ ] `.env` configuré
- [ ] `.env.production` configuré
- [ ] Schéma SQL exécuté
- [ ] Tables créées (5 tables)
- [ ] Base de données nettoyée
- [ ] Serveur redémarré
- [ ] Test d'inscription réussi

---

## 🐛 Dépannage

### **Je ne trouve pas "New Project" ?**

- Tu dois être connecté
- Vérifie que tu es sur [https://app.supabase.com](https://app.supabase.com)
- Crée un compte si nécessaire

### **Le script SQL ne fonctionne pas ?**

- Vérifie les erreurs dans SQL Editor
- Exécute les commandes une par une
- Vérifie que l'extension UUID est activée

### **Les variables ne sont pas chargées ?**

- Vérifie que les variables commencent par `VITE_`
- Redémarre le serveur après modification
- Vérifie que le fichier `.env` est à la racine

---

**Une fois tout configuré, tu pourras créer des comptes sans problème ! 🚀**

