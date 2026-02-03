# 📧 Configuration SMTP Hostinger

## Paramètres SMTP officiels de Hostinger

### Pour les emails professionnels (Business Email)

**Serveur SMTP sortant (pour envoyer des emails) :**
- **Hôte SMTP** : `smtp.hostinger.com`
- **Port SSL** : `465` (avec SSL/TLS)
- **Port TLS** : `587` (avec STARTTLS) ⭐ **Recommandé**
- **Sécurité** : SSL/TLS requis
- **Authentification** : Oui (nom d'utilisateur et mot de passe requis)

**Serveur SMTP entrant (pour recevoir des emails) :**
- **Hôte IMAP** : `imap.hostinger.com`
- **Port IMAP** : `993` (SSL)
- **Hôte POP3** : `pop.hostinger.com`
- **Port POP3** : `995` (SSL)

### Informations d'authentification

- **Nom d'utilisateur SMTP** : Votre adresse email complète (ex: `contact@gèretondjai.com`)
  - ⚠️ Pour les emails avec caractères spéciaux (comme `gèretondjai.com`), utilisez le format Punycode : `contact@xn--gretondjai-z6a.com`
  
- **Mot de passe SMTP** : Le mot de passe de votre boîte mail Hostinger

### Configuration recommandée pour votre projet

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@gèretondjai.com
SMTP_PASSWORD=votre_mot_de_passe_mailbox
EMAIL_FROM=contact@gèretondjai.com
EMAIL_FROM_NAME=GèreTonDjai-CI
```

### Notes importantes

1. **Port 587 vs 465** :
   - Port **587** (TLS/STARTTLS) : Recommandé par Hostinger, plus compatible
   - Port **465** (SSL) : Fonctionne aussi, mais peut avoir des problèmes avec certains serveurs

2. **Email avec caractères spéciaux** :
   - Si votre domaine contient des caractères spéciaux (comme `gèretondjai.com`), le code convertit automatiquement en Punycode pour l'authentification SMTP
   - Format Punycode : `contact@xn--gretondjai-z6a.com`

3. **Authentification** :
   - Vous DEVEZ utiliser votre adresse email complète comme nom d'utilisateur
   - Le mot de passe est celui de votre boîte mail Hostinger

4. **Sécurité** :
   - SSL/TLS est obligatoire
   - Ne partagez JAMAIS votre mot de passe SMTP publiquement

### Vérification

Pour vérifier que votre configuration est correcte :
1. Testez l'envoi d'un email depuis votre application
2. Vérifiez les logs du serveur pour voir les erreurs éventuelles
3. Vérifiez votre boîte mail pour confirmer la réception

### Dépannage

**Erreur "Authentication failed"** :
- Vérifiez que `SMTP_USER` est votre adresse email complète
- Vérifiez que `SMTP_PASSWORD` est correct
- Essayez le format Punycode si votre email contient des caractères spéciaux

**Erreur "Connection timeout"** :
- Vérifiez que `SMTP_HOST` est `smtp.hostinger.com`
- Vérifiez que le port est `587` ou `465`
- Vérifiez que votre serveur peut se connecter à Internet

**Aucun email n'est envoyé** :
- Vérifiez les logs du serveur Node.js
- Vérifiez que le serveur email est bien démarré
- Vérifiez que les variables d'environnement sont correctement configurées

