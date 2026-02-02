# Configuration Email - GèreTonDjai

## 📧 Système d'envoi d'emails avec Resend

L'application utilise **Resend** pour envoyer des emails réels aux utilisateurs.

### 🚀 Configuration

#### 1. Créer un compte Resend

1. Va sur [https://resend.com](https://resend.com)
2. Crée un compte gratuit (3000 emails/mois gratuits)
3. Vérifie ton email
4. Va dans "API Keys" et crée une nouvelle clé API

#### 2. Configurer le domaine (Optionnel mais recommandé)

Pour envoyer depuis ton propre domaine (ex: noreply@geretondjai.com) :

1. Va dans "Domains" sur Resend
2. Ajoute ton domaine
3. Configure les enregistrements DNS (SPF, DKIM, DMARC)
4. Attends la vérification (quelques minutes)

**Alternative** : Tu peux utiliser l'email par défaut de Resend : `onboarding@resend.dev`

#### 3. Variables d'environnement

Ajoute dans ton fichier `.env` ou `.env.production` :

```env
# Resend API Key
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email d'envoi (optionnel)
VITE_EMAIL_FROM=noreply@geretondjai.com
VITE_EMAIL_FROM_NAME=GèreTonDjai

# URL de l'API Resend (par défaut)
VITE_RESEND_API_URL=https://api.resend.com
```

#### 4. Pour Hostinger (Production)

1. Connecte-toi à ton cPanel Hostinger
2. Va dans "Variables d'environnement" ou "Env"
3. Ajoute les variables ci-dessus
4. Redémarre l'application si nécessaire

### 📝 Types d'emails envoyés

L'application envoie automatiquement :

1. **Email de bienvenue** - Quand un utilisateur s'inscrit
2. **Alertes de budget** - Quand un budget est dépassé ou proche de la limite
3. **Conseils quotidiens** - Un conseil financier chaque jour
4. **Notifications importantes** - Alertes de dépenses, épargne, etc.

### 🔧 Utilisation dans le code

```typescript
import { emailService } from '../services/emailService'

// Envoyer un email simple
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Sujet',
  html: '<p>Contenu HTML</p>'
})

// Envoyer une notification
await emailService.sendNotificationEmail('user@example.com', {
  title: 'Titre',
  message: 'Message',
  type: 'info',
  category: 'budget'
})
```

### ✅ Vérification

Pour tester si le service est configuré :

```typescript
if (emailService.isConfigured()) {
  console.log('Email service ready!')
} else {
  console.warn('Email service not configured')
}
```

### 🎨 Personnalisation des templates

Les templates d'emails sont dans `src/services/emailService.ts`. Tu peux modifier :
- Les couleurs
- Le design
- Le contenu
- Les icônes

### 📊 Alternatives à Resend

Si tu préfères un autre service :

1. **SendGrid** - Gratuit jusqu'à 100 emails/jour
2. **Mailgun** - Gratuit jusqu'à 5000 emails/mois
3. **Amazon SES** - Payant mais très économique
4. **Supabase Email** - Si tu utilises Supabase Auth

Pour changer de service, modifie `src/services/emailService.ts`

### 🔒 Sécurité

- ⚠️ **NE JAMAIS** commiter la clé API dans Git
- ✅ Utilise toujours des variables d'environnement
- ✅ Ajoute `.env` dans `.gitignore`
- ✅ Utilise des clés API différentes pour dev/prod

### 📈 Limites Resend (Gratuit)

- 3000 emails/mois
- 100 emails/jour
- Support email de base
- Pas de tracking avancé

Pour plus, passe au plan payant.

### 🐛 Dépannage

**Les emails ne partent pas ?**
1. Vérifie que `VITE_RESEND_API_KEY` est bien défini
2. Vérifie que la clé API est valide
3. Regarde la console pour les erreurs
4. Vérifie les logs Resend dans le dashboard

**Erreur "Email service not configured" ?**
- La variable d'environnement n'est pas chargée
- Vérifie le fichier `.env`
- Redémarre le serveur de dev

**Les emails arrivent en spam ?**
- Configure SPF, DKIM, DMARC
- Utilise un domaine vérifié
- Évite les mots déclencheurs de spam
- Demande aux utilisateurs d'ajouter à leurs contacts

### 📚 Documentation

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)

### 🎯 Prochaines améliorations

- [ ] Préférences utilisateur pour activer/désactiver les emails
- [ ] Templates personnalisables
- [ ] Statistiques d'envoi
- [ ] Tracking des ouvertures et clics
- [ ] Emails transactionnels (réinitialisation mot de passe, etc.)

