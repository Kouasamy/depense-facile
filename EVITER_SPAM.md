# 📧 Éviter que les emails aillent dans les spams

## ✅ Modifications apportées au code

J'ai ajouté des en-têtes email pour améliorer la délivrabilité :
- `X-Mailer` : Identifie l'application
- `Message-ID` : Identifiant unique pour chaque email
- `Date` : Date d'envoi
- `List-Unsubscribe` : Permet de se désabonner

## 🔧 Configuration DNS OBLIGATOIRE (Hostinger)

**C'est la partie la plus importante !** Sans ces configurations DNS, vos emails iront toujours dans les spams.

### 📍 Où configurer dans Hostinger

1. Connectez-vous à **hPanel**
2. Allez dans **Domaines** → **Gérer** → **Zone DNS** (ou **DNS**)
3. Ajoutez les enregistrements suivants :

### 1. SPF (Sender Policy Framework) - OBLIGATOIRE

**⚠️ Vous ne devez avoir QU'UN SEUL enregistrement SPF !**

Si vous avez plusieurs enregistrements SPF, vous devez en garder un seul.

**Quel garder ?**

- **`v=spf1 include:_spf.mail.hostinger.com ~all`** : Plus spécifique pour les emails, ajouté automatiquement par Hostinger quand vous créez une boîte mail
- **`v=spf1 include:hostinger.com ~all`** : Plus général, celui qui était là au début

**Recommandation : Gardez `_spf.mail.hostinger.com`**

**Pourquoi ?**
- C'est l'enregistrement SPF spécifiquement conçu pour les emails Hostinger
- Il est plus précis et recommandé par Hostinger pour l'envoi d'emails SMTP
- Il est ajouté automatiquement quand vous créez une boîte mail

**Action à faire :**
1. Dans **Zone DNS**, trouvez l'enregistrement : `v=spf1 include:hostinger.com ~all` (celui qui était là au début)
2. **Supprimez-le** (cliquez sur la poubelle 🗑️)
3. **Gardez uniquement** : `v=spf1 include:_spf.mail.hostinger.com ~all`

**Alternative : Si vous préférez garder l'ancien**
Si vous voulez garder celui qui était là au début (`hostinger.com`), supprimez plutôt celui avec `_spf.mail.hostinger.com`. Les deux fonctionnent, mais `_spf.mail.hostinger.com` est plus optimisé pour les emails.

**Vérification :**
Après suppression, vous ne devez avoir qu'un seul enregistrement SPF avec `@` comme nom.

### 2. DKIM (DomainKeys Identified Mail) - OBLIGATOIRE

**Étape 1** : Récupérez la clé DKIM depuis Hostinger
- hPanel → **Email** → **Domaines** → Cliquez sur votre domaine
- Cherchez la section **DKIM**
- Copiez la clé publique (elle commence par `v=DKIM1;`)

**Étape 2** : Ajoutez-la dans la Zone DNS
```
Type: TXT
Nom: default._domainkey (ou le nom fourni par Hostinger)
Valeur: [Collez la clé DKIM complète ici]
TTL: 3600
```

### 3. DMARC (Domain-based Message Authentication) - RECOMMANDÉ

**Vous avez déjà un enregistrement DMARC ! Il faut juste le modifier :**

1. **hPanel** → **Domaines** → **Gérer** → **Zone DNS**
2. Trouvez l'enregistrement existant : `_dmarc` avec la valeur `v=DMARC1; p=none`
3. Cliquez sur **Modifier** (ou l'icône ✏️) à côté de cet enregistrement
4. Modifiez la **Valeur** pour ajouter le rapport :
   ```
   v=DMARC1; p=none; rua=mailto:contact@xn--gretondjai-z6a.com
   ```
5. Cliquez sur **Enregistrer**

**⚠️ Important** : 
- Ne créez **PAS** un nouveau DMARC, modifiez celui qui existe déjà
- Gardez `p=none` pour l'instant (mode test)
- Le `rua=mailto:...` permet de recevoir les rapports DMARC dans votre boîte mail

**Explication des valeurs** :
- `p=none` : Mode test (recommandé au début) - Les emails passent même s'ils échouent l'authentification
- `p=quarantine` : Les emails non authentifiés vont en quarantaine (spam) - À utiliser après vérification
- `p=reject` : Rejette complètement les emails non authentifiés - Plus strict, à utiliser quand tout est vérifié
- `rua=mailto:...` : Adresse email pour recevoir les rapports DMARC (utile pour voir qui envoie des emails en votre nom)

**💡 Astuce** : Si vous ne voyez pas "Zone DNS", cherchez :
- **DNS** dans le menu
- **Enregistrements DNS**
- **Gestion DNS**
- Ou contactez le support Hostinger pour activer la gestion DNS

### 4. Vérification

Attendez 5-10 minutes après avoir ajouté les enregistrements, puis testez :
- https://mxtoolbox.com/spf.aspx (pour SPF)
- https://mxtoolbox.com/dkim.aspx (pour DKIM)
- https://mxtoolbox.com/dmarc.aspx (pour DMARC)

## 📋 Autres recommandations

### 1. Utiliser un email "from" valide

Assurez-vous que l'email utilisé dans `EMAIL_FROM` existe vraiment dans Hostinger :
- Créez l'email `contact@xn--gretondjai-z6a.com` dans Hostinger
- Utilisez le mot de passe de cette boîte mail

### 2. Éviter les mots déclencheurs de spam

Dans le contenu de vos emails :
- Évitez les mots comme "GRATUIT", "CLIQUEZ ICI", "URGENT"
- Utilisez un HTML propre et valide
- Incluez toujours une version texte

### 3. Tester la délivrabilité

Utilisez des outils comme :
- https://www.mail-tester.com
- Envoyez un email à l'adresse fournie et vérifiez le score

### 4. Réchauffer votre domaine

Si c'est un nouveau domaine :
- Commencez par envoyer quelques emails par jour
- Augmentez progressivement le volume
- Les emails personnels (bienvenue) sont généralement mieux acceptés

## 🆘 Si les emails vont toujours dans les spams

1. **Vérifiez SPF/DKIM/DMARC** : Utilisez https://mxtoolbox.com pour vérifier
2. **Contactez Hostinger** : Demandez-leur de vérifier la configuration SMTP
3. **Vérifiez le contenu** : Testez avec mail-tester.com pour voir ce qui déclenche le spam
4. **Utilisez un service d'email transactionnel** : SendGrid, Mailgun, ou Resend (plus fiable que SMTP direct)
