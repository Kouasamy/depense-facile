# Guide de Déploiement sur Hostinger

Ce guide vous explique comment déployer votre application Gère Ton Djai sur Hostinger avec Supabase comme base de données.

## 📋 Prérequis

1. ✅ Un compte Hostinger actif
2. ✅ Un projet Supabase configuré (voir `SUPABASE_SETUP.md`)
3. ✅ Le code poussé sur GitHub
4. ✅ Les credentials Supabase (URL et clé anon)

## 🚀 Étapes de Déploiement

### 1. Préparer le Build de Production

Avant de déployer, testez le build localement :

```bash
# Installer les dépendances
npm install

# Créer le build de production
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

### 2. Configurer Supabase (IMPORTANT)

Assurez-vous que votre base de données Supabase est bien configurée :

1. **Exécuter le script SQL** :
   - Allez dans votre projet Supabase
   - SQL Editor → Exécutez `supabase/migrations/001_initial_schema.sql`

2. **Vérifier les politiques RLS** :
   - Table Editor → Vérifiez que toutes les tables ont RLS activé
   - Vérifiez les politiques de sécurité

3. **Configurer les URLs autorisées** :
   - Settings → Authentication → URL Configuration
   - Ajoutez votre domaine Hostinger dans :
     - **Site URL** : `https://votre-domaine.com`
     - **Redirect URLs** : `https://votre-domaine.com/**`

### 3. Déployer sur Hostinger

#### Option A : Via File Manager (Recommandé)

1. **Connectez-vous à Hostinger** :
   - Allez sur hpanel.hostinger.com
   - Connectez-vous à votre compte

2. **Accédez au File Manager** :
   - Allez dans **Files** → **File Manager**
   - Ouvrez le dossier `public_html` (ou votre domaine)

3. **Supprimez les fichiers existants** (si nécessaire) :
   - Supprimez tous les fichiers dans `public_html` sauf `.htaccess` si vous en avez un

4. **Téléversez les fichiers** :
   - Compressez le dossier `dist/` en ZIP
   - Dans File Manager, cliquez sur **Upload**
   - Téléversez le ZIP
   - Extrayez le ZIP dans `public_html`
   - Supprimez le ZIP après extraction

#### Option B : Via FTP/SFTP

1. **Récupérez les identifiants FTP** :
   - Hostinger → **Files** → **FTP Accounts**
   - Notez : Host, Username, Password, Port

2. **Utilisez un client FTP** (FileZilla, WinSCP, etc.) :
   - Connectez-vous avec les identifiants
   - Naviguez vers `public_html`
   - Téléversez tous les fichiers du dossier `dist/`

### 4. Configurer les Variables d'Environnement

**IMPORTANT** : Les variables d'environnement doivent être intégrées dans le build.

#### Méthode 1 : Build avec variables (Recommandé)

1. **Créez un fichier `.env.production`** à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

2. **Build avec les variables** :

```bash
npm run build
```

Les variables seront intégrées dans le build.

3. **Déployez le dossier `dist/`**

#### Méthode 2 : Configuration via Hostinger (Alternative)

Si Hostinger supporte les variables d'environnement :
- Allez dans **Advanced** → **Environment Variables**
- Ajoutez :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 5. Configurer le Routing (SPA)

Pour que React Router fonctionne correctement, créez un fichier `.htaccess` :

1. **Créez un fichier `.htaccess`** dans `public_html` :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

2. **Téléversez le fichier** dans `public_html`

### 6. Vérifier le Déploiement

1. **Visitez votre site** : `https://votre-domaine.com`

2. **Testez les fonctionnalités** :
   - ✅ Création de compte
   - ✅ Connexion
   - ✅ Ajout de dépense
   - ✅ Synchronisation avec Supabase

3. **Vérifiez la console du navigateur** :
   - Ouvrez les DevTools (F12)
   - Onglet Console
   - Vérifiez qu'il n'y a pas d'erreurs

4. **Vérifiez Supabase** :
   - Allez dans votre projet Supabase
   - Table Editor → Vérifiez que les données apparaissent

## 🔒 Sécurité en Production

### 1. HTTPS Obligatoire

- Assurez-vous que votre domaine utilise HTTPS
- Hostinger fournit généralement un certificat SSL gratuit

### 2. Variables d'Environnement

- ⚠️ **NE JAMAIS** commiter le fichier `.env` avec les vraies clés
- ✅ Utilisez `.env.production` pour le build
- ✅ Ajoutez `.env` dans `.gitignore`

### 3. Supabase Security

- ✅ Utilisez uniquement la clé **anon** (publique)
- ⚠️ **JAMAIS** la clé **service_role** dans le frontend
- ✅ Vérifiez que RLS est activé sur toutes les tables

## 🐛 Dépannage

### Erreur "Supabase not configured"

**Solution** :
1. Vérifiez que les variables d'environnement sont dans `.env.production`
2. Rebuild : `npm run build`
3. Redéployez le dossier `dist/`

### Les routes ne fonctionnent pas (404)

**Solution** :
1. Vérifiez que le fichier `.htaccess` est présent
2. Vérifiez que `mod_rewrite` est activé sur Hostinger
3. Contactez le support Hostinger si nécessaire

### Les données ne se synchronisent pas

**Solution** :
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que Supabase est bien configuré
3. Vérifiez que les URLs sont autorisées dans Supabase
4. Testez la connexion à Supabase depuis le navigateur

### Erreur CORS

**Solution** :
1. Dans Supabase → Settings → API
2. Vérifiez que votre domaine est dans les URLs autorisées
3. Ajoutez `https://votre-domaine.com` dans les redirect URLs

## 📊 Monitoring

### Vérifier les Données dans Supabase

1. **Table Editor** : Voir les données en temps réel
2. **Logs** : Voir les requêtes et erreurs
3. **Authentication** : Voir les utilisateurs connectés

### Analytics Hostinger

- Utilisez les analytics Hostinger pour voir le trafic
- Surveillez les erreurs dans les logs

## 🔄 Mise à Jour

Pour mettre à jour l'application :

1. **Modifiez le code localement**
2. **Testez** : `npm run dev`
3. **Build** : `npm run build`
4. **Déployez** : Téléversez le nouveau dossier `dist/`
5. **Vérifiez** : Testez sur le site en production

## 📝 Checklist de Déploiement

- [ ] Supabase configuré et script SQL exécuté
- [ ] Variables d'environnement dans `.env.production`
- [ ] Build créé : `npm run build`
- [ ] Fichiers déployés dans `public_html`
- [ ] Fichier `.htaccess` configuré
- [ ] URLs autorisées dans Supabase
- [ ] HTTPS activé
- [ ] Test de création de compte
- [ ] Test d'ajout de dépense
- [ ] Vérification des données dans Supabase
- [ ] Console du navigateur sans erreurs

## 🆘 Support

- **Hostinger Support** : support.hostinger.com
- **Supabase Docs** : supabase.com/docs
- **GitHub Issues** : Pour les problèmes de code

---

**Note** : Supabase est un service cloud externe qui fonctionne parfaitement avec Hostinger. Vos données sont stockées de manière sécurisée dans la base de données PostgreSQL de Supabase, avec sauvegardes automatiques.

