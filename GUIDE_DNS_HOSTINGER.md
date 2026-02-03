# 📍 Guide : Où ajouter les enregistrements DNS sur Hostinger

## 🎯 Accès à la Zone DNS

### Méthode 1 : Via Domaines (Recommandé)

1. Connectez-vous à **hPanel** (https://hpanel.hostinger.com)
2. Dans le menu de gauche, cliquez sur **Domaines**
3. Trouvez votre domaine `geretondjai.com` dans la liste
4. Cliquez sur **Gérer** (ou l'icône ⚙️)
5. Allez dans l'onglet **Zone DNS** (ou **DNS** ou **Enregistrements DNS**)

### Méthode 2 : Via Hébergement

1. **hPanel** → **Hébergement Web**
2. Cliquez sur **Gérer** à côté de votre site
3. Allez dans **Avancé** → **Zone DNS**

### Méthode 3 : Si vous ne voyez pas "Zone DNS"

Certains plans Hostinger n'ont pas accès direct à la Zone DNS. Dans ce cas :

1. **Contactez le support Hostinger** via le chat
2. Demandez-leur d'ajouter ces enregistrements pour vous :
   - SPF : `v=spf1 include:hostinger.com ~all`
   - DKIM : (la clé fournie dans Email → Domaines → DKIM)
   - DMARC : `v=DMARC1; p=none; rua=mailto:contact@xn--gretondjai-z6a.com`

## 📝 Comment ajouter un enregistrement

Une fois dans la Zone DNS :

1. Cliquez sur **Ajouter un enregistrement** (ou **+ Ajouter** ou **Nouveau**)
2. Sélectionnez le **Type** : `TXT`
3. Dans **Nom** (ou **Host**), entrez :
   - Pour SPF : `@` ou laissez vide
   - Pour DKIM : `default._domainkey` (ou le nom fourni par Hostinger)
   - Pour DMARC : `_dmarc` (avec l'underscore au début !)
4. Dans **Valeur** (ou **Contenu**), collez la valeur
5. Laissez **TTL** par défaut (3600) ou modifiez si nécessaire
6. Cliquez sur **Enregistrer** (ou **Ajouter**)

## ✅ Vérification

Après avoir ajouté les enregistrements :

1. Attendez **5-10 minutes** pour la propagation DNS
2. Testez sur :
   - https://mxtoolbox.com/spf.aspx (pour SPF)
   - https://mxtoolbox.com/dkim.aspx (pour DKIM)
   - https://mxtoolbox.com/dmarc.aspx (pour DMARC)

## 🆘 Si vous ne trouvez toujours pas

**Option 1 : Support Hostinger**
- Chat en direct dans hPanel
- Demandez : "Je veux ajouter des enregistrements DNS (SPF, DKIM, DMARC) pour mon domaine"

**Option 2 : Vérifier votre plan**
- Certains plans Hostinger incluent la gestion DNS
- Vérifiez dans **Domaines** → **Paramètres** si la gestion DNS est activée

**Option 3 : Utiliser un sous-domaine**
- Si la gestion DNS n'est pas disponible, vous pouvez utiliser un sous-domaine pour les emails
- Contactez le support pour plus d'infos

