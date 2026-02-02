# 🗄️ Bases de Données Utilisées dans GèreTonDjai

## 📊 RÉPONSE DIRECTE

L'application utilise **2 bases de données** pour stocker les données :

1. **Supabase (PostgreSQL)** - Base de données cloud principale
2. **IndexedDB (via Dexie.js)** - Base de données locale (navigateur)

---

## 🗄️ BASE DE DONNÉES 1 : Supabase (PostgreSQL)

### **Type** : Base de données cloud PostgreSQL

### **Où** : Serveurs Supabase (cloud)

### **Ce qui est stocké** :

#### **1. Authentification Utilisateurs**
- **Table** : `auth.users` (gérée par Supabase Auth)
- **Contenu** :
  - ID utilisateur (UUID)
  - Email
  - Mot de passe hashé
  - Métadonnées (nom, etc.)
  - Date de création

#### **2. Dépenses**
- **Table** : `expenses`
- **Contenu** :
  - ID (UUID)
  - local_id (UUID pour synchronisation)
  - user_id (référence à auth.users)
  - amount (montant en FCFA)
  - category (catégorie)
  - subcategory (sous-catégorie)
  - description
  - payment_method (méthode de paiement)
  - date
  - sync_status
  - created_at, updated_at

#### **3. Revenus**
- **Table** : `incomes`
- **Contenu** :
  - ID (UUID)
  - local_id
  - user_id
  - amount
  - source
  - description
  - date
  - sync_status
  - created_at, updated_at

#### **4. Budgets**
- **Table** : `budgets`
- **Contenu** :
  - ID (UUID)
  - local_id
  - user_id
  - category
  - amount
  - period (daily/weekly/monthly)
  - start_date, end_date
  - sync_status
  - created_at, updated_at

#### **5. Profils Utilisateurs**
- **Table** : `user_profiles`
- **Contenu** :
  - id (référence à auth.users)
  - name
  - avatar
  - onboarding_completed
  - onboarding_completed_at
  - created_at, updated_at

#### **6. Statut d'Onboarding**
- **Table** : `user_onboarding`
- **Contenu** :
  - id (UUID)
  - user_id
  - completed
  - completed_at
  - created_at

### **Caractéristiques** :
- ✅ **Permanent** : Les données restent même après fermeture du navigateur
- ✅ **Cloud** : Accessible depuis n'importe quel appareil
- ✅ **Sécurisé** : Row Level Security (RLS) activé
- ✅ **Synchronisé** : Toutes les données sont synchronisées
- ✅ **PostgreSQL** : Base de données relationnelle puissante

---

## 💾 BASE DE DONNÉES 2 : IndexedDB (via Dexie.js)

### **Type** : Base de données locale du navigateur

### **Où** : Stockée dans le navigateur de l'utilisateur

### **Nom de la base** : `DepenseFacileDB`

### **Ce qui est stocké** :

#### **1. Dépenses (Cache Local)**
- **Table** : `expenses`
- **Contenu** : Même structure que Supabase
- **Usage** : Cache local pour mode hors ligne

#### **2. Revenus (Cache Local)**
- **Table** : `incomes`
- **Contenu** : Même structure que Supabase
- **Usage** : Cache local pour mode hors ligne

#### **3. Budgets (Cache Local)**
- **Table** : `budgets`
- **Contenu** : Même structure que Supabase
- **Usage** : Cache local pour mode hors ligne

#### **4. Statut d'Onboarding (Local)**
- **Table** : `userOnboarding`
- **Contenu** : Statut d'onboarding local
- **Usage** : Cache local

#### **5. File d'Attente de Synchronisation**
- **Table** : `syncQueue`
- **Contenu** :
  - Opérations en attente (create, update, delete)
  - Données à synchroniser
  - Nombre de tentatives
- **Usage** : Synchronisation avec Supabase

