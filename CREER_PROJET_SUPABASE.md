# 🚀 Guide pour Créer ou Retrouver ton Projet Supabase

Si tu n'as pas de projet "GèreTonDjai" sur Supabase, voici comment le créer ou le retrouver.

---

## 🔍 Étape 1 : Vérifier si tu as un Projet Existant

### **Option A : Vérifier les Projets Existants**

1. **Va sur [https://app.supabase.com](https://app.supabase.com)**
2. **Connecte-toi** avec ton compte
3. **Regarde la liste de tes projets**
4. **Cherche un projet** qui pourrait être le tien (même avec un autre nom)

### **Option B : Vérifier les Variables d'Environnement**

1. **Ouvre ton fichier `.env`**
2. **Cherche `VITE_SUPABASE_URL`**
3. **Si tu as une URL** (ex: `https://xxxxx.supabase.co`), note-la
4. **Va sur cette URL** pour voir si le projet existe

---

## 🆕 Étape 2 : Créer un Nouveau Projet Supabase

Si tu n'as pas de projet, crée-en un nouveau :

### **1. Créer le Projet**

1. **Va sur [https://app.supabase.com](https://app.supabase.com)**
2. **Clique sur "New Project"** (en haut à droite)
3. **Remplis les informations** :
   - **Name** : `GèreTonDjai` (ou un nom de ton choix)
   - **Database Password** : Choisis un mot de passe fort (⚠️ NOTE-LE BIEN !)
   - **Region** : Choisis la région la plus proche (Europe pour la Côte d'Ivoire)
4. **Clique sur "Create new project"**
5. **Attends 2-3 minutes** que le projet soit créé

### **2. Récupérer les Credentials**

Une fois le projet créé :

1. **Va dans Settings → API**
2. **Tu trouveras** :
   - **Project URL** : `https://xxxxx.supabase.co` (copie cette URL)
   - **anon public key** : Une longue chaîne (copie cette clé)
3. **Note ces deux valeurs** quelque part

### **3. Configurer l'Application**

1. **Ouvre ton fichier `.env`**
2. **Ajoute ou modifie** :
   ```env
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```
3. **Sauvegarde le fichier**

4. **Fais la même chose pour `.env.production`** :
   ```env
   VITE_SUPABASE_URL=https://ton-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
   ```

### **4. Configurer la Base de Données**

1. **Dans Supabase Dashboard, va dans SQL Editor**
2. **Clique sur "New query"**
3. **Ouvre le fichier `supabase/migrations/001_initial_schema.sql`**
4. **Copie tout le contenu**
5. **Colle dans l'éditeur SQL**
6. **Clique sur "Run"** (ou `Ctrl+Enter`)
7. **Vérifie que les tables sont créées** :
   - Va dans **Table Editor**
   - Tu devrais voir : `expenses`, `incomes`, `budgets`, `user_profiles`, `user_onboarding`

---

## 🔄 Étape 3 : Si tu as Déjà un Projet (Mais avec un Autre Nom)

Si tu as un projet Supabase mais avec un autre nom :

1. **Va sur [https://app.supabase.com](https://app.supabase.com)**
2. **Ouvre ton projet** (peu importe le nom)
3. **Va dans Settings → General**
4. **Tu peux renommer le projet** si tu veux
5. **Récupère les credentials** (Settings → API)
6. **Mets à jour ton `.env`** avec les bonnes valeurs

---

## ✅ Étape 4 : Vérifier la Configuration

Après avoir configuré Supabase :

1. **Redémarre ton serveur** :
   ```bash
   npm run dev
   ```

2. **Ouvre la console du navigateur** (`F12` → Console)
3. **Regarde les messages** :
   - ✅ `✅ Supabase client initialized` = Tout est OK
   - ⚠️ `⚠️ Supabase not configured` = Problème de configuration

---

## 🧹 Étape 5 : Nettoyer la Base de Données (Une Fois le Projet Créé)

Une fois que tu as créé/configuré ton projet Supabase :

1. **Va dans Authentication → Users**
2. **Supprime tous les utilisateurs** (s'il y en a)
3. **Va dans Table Editor**
4. **Supprime toutes les lignes** de chaque table :
   - `expenses`
   - `incomes`
   - `budgets`
   - `user_profiles`
   - `user_onboarding`

**OU utilise le script SQL** `VIDER_TOUT_COMPLET.sql` dans SQL Editor.

---

## 🎯 Résumé

| Situation | Action |
|-----------|--------|
| **Pas de projet** | Crée un nouveau projet sur Supabase |
| **Projet existe mais autre nom** | Utilise ce projet et mets à jour `.env` |
| **Projet supprimé** | Crée un nouveau projet |
| **Pas de compte Supabase** | Crée un compte sur supabase.com |

---

## 📝 Checklist

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Credentials récupérés (URL + clé anon)
- [ ] `.env` configuré avec les credentials
- [ ] `.env.production` configuré avec les credentials
- [ ] Schéma de base de données installé (SQL Editor)
- [ ] Tables créées et vides
- [ ] Serveur redémarré
- [ ] Test d'inscription fonctionne

---

## 🐛 Dépannage

### **Je ne trouve pas mes credentials ?**

1. Va dans **Settings → API**
2. Tu trouveras :
   - **Project URL** : En haut de la page
   - **anon public key** : Dans la section "Project API keys"

### **Le script SQL ne fonctionne pas ?**

1. Vérifie que tu es bien dans le bon projet
2. Vérifie que le fichier `001_initial_schema.sql` existe
3. Copie-colle le contenu ligne par ligne si nécessaire

### **Les tables ne se créent pas ?**

1. Vérifie les erreurs dans SQL Editor
2. Exécute les commandes une par une
3. Vérifie que l'extension UUID est activée

---

**Une fois le projet créé et configuré, tu pourras nettoyer la base de données et tester l'inscription ! 🚀**

