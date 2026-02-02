# Test du système d'envoi d'emails

## ✅ Configuration terminée

La clé API Resend a été configurée dans le fichier `.env`.

## 🧪 Comment tester

### 1. Démarrer l'application en mode développement

```bash
npm run dev
```

### 2. Tester l'envoi d'email de bienvenue

1. Crée un nouveau compte avec un email réel
2. Vérifie ta boîte email (et les spams au cas où)
3. Tu devrais recevoir un email de bienvenue avec le design de GèreTonDjai

### 3. Tester les alertes de budget

1. Connecte-toi à l'application
2. Va dans "Budgets" et définis un budget pour une catégorie
3. Ajoute des dépenses jusqu'à dépasser 90% du budget
4. Tu devrais recevoir un email d'alerte

### 4. Tester les conseils quotidiens

1. Connecte-toi à l'application
2. Attends le lendemain ou change la date dans le code
3. Tu devrais recevoir un email avec le conseil du jour

## 🔍 Vérification dans Resend

1. Va sur [https://resend.com/emails](https://resend.com/emails)
2. Connecte-toi à ton compte
3. Tu verras tous les emails envoyés avec leur statut :
   - ✅ Delivered (livré)
   - ⏳ Pending (en attente)
   - ❌ Failed (échoué)

## 🐛 Dépannage

### Les emails ne partent pas ?

1. **Vérifie la console du navigateur**
   - Ouvre les DevTools (F12)
   - Regarde l'onglet Console
   - Cherche les erreurs liées à "email" ou "resend"

2. **Vérifie la clé API**
   - Le fichier `.env` doit contenir `VITE_RESEND_API_KEY=re_2MLUE38i_GLsXv5MqjKgeYkzwz5XTdSrQ`
   - Redémarre le serveur de dev après modification

3. **Vérifie dans Resend Dashboard**
   - Va sur https://resend.com/emails
   - Regarde si les emails apparaissent
   - Vérifie les erreurs éventuelles

4. **Vérifie l'email d'envoi**
   - Par défaut, utilise `onboarding@resend.dev` si tu n'as pas configuré de domaine
   - Change `VITE_EMAIL_FROM` dans `.env` si nécessaire

### Erreur "Email service not configured" ?

- La variable d'environnement n'est pas chargée
- Redémarre le serveur : `npm run dev`
- Vérifie que le fichier `.env` est à la racine du projet

### Les emails arrivent en spam ?

- C'est normal au début avec `onboarding@resend.dev`
- Configure ton propre domaine dans Resend pour améliorer la délivrabilité
- Demande aux utilisateurs d'ajouter à leurs contacts

## 📧 Types d'emails configurés

- ✅ Email de bienvenue (à l'inscription)
- ✅ Alertes de budget (dépassement ou proche limite)
- ✅ Conseils quotidiens
- ✅ Notifications importantes

## 🎯 Prochaines étapes

1. **Tester avec un compte réel**
   - Crée un compte avec ton email
   - Vérifie que l'email de bienvenue arrive

2. **Configurer ton domaine** (optionnel mais recommandé)
   - Ajoute ton domaine dans Resend
   - Configure les DNS
   - Change `VITE_EMAIL_FROM` dans `.env`

3. **Surveiller les envois**
   - Vérifie régulièrement le dashboard Resend
   - Surveille le taux de délivrabilité
   - Ajuste selon les retours

## 📊 Limites Resend (Gratuit)

- ✅ 3000 emails/mois
- ✅ 100 emails/jour
- ✅ Suivi des envois
- ✅ Templates HTML

Si tu dépasses ces limites, passe au plan payant.

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne partage JAMAIS ta clé API publiquement !

- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Ne commite jamais le fichier `.env`
- ✅ Utilise des clés différentes pour dev/prod

