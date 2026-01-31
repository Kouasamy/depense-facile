# Dépense Facile 💰

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

## Configuration (optionnelle)

Pour activer la synchronisation cloud, créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon

# Pour la reconnaissance vocale améliorée (optionnel)
VITE_OPENAI_API_KEY=votre_clé_openai
```

### Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le script SQL dans `supabase/migrations/001_initial_schema.sql`
3. Ajoutez les variables d'environnement

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

