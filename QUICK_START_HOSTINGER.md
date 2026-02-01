# 🚀 Déploiement Rapide sur Hostinger

Guide rapide pour déployer votre application sur Hostinger avec Supabase.

## ⚡ Déploiement en 5 Étapes

### 1. Configurer Supabase (5 minutes)

```bash
# 1. Créez un projet sur supabase.com
# 2. Exécutez le script SQL dans l'éditeur SQL de Supabase
#    Fichier: supabase/migrations/001_initial_schema.sql
# 3. Notez votre URL et clé anon
```

### 2. Créer le Fichier .env.production

Créez un fichier `.env.production` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

### 3. Build de Production

**Windows :**
```bash
build-production.bat
```

**Linux/Mac :**
```bash
chmod +x build-production.sh
./build-production.sh
```

**Ou manuellement :**
```bash
npm install
npm run build
```

### 4. Déployer sur Hostinger

1. **Connectez-vous à Hostinger** → File Manager
2. **Ouvrez** `public_html`
3. **Supprimez** les anciens fichiers (sauf `.htaccess` si existant)
4. **Téléversez** tout le contenu du dossier `dist/`
5. **Vérifiez** que `.htaccess` est présent

### 5. Configurer Supabase pour Production

Dans Supabase → Settings → Authentication → URL Configuration :

- **Site URL** : `https://votre-domaine.com`
- **Redirect URLs** : `https://votre-domaine.com/**`

## ✅ Vérification

1. Visitez votre site : `https://votre-domaine.com`
2. Testez la création de compte
3. Vérifiez dans Supabase → Table Editor que les données apparaissent

## 🐛 Problèmes Courants

### "Supabase not configured"
→ Vérifiez `.env.production` et rebuild

### Erreur 404 sur les routes
→ Vérifiez que `.htaccess` est présent dans `public_html`

### Données ne se synchronisent pas
→ Vérifiez les URLs autorisées dans Supabase

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `DEPLOY_HOSTINGER.md` - Guide complet
- `SUPABASE_SETUP.md` - Configuration Supabase
- `CHECK_CONFIG.md` - Checklist de vérification

---

**🎉 Votre application est maintenant en ligne avec une base de données sécurisée !**

