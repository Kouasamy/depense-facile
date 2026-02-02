# 📧 Configuration des Emails Supabase vs Resend

## 🔍 Problème Identifié

Tu reçois l'email de **confirmation Supabase** au lieu de l'email de **bienvenue personnalisé Resend**.

**Pourquoi ?** Supabase envoie automatiquement un email de confirmation si cette option est activée dans les paramètres.

---

## 📨 Les Deux Types d'Emails

### **1. Email de Confirmation Supabase** (Celui que tu reçois actuellement)

- **Qui l'envoie** : Supabase Auth automatiquement
- **Quand** : Lors de l'inscription (si email confirmation activé)
- **Contenu** : Lien de confirmation standard Supabase
- **But** : Confirmer l'email de l'utilisateur

### **2. Email de Bienvenue Personnalisé Resend** (Celui que tu veux)

- **Qui l'envoie** : Resend (via notre code)
- **Quand** : Après l'inscription réussie
- **Contenu** : Email personnalisé avec design GèreTonDjai
- **But** : Accueillir l'utilisateur avec style

---

## ✅ Solution : Désactiver l'Email de Confirmation Supabase

### **Option 1 : Désactiver dans Supabase Dashboard (RECOMMANDÉ)**

1. **Va sur [https://app.supabase.com](https://app.supabase.com)**
2. **Ouvre ton projet**
3. **Va dans Authentication → Settings** (ou **Settings → Auth**)
4. **Cherche "Email Auth"** ou **"Email Confirmation"**
5. **Désactive "Enable email confirmations"** ou **"Confirm email"**
6. **Sauvegarde les changements**

**Résultat** : Supabase n'enverra plus d'email de confirmation automatique.

### **Option 2 : Modifier le Code pour Désactiver la Confirmation**

Dans `src/lib/supabase.ts`, modifie la fonction `signUp` :

```typescript
export async function signUp(email: string, password: string, name: string) {
  const client = getSupabaseClient()
  if (!client) {
    return { user: null, error: 'Supabase not configured' }
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Désactive la redirection email
      data: {
        name
      }
    }
  })

  if (error) {
    return { user: null, error: error.message }
  }

  return { user: data.user, error: null }
}
```

---

## 🔧 Vérifier la Configuration Email Supabase

### **Dans Supabase Dashboard :**

1. **Va dans Authentication → Settings**
2. **Section "Email Auth"** :
   - **Enable email confirmations** : Désactive cette option
   - **Enable email change confirmations** : Désactive aussi
3. **Section "Email Templates"** :
   - Tu peux voir les templates Supabase
   - Mais on utilise Resend pour les emails personnalisés

---

## 📧 Pourquoi tu Reçois les Deux Emails ?

### **Ordre d'Envoi :**

1. **Inscription** → Supabase crée le compte
2. **Email Supabase** → Envoyé automatiquement (si confirmation activée)
3. **Email Resend** → Envoyé par notre code après inscription réussie

### **Problème Actuel :**

- ✅ L'email Resend est bien envoyé (vérifie tes spams)
- ⚠️ L'email Supabase est aussi envoyé (par défaut)
- ⚠️ L'email Supabase peut arriver en premier

---

## ✅ Solution Complète

### **Étape 1 : Désactiver l'Email de Confirmation Supabase**

1. **Supabase Dashboard → Authentication → Settings**
2. **Désactive "Enable email confirmations"**
3. **Sauvegarde**

### **Étape 2 : Vérifier que Resend Fonctionne**

1. **Ouvre la console** (`F12` → Console)
2. **Crée un compte**
3. **Regarde les messages** :
   - ✅ `📧 Sending welcome email to: [email]`
   - ✅ `✅ Welcome email sent successfully`

4. **Vérifie ta boîte mail** (et les spams)
5. **Vérifie dans Resend Dashboard** : [https://resend.com/emails](https://resend.com/emails)

### **Étape 3 : Si l'Email Resend n'Arrive Pas**

1. **Vérifie la configuration Resend** :
   - `.env` contient `VITE_RESEND_API_KEY`
   - La clé est valide

2. **Vérifie les logs Resend** :
   - Va sur [https://resend.com/emails](https://resend.com/emails)
   - Regarde si l'email apparaît
   - Vérifie le statut (Delivered, Pending, Failed)

3. **Vérifie le domaine** :
   - Si `noreply@geretondjai.com` n'est pas vérifié, utilise `onboarding@resend.dev`

---

## 🎯 Résultat Attendu

Après avoir désactivé l'email de confirmation Supabase :

- ❌ **Plus d'email Supabase** de confirmation
- ✅ **Email Resend personnalisé** avec design GèreTonDjai
- ✅ **Email de bienvenue** avec guide et liens

---

## 📝 Configuration Recommandée

### **Dans Supabase :**
- ✅ **Email confirmations** : **DÉSACTIVÉ** (on utilise Resend)
- ✅ **Email change confirmations** : **DÉSACTIVÉ**
- ✅ **Magic Link** : Optionnel (selon tes besoins)

### **Dans Resend :**
- ✅ **Email de bienvenue** : Activé (notre code)
- ✅ **Alertes budget** : Activé (notre code)
- ✅ **Conseils quotidiens** : Activé (notre code)

---

## 🐛 Dépannage

### **Je reçois toujours l'email Supabase ?**

1. Vérifie que tu as bien désactivé dans **Authentication → Settings**
2. Redémarre l'application
3. Vérifie que les changements sont sauvegardés

### **Je ne reçois pas l'email Resend ?**

1. Vérifie la console pour les messages d'erreur
2. Vérifie dans Resend Dashboard si l'email est envoyé
3. Vérifie les spams
4. Vérifie que `VITE_RESEND_API_KEY` est bien dans `.env`

### **Les deux emails arrivent ?**

- C'est normal si tu n'as pas encore désactivé l'email Supabase
- Désactive-le dans les settings Supabase
- Tu ne recevras plus que l'email Resend personnalisé

---

**Une fois l'email Supabase désactivé, tu ne recevras plus que l'email de bienvenue personnalisé ! 🎉**