#### **6. Comptes Utilisateurs (Ancien Système - Non Utilisé)**
- **Table** : `userAccounts`
- **Contenu** : Ancien système d'authentification local
- **Status** : ⚠️ **NON UTILISÉ** (l'application utilise maintenant Supabase Auth)

#### **7. Sessions Utilisateurs (Ancien Système - Non Utilisé)**
- **Table** : `userSessions`
- **Contenu** : Ancien système de sessions local
- **Status** : ⚠️ **NON UTILISÉ** (l'application utilise maintenant Supabase Auth)

### **Caractéristiques** :
- ✅ **Local** : Stockée dans le navigateur
- ✅ **Hors ligne** : Fonctionne sans connexion internet
- ✅ **Cache** : Accès rapide aux données
- ✅ **Synchronisation** : Synchronise avec Supabase quand la connexion revient
- ⚠️ **Temporaire** : Peut être supprimée si l'utilisateur nettoie les données du navigateur

---

## 🔄 Comment les Deux Bases Fonctionnent Ensemble

### **Architecture Hybride (Offline-First)**

```
┌─────────────────────────────────────────┐
│         APPLICATION (Navigateur)         │
└─────────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────▼──────┐      ┌──────▼──────┐
    │  IndexedDB  │      │   Supabase  │
    │   (Local)   │◄────►│   (Cloud)   │
    │             │      │             │
    │ - Cache     │      │ - Permanent │
    │ - Offline   │      │ - Sync      │
    │ - Fast      │      │ - Secure    │
    └─────────────┘      └─────────────┘
```

### **Flux de Données**

1. **Création d'une Dépense** :
   - ✅ Sauvegardée d'abord dans **IndexedDB** (rapide, local)
   - ✅ Ajoutée à la file d'attente de synchronisation
   - ✅ Synchronisée avec **Supabase** en arrière-plan

2. **Lecture des Données** :
   - ✅ Chargement depuis **IndexedDB** (rapide)
   - ✅ Synchronisation avec **Supabase** pour les dernières données
   - ✅ Mise à jour d'IndexedDB avec les données Supabase

3. **Mode Hors Ligne** :
   - ✅ Les données sont stockées dans **IndexedDB**
   - ✅ Quand la connexion revient, synchronisation automatique avec **Supabase**

---

## 📊 Résumé des Bases de Données

| Base de Données | Type | Localisation | Usage Principal |
|----------------|------|--------------|-----------------|
| **Supabase (PostgreSQL)** | Cloud | Serveurs Supabase | Stockage permanent, authentification, synchronisation |
| **IndexedDB (Dexie)** | Local | Navigateur | Cache local, mode hors ligne, performance |

---

## 🎯 Où sont Stockées les Données ?

### **Données Utilisateurs (Comptes)**
- ✅ **Supabase Auth** (`auth.users`) - **PRINCIPAL**
- ⚠️ **IndexedDB** (`userAccounts`) - Ancien système, non utilisé

### **Dépenses**
- ✅ **Supabase** (`expenses`) - **PRINCIPAL** (permanent)
- ✅ **IndexedDB** (`expenses`) - Cache local (temporaire)

### **Revenus**
- ✅ **Supabase** (`incomes`) - **PRINCIPAL** (permanent)
- ✅ **IndexedDB** (`incomes`) - Cache local (temporaire)

### **Budgets**
- ✅ **Supabase** (`budgets`) - **PRINCIPAL** (permanent)
- ✅ **IndexedDB** (`budgets`) - Cache local (temporaire)

### **Profils Utilisateurs**
- ✅ **Supabase** (`user_profiles`) - **PRINCIPAL** (permanent)
- ⚠️ **IndexedDB** - Non utilisé pour les profils

---

## 🔍 Vérification dans le Code

### **Supabase (PostgreSQL)**
- **Fichier** : `src/lib/supabase.ts`
- **Bibliothèque** : `@supabase/supabase-js`
- **Tables** : Définies dans `src/lib/supabase.ts` (interface Database)

### **IndexedDB (Dexie)**
- **Fichier** : `src/db/schema.ts`
- **Bibliothèque** : `dexie` (v4.3.0)
- **Nom de la base** : `DepenseFacileDB`
- **Tables** : Définies dans `src/db/schema.ts` (classe DepenseFacileDB)

---

## ✅ Conclusion

### **Base de Données Principale** : 
**Supabase (PostgreSQL)** - C'est là que toutes les données sont stockées de manière permanente.

### **Base de Données Secondaire** :
**IndexedDB (Dexie)** - Utilisée comme cache local pour le mode hors ligne et les performances.

### **Pour Résoudre le Problème "Cet email est déjà utilisé"** :

Tu dois supprimer les utilisateurs dans **Supabase Auth** (`auth.users`), car c'est là que Supabase vérifie si un email existe déjà.

**IndexedDB ne cause PAS ce problème** car l'application utilise maintenant Supabase Auth, pas l'ancien système local.

---

**En résumé : Supabase (PostgreSQL) est la base de données principale où tout est stocké de manière permanente ! 🗄️**

