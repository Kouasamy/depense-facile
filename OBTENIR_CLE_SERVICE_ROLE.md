# 🔑 Obtenir la Clé SERVICE_ROLE pour Supprimer les Utilisateurs

## ⚠️ Pourquoi j'ai besoin de cette clé ?

La clé **anon** (que tu as dans `.env`) permet seulement de lire/écrire des données, mais **PAS de supprimer des utilisateurs**.

Pour supprimer les utilisateurs, j'ai besoin de la clé **SERVICE_ROLE** qui a les droits admin complets.

---

## 📋 Étapes pour Obtenir la Clé SERVICE_ROLE

### **Étape 1 : Accéder aux Settings API**

1. Va sur [https://app.supabase.com](https://app.supabase.com)
2. Ouvre ton projet **GèreTonDjai**
3. Va dans **Settings** (⚙️ en bas à gauche)
4. Clique sur **API**

### **Étape 2 : Copier la Clé SERVICE_ROLE**

1. Dans la section **"Project API keys"**, tu verras :
   - **anon** `public` (celle que tu as déjà)
   - **service_role** `secret` (celle dont j'ai besoin)

2. **⚠️ ATTENTION** : La clé `service_role` est en **rouge** avec un avertissement
   - C'est une clé **SECRÈTE** avec des droits ADMIN complets
   - **NE JAMAIS** l'exposer publiquement
   - **NE JAMAIS** la commiter dans Git

3. Clique sur **"Reveal"** ou **"Afficher"** pour voir la clé
4. **Copie la clé complète** (elle commence par `eyJ...`)

### **Étape 3 : Créer le Fichier .env.local**

1. À la racine du projet, crée un fichier `.env.local`
2. Ajoute ces lignes :

```env
SUPABASE_URL=https://xghetfduattzfcladnzm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role_ici
```

3. Remplace `ta_cle_service_role_ici` par la clé que tu as copiée

### **Étape 4 : Vérifier que le Fichier est Créé**

Le fichier `.env.local` devrait contenir :

```env
SUPABASE_URL=https://xghetfduattzfcladnzm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT** : 
- Le fichier `.env.local` est déjà dans `.gitignore` (il ne sera pas commité)
- Ne partage JAMAIS cette clé
- Ne la mets JAMAIS dans `.env` (qui pourrait être commité)

---

## ✅ Une Fois la Clé Ajoutée

1. **Relance le script** :
   ```bash
   node verifier-et-supprimer-utilisateurs.js
   ```

2. Le script va :
   - ✅ Lister tous les utilisateurs
   - ✅ Te demander confirmation
   - ✅ Supprimer tous les utilisateurs
   - ✅ Vérifier que tout est supprimé

---

## 🔒 Sécurité

### **Pourquoi .env.local et pas .env ?**

- `.env` : Peut être commité dans Git (risque)
- `.env.local` : Déjà dans `.gitignore` (sécurisé)

### **Que faire si j'ai déjà mis la clé dans .env ?**

1. Déplace-la dans `.env.local`
2. Supprime-la de `.env`
3. Vérifie que `.env.local` est dans `.gitignore`

---

## 🎯 Résumé Rapide

1. **Supabase Dashboard** → **Settings** → **API**
2. **Copie la clé `service_role`** (secret, rouge)
3. **Crée `.env.local`** avec :
   ```env
   SUPABASE_SERVICE_ROLE_KEY=ta_cle_ici
   ```
4. **Relance** : `node verifier-et-supprimer-utilisateurs.js`

---

**Une fois la clé ajoutée, dis-moi et je relancerai le script pour supprimer tous les utilisateurs ! 🚀**

