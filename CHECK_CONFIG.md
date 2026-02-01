# ✅ Vérification de Configuration pour Production

Utilisez cette checklist pour vérifier que tout est bien configuré avant de déployer sur Hostinger.

## 🔐 Configuration Supabase

- [ ] Projet Supabase créé
- [ ] Script SQL exécuté (`supabase/migrations/001_initial_schema.sql`)
- [ ] Tables créées : `expenses`, `incomes`, `budgets`, `user_profiles`, `user_onboarding`
- [ ] Row Level Security (RLS) activé sur toutes les tables
- [ ] Politiques de sécurité créées pour toutes les tables
- [ ] URLs autorisées configurées dans Supabase :
  - Site URL : `https://votre-domaine.com`
  - Redirect URLs : `https://votre-domaine.com/**`

## 📝 Variables d'Environnement

- [ ] Fichier `.env.production` créé avec :
  ```env
  VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
  VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
  ```
- [ ] Variables correctes (pas d'espaces, pas de guillemets)
- [ ] Fichier `.env` dans `.gitignore` (ne pas commiter les secrets)

## 🏗️ Build de Production

- [ ] Dépendances installées : `npm install`
- [ ] Build réussi : `npm run build`
- [ ] Dossier `dist/` créé avec tous les fichiers
- [ ] Fichier `.htaccess` copié dans `dist/`
- [ ] Pas d'erreurs dans la console lors du build

## 📁 Fichiers à Déployer

Vérifiez que le dossier `dist/` contient :
- [ ] `index.html`
- [ ] Dossier `assets/` avec les fichiers JS et CSS
- [ ] Fichiers PWA (manifest, service worker)
- [ ] Fichier `.htaccess`
- [ ] Tous les fichiers statiques (images, fonts, etc.)

## 🌐 Configuration Hostinger

- [ ] Compte Hostinger actif
- [ ] Domaine configuré
- [ ] SSL/HTTPS activé
- [ ] Fichiers déployés dans `public_html`
- [ ] Permissions des fichiers correctes (644 pour fichiers, 755 pour dossiers)

## 🧪 Tests Fonctionnels

Testez sur le site en production :

- [ ] Page d'accueil charge correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Création de compte fonctionne
- [ ] Connexion fonctionne
- [ ] Ajout de dépense fonctionne
- [ ] Données visibles dans Supabase Table Editor
- [ ] Synchronisation fonctionne (testez hors ligne puis reconnectez)
- [ ] PWA installable (sur mobile)

## 🔒 Sécurité

- [ ] HTTPS activé et fonctionnel
- [ ] Pas de clés secrètes dans le code source
- [ ] `.env` dans `.gitignore`
- [ ] RLS activé sur toutes les tables Supabase
- [ ] Utilisation uniquement de la clé `anon` (pas `service_role`)

## 📊 Monitoring

- [ ] Vérification des logs Supabase (pas d'erreurs)
- [ ] Vérification des données dans Table Editor
- [ ] Analytics Hostinger configuré (optionnel)

## 🐛 En Cas de Problème

### Erreur "Supabase not configured"
1. Vérifiez `.env.production`
2. Rebuild : `npm run build`
3. Redéployez

### Erreur 404 sur les routes
1. Vérifiez que `.htaccess` est présent
2. Vérifiez que `mod_rewrite` est activé

### Données ne se synchronisent pas
1. Vérifiez la console du navigateur
2. Vérifiez les URLs autorisées dans Supabase
3. Vérifiez les politiques RLS

## ✅ Checklist Finale

Avant de considérer le déploiement comme terminé :

- [ ] Tous les tests fonctionnels passent
- [ ] Pas d'erreurs dans la console
- [ ] Données sauvegardées dans Supabase
- [ ] Site accessible en HTTPS
- [ ] Performance acceptable
- [ ] PWA fonctionne

---

**Une fois toutes les cases cochées, votre application est prête pour la production ! 🎉**

