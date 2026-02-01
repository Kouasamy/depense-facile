# Guide de Configuration Supabase pour Gère Ton Djai

Ce guide vous explique comment configurer Supabase pour sécuriser et synchroniser les données de l'application.

## 🚀 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name** : Gère Ton Djai (ou un nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (notez-le !)
   - **Region** : Choisissez la région la plus proche (Europe pour la Côte d'Ivoire)
5. Cliquez sur "Create new project"
6. Attendez que le projet soit créé (2-3 minutes)

### 2. Récupérer les Credentials

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Vous trouverez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : Une longue chaîne de caractères
3. Copiez ces deux valeurs

### 3. Configurer la Base de Données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql` de ce projet
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)
7. Vérifiez que toutes les tables ont été créées :
   - Allez dans **Table Editor** pour voir les tables :
     - `expenses`
     - `incomes`
     - `budgets`
     - `user_profiles`
     - `user_onboarding`

### 4. Vérifier la Sécurité (RLS)

1. Dans **Table Editor**, cliquez sur une table (par exemple `expenses`)
2. Allez dans l'onglet **Policies**
3. Vous devriez voir des politiques comme :
   - "Users can view their own expenses"
   - "Users can insert their own expenses"
   - "Users can update their own expenses"
   - "Users can delete their own expenses"
4. Vérifiez que toutes les tables ont ces politiques

### 5. Configurer l'Application

1. À la racine du projet, créez un fichier `.env`
2. Ajoutez vos credentials :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

3. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables utilisent **Row Level Security** pour garantir que :
- Chaque utilisateur ne peut voir que ses propres données
- Chaque utilisateur ne peut modifier que ses propres données
- Les données sont automatiquement filtrées par `user_id`

### Authentification

- Les mots de passe sont hashés avec bcrypt par Supabase
- Les sessions sont gérées automatiquement
- Les tokens sont rafraîchis automatiquement
- La déconnexion invalide les sessions

## 📊 Structure de la Base de Données

### Tables Principales

- **expenses** : Dépenses des utilisateurs
- **incomes** : Revenus des utilisateurs
- **budgets** : Budgets définis par les utilisateurs
- **user_profiles** : Profils utilisateurs (nom, avatar, onboarding)
- **user_onboarding** : Statut d'onboarding des utilisateurs

### Synchronisation

- Les données sont stockées localement dans IndexedDB (Dexie)
- Les modifications sont mises en file d'attente pour synchronisation
- La synchronisation se fait automatiquement quand la connexion est disponible
- Les conflits sont résolus avec la stratégie "server-wins"

## 🧪 Tester la Configuration

1. Lancez l'application : `npm run dev`
2. Créez un compte avec un email et mot de passe
3. Vérifiez dans Supabase :
   - **Authentication** → **Users** : Votre utilisateur devrait apparaître
   - **Table Editor** → **user_profiles** : Votre profil devrait être créé
4. Ajoutez une dépense dans l'application
5. Vérifiez dans **Table Editor** → **expenses** : Votre dépense devrait apparaître

## 🐛 Dépannage

### Erreur "Supabase not configured"
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur de développement

### Erreur "Row Level Security policy violation"
- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que vous êtes bien connecté (authentifié)

### Les données ne se synchronisent pas
- Vérifiez votre connexion internet
- Ouvrez la console du navigateur pour voir les erreurs
- Vérifiez que les credentials Supabase sont corrects

## 📝 Notes Importantes

- ⚠️ Ne partagez jamais votre clé `service_role` (clé secrète)
- ✅ Utilisez uniquement la clé `anon` dans l'application
- ✅ Les données sont automatiquement sauvegardées dans Supabase
- ✅ L'application fonctionne hors ligne et synchronise quand la connexion revient

## 🔗 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

