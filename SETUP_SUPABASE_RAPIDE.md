# 🚀 Configuration Rapide de Supabase - GèreTonDjai

Guide étape par étape pour créer et configurer ton projet Supabase.

---

## 📋 Étape 1 : Créer un Compte Supabase (Si tu n'en as pas)

1. **Va sur [https://supabase.com](https://supabase.com)**
2. **Clique sur "Start your project"** ou **"Sign in"**
3. **Crée un compte** (gratuit) avec GitHub, Google, ou email
4. **Confirme ton email** si nécessaire

---

## 🆕 Étape 2 : Créer un Nouveau Projet

1. **Une fois connecté, clique sur "New Project"** (bouton vert en haut à droite)
2. **Remplis le formulaire** :
   - **Name** : `GèreTonDjai` (ou un nom de ton choix)
   - **Database Password** : 
     - ⚠️ **IMPORTANT** : Choisis un mot de passe fort
     - ⚠️ **NOTE-LE BIEN** quelque part (tu en auras besoin)
     - Exemple : `MonMotDePasse123!@#`
   - **Region** : 
     - Choisis **Europe (West)** ou **Europe (Central)** (le plus proche de la Côte d'Ivoire)
   - **Pricing Plan** : **Free** (gratuit)
3. **Clique sur "Create new project"**
4. **Attends 2-3 minutes** que le projet soit créé (tu verras une barre de progression)

---

## 🔑 Étape 3 : Récupérer les Credentials

Une fois le projet créé :

1. **Dans le Dashboard Supabase, va dans Settings** (icône ⚙️ en bas à gauche)
2. **Clique sur "API"** dans le menu de gauche
3. **Tu trouveras deux choses importantes** :

   ### **Project URL**
   - C'est l'URL de ton projet
   - Format : `https://xxxxxxxxxxxxx.supabase.co`
   - **Copie cette URL** 📋

   ### **Project API keys**
   - **anon public** : C'est la clé publique (celle que tu utiliseras)
   - Format : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (très longue)
   - **Copie cette clé** 📋

4. **⚠️ IMPORTANT** : Ne copie JAMAIS la clé **service_role** (c'est secret !)

---

## ⚙️ Étape 4 : Configurer l'Application

### **1. Mettre à jour le fichier `.env`**

1. **Ouvre le fichier `.env`** à la racine du projet
2. **Ajoute ou modifie** ces lignes :
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```
3. **Remplace** :
   - `https://ton-projet-id.supabase.co` par ton **Project URL**
   - `ta_cle_anon_ici` par ta **anon public key**
4. **Sauvegarde le fichier**

### **2. Mettre à jour le fichier `.env.production`**

1. **Ouvre le fichier `.env.production`**
2. **Ajoute les mêmes lignes** :
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```
3. **Sauvegarde le fichier**

---

## 🗄️ Étape 5 : Créer les Tables dans Supabase

1. **Dans Supabase Dashboard, va dans SQL Editor** (icône SQL dans le menu de gauche)
2. **Clique sur "New query"**
3. **Ouvre le fichier `supabase/migrations/001_initial_schema.sql`** de ton projet
4. **Sélectionne tout le contenu** (`Ctrl+A`) et **copie** (`Ctrl+C`)
5. **Colle dans l'éditeur SQL** de Supabase (`Ctrl+V`)
6. **Clique sur "Run"** (ou appuie sur `Ctrl+Enter`)
7. **Attends quelques secondes** que le script s'exécute
8. **Tu devrais voir** : "Success. No rows returned"

### **Vérifier que les Tables sont Créées**

1. **Va dans Table Editor** (icône table dans le menu de gauche)
2. **Tu devrais voir ces tables** :
   - ✅ `expenses`
   - ✅ `incomes`
   - ✅ `budgets`
   - ✅ `user_profiles`
   - ✅ `user_onboarding`

---

## 🧹 Étape 6 : Nettoyer la Base de Données (Pour Partir de Zéro)

Maintenant que tout est configuré, nettoie la base de données :

### **Option A : Via Table Editor (Simple)**

1. **Va dans Table Editor**
2. **Pour chaque table** :
   - Clique sur la table
   - Clique sur "..." (menu) → "Delete all rows"
   - Confirme

### **Option B : Via SQL Editor (Rapide)**

1. **Va dans SQL Editor → New query**
2. **Copie et colle ce code** :
   ```sql
   -- Supprimer toutes les données
   DELETE FROM expenses;
   DELETE FROM incomes;
   DELETE FROM budgets;
   DELETE FROM user_profiles;
   DELETE FROM user_onboarding;
   
   -- Supprimer tous les utilisateurs Auth
   DELETE FROM auth.users;
   ```
3. **Clique sur "Run"**

**⚠️ Si tu as une erreur pour `DELETE FROM auth.users`**, supprime les utilisateurs manuellement :
- Va dans **Authentication → Users**
- Sélectionne tous et supprime

---

## ✅ Étape 7 : Tester la Configuration

1. **Redémarre ton serveur de développement** :
   ```bash
   # Arrête le serveur (Ctrl+C)
   npm run dev
   ```

2. **Ouvre la console du navigateur** (`F12` → Console)
3. **Regarde les messages** :
   - ✅ `✅ Supabase client initialized` = Tout est OK !
   - ⚠️ `⚠️ Supabase not configured` = Vérifie ton `.env`

4. **Teste l'inscription** :
   - Crée un compte avec ton email
   - Vérifie dans Supabase : **Authentication → Users** → Tu devrais voir ton compte
   - Vérifie ta boîte mail : Tu devrais recevoir un email de bienvenue

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

## 🎯 Checklist Complète

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Project URL copiée
- [ ] anon public key copiée
- [ ] `.env` configuré avec les credentials
- [ ] `.env.production` configuré avec les credentials
- [ ] Schéma SQL exécuté dans SQL Editor
- [ ] Tables créées (vérifiées dans Table Editor)
- [ ] Base de données nettoyée (tables vides, pas d'utilisateurs)
- [ ] Serveur redémarré
- [ ] Test d'inscription réussi

---

## 🐛 Dépannage

### **Je ne trouve pas "New Project" ?**

- Tu dois être connecté à Supabase
- Vérifie que tu es sur [https://app.supabase.com](https://app.supabase.com)
- Crée un compte si nécessaire

### **Le script SQL ne fonctionne pas ?**

- Vérifie que tu es dans le bon projet
- Vérifie les erreurs dans SQL Editor
- Exécute les commandes une par une si nécessaire

### **Les variables d'environnement ne sont pas chargées ?**

- Vérifie que les variables commencent par `VITE_`
- Redémarre le serveur après modification
- Vérifie que le fichier `.env` est à la racine du projet

### **L'inscription ne fonctionne toujours pas ?**

- Vérifie que les tables sont bien créées
- Vérifie que la base de données est vide (pas d'utilisateurs)
- Vérifie la console du navigateur pour les erreurs
- Nettoie IndexedDB avec `NETTOYER_INDEXEDDB.html`

---

## 🚀 Une Fois Configuré

Après avoir suivi toutes les étapes :

1. ✅ **Supabase est configuré**
2. ✅ **Les tables sont créées**
3. ✅ **La base de données est vide**
4. ✅ **Tu peux créer un compte sans problème**
5. ✅ **Tu recevras un email de bienvenue**

**Tout est prêt ! 🎉**

