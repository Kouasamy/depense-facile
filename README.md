# Gère Ton Djai 💰

Application Web Progressive (PWA) de gestion de dépenses pour les Ivoiriens, avec saisie vocale intelligente et compréhension du Nouchi.

## Fonctionnalités

- 🎤 **Saisie vocale** - Enregistrez vos dépenses en parlant naturellement
- 🇨🇮 **Compréhension locale** - Reconnaissance du Nouchi et du français ivoirien (Gbaka, Garba, Woro-woro...)
- 📱 **PWA installable** - Utilisable hors ligne, installable sur mobile
- 📊 **Tableau de bord** - Visualisez vos dépenses par catégorie
- 💳 **Mobile Money** - Support Orange Money, MTN Money, Moov Money, Wave
- 🔄 **Sync cloud** - Synchronisation optionnelle avec Supabase

## Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **DB locale**: Dexie.js (IndexedDB)
- **Backend**: Supabase (optionnel)
- **PWA**: vite-plugin-pwa + Workbox

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd depense-facile

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

## Configuration Supabase (Recommandée)

L'application utilise maintenant **Supabase** comme base de données principale pour une sécurité et une synchronisation optimales.

### Étapes de configuration

1. **Créer un projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Notez votre URL et votre clé anonyme (anon key)

2. **Configurer la base de données**
   - Dans votre projet Supabase, allez dans l'éditeur SQL
   - Exécutez le script complet dans `supabase/migrations/001_initial_schema.sql`
   - Ce script crée toutes les tables nécessaires avec Row Level Security (RLS) activé

3. **Configurer les variables d'environnement**
   - Créez un fichier `.env` à la racine du projet
   - Ajoutez vos credentials Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

4. **Sécurité**
   - Les données sont protégées par Row Level Security (RLS)
   - Chaque utilisateur ne peut accéder qu'à ses propres données
   - L'authentification est gérée par Supabase Auth
   - Les mots de passe sont hashés et sécurisés

### Fonctionnalités de synchronisation

- ✅ **Synchronisation automatique** : Les données sont synchronisées automatiquement avec Supabase
- ✅ **Mode hors ligne** : Fonctionne hors ligne avec IndexedDB, synchronise quand la connexion revient
- ✅ **Sécurité** : Toutes les données sont protégées par RLS
- ✅ **Authentification sécurisée** : Utilise Supabase Auth avec gestion de session

## Utilisation

### Enregistrer une dépense

1. Appuyez sur le bouton micro 🎤
2. Dites votre dépense naturellement :
   - "Gbaka 500"
   - "J'ai payé 1500 pour le garba avec Orange"
   - "Transport 2000"
   - "Crédit MTN mille francs"
3. Vérifiez et confirmez

### Catégories reconnues

| Catégorie | Exemples de termes |
|-----------|-------------------|
| Transport | gbaka, woro-woro, taxi, uber, essence |
| Nourriture | garba, attiéké, alloco, foutou, maquis |
| Logement | loyer, électricité, eau, CIE, SODECI |
| Santé | pharmacie, médecin, hôpital, médicament |
| Communication | crédit, forfait, Orange, MTN, Moov |
| Divertissement | sortie, maquis, concert, match |

### Moyens de paiement

- Espèces (cash)
- Orange Money
- MTN Money
- Moov Money
- Wave
- Carte bancaire

## Architecture

```
src/
├── components/          # Composants React
│   ├── VoiceRecorder/   # Bouton micro + animations
│   ├── ExpenseCard/     # Carte de confirmation
│   └── common/          # Navigation, etc.
├── core/
│   ├── nlp/             # Moteur NLP Nouchi
│   └── voice/           # Reconnaissance vocale
├── db/                  # IndexedDB (Dexie)
├── stores/              # État global (Zustand)
├── hooks/               # Custom hooks
├── pages/               # Pages de l'app
└── lib/                 # Utilitaires (Supabase)
```

## Mode hors ligne

L'application fonctionne entièrement hors ligne :
- Toutes les données sont stockées localement (IndexedDB)
- La synchronisation se fait automatiquement quand la connexion revient
- Le service worker cache les assets pour un chargement instantané

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ajouter des termes au dictionnaire Nouchi
- Améliorer la reconnaissance vocale
- Proposer de nouvelles fonctionnalités

## Licence

MIT

