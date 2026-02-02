# 📚 Stack Technologique - GèreTonDjai

Documentation complète de toutes les technologies, langages, frameworks et outils utilisés pour concevoir cette application.

---

## 🎯 **LANGAGES DE PROGRAMMATION**

### **TypeScript** (v5.9.3)
- **Usage** : Langage principal de développement
- **Configuration** : ES2022, strict mode activé
- **Avantages** : Typage statique, meilleure maintenabilité, détection d'erreurs à la compilation

### **JavaScript (ES2022+)**
- **Usage** : Exécution côté client
- **Features** : Modules ES6, async/await, destructuring, arrow functions

### **HTML5**
- **Usage** : Structure de l'application
- **Features** : Semantic HTML, meta tags SEO, PWA manifest

### **CSS3**
- **Usage** : Styling et animations
- **Features** : 
  - CSS Variables (Custom Properties)
  - Flexbox & Grid Layout
  - Animations & Transitions
  - Media Queries (Responsive Design)
  - CSS Containment pour performance

---

## ⚛️ **FRAMEWORKS & BIBLIOTHÈQUES FRONTEND**

### **React** (v19.2.4)
- **Type** : Framework UI
- **Usage** : Interface utilisateur composants
- **Features utilisées** :
  - Hooks (useState, useEffect, useRef, etc.)
  - Context API
  - React.lazy() pour code splitting
  - Suspense pour loading states
  - React.StrictMode

### **React DOM** (v19.2.3)
- **Usage** : Rendu React dans le DOM
- **Version** : Conforme à React 19

### **React Router DOM** (v7.2.0)
- **Usage** : Navigation et routing
- **Features** :
  - Client-side routing
  - Route guards (protection des routes)
  - Lazy loading des routes
  - Navigation programmatique

---

## 🎨 **STYLING & UI**

### **CSS Modules / CSS Vanilla**
- **Approche** : CSS pur avec variables CSS
- **Architecture** :
  - `design-system.css` : Variables et composants de base
  - `responsive.css` : Media queries et utilitaires responsive
  - `animations.css` : Animations et transitions
  - `awwwards-animations.css` : Animations avancées

### **Framer Motion** (v12.29.2)
- **Usage** : Animations et transitions fluides
- **Features** :
  - Animations de scroll
  - Transitions de page
  - Gestures et interactions
  - Variants pour animations complexes
- **Optimisation** : Lazy loading sur mobile

### **Lucide React** (v0.563.0)
- **Usage** : Bibliothèque d'icônes
- **Avantages** : Icônes SVG légères et personnalisables

### **Google Fonts**
- **Fonts utilisées** :
  - Plus Jakarta Sans (300-800)
  - Material Symbols Outlined
- **Optimisation** : Chargement asynchrone, font-display: swap

---

## 🗄️ **GESTION D'ÉTAT & DONNÉES**

### **Zustand** (v5.0.10)
- **Usage** : State management global
- **Stores** :
  - `authStore` : Authentification utilisateur
  - `expenseStore` : Gestion des dépenses
  - `budgetStore` : Gestion des budgets
  - `themeStore` : Thème (light/dark/system)
  - `notificationStore` : Notifications
- **Avantages** : Léger, simple, performant

### **Dexie.js** (v4.3.0)
- **Usage** : Base de données locale (IndexedDB)
- **Fonctionnalités** :
  - Stockage offline-first
  - Synchronisation avec Supabase
  - Requêtes asynchrones
  - Transactions

### **Supabase** (@supabase/supabase-js v2.93.3)
- **Usage** : Backend-as-a-Service (BaaS)
- **Services utilisés** :
  - **Authentication** : Gestion des utilisateurs
  - **Database** : PostgreSQL (base de données)
  - **Storage** : Stockage de fichiers (optionnel)
  - **Realtime** : Synchronisation en temps réel
- **Avantages** : Backend complet, sécurisé, scalable

---

## 🛠️ **OUTILS DE BUILD & DÉVELOPPEMENT**

### **Vite** (v7.2.4)
- **Type** : Build tool & Dev server
- **Usage** : Bundling et développement
- **Features** :
  - Hot Module Replacement (HMR)
  - Code splitting automatique
  - Tree shaking
  - Optimisations de production
  - Support TypeScript natif

### **@vitejs/plugin-react** (v5.1.2)
- **Usage** : Plugin React pour Vite
- **Features** : Fast Refresh, JSX support

### **TypeScript Compiler** (tsc)
- **Usage** : Compilation TypeScript
- **Configuration** : `tsconfig.json`
- **Options** : Strict mode, path aliases (@/*)

### **PostCSS** (v8.5.6)
- **Usage** : Traitement CSS
- **Plugins** :
  - Autoprefixer : Ajout automatique des préfixes navigateurs

### **Autoprefixer** (v10.4.24)
- **Usage** : Préfixes CSS automatiques
- **Support** : Tous les navigateurs modernes

---

## 📱 **PROGRESSIVE WEB APP (PWA)**

### **vite-plugin-pwa** (v1.2.0)
- **Usage** : Configuration PWA
- **Features** :
  - Service Worker automatique
  - Manifest.json
  - Offline support
  - Auto-update

### **Workbox**
- **Usage** : Gestion du cache et stratégies
- **Stratégies** :
  - CacheFirst pour les fonts
  - NetworkFirst pour les données
  - Precache pour les assets statiques

### **Service Worker**
- **Fonctionnalités** :
  - Mise en cache des assets
  - Fonctionnement hors ligne
  - Synchronisation en arrière-plan

---

## 📄 **GÉNÉRATION DE DOCUMENTS**

### **jsPDF** (v4.0.0)
- **Usage** : Génération de PDFs
- **Fonctionnalités** :
  - Export des rapports financiers
  - Génération de budgets PDF
  - Plans d'épargne en PDF

### **jspdf-autotable** (v5.0.7)
- **Usage** : Extension pour tables dans PDFs
- **Fonctionnalités** : Création de tableaux formatés

### **html2canvas** (via esbuild)
- **Usage** : Capture d'écran pour exports
- **Fonctionnalités** : Conversion HTML en image

---

## 🎤 **RECONNAISSANCE VOCALE**

### **Web Speech API**
- **API native** : `webkitSpeechRecognition` / `SpeechRecognition`
- **Usage** : Saisie vocale des dépenses
- **Fonctionnalités** :
  - Reconnaissance vocale en temps réel
  - Support multilingue (Français, Nouchi)
  - Transcription automatique

### **MediaRecorder API**
- **Usage** : Enregistrement audio (si nécessaire)
- **Format** : WebM, OGG

---

## 🌐 **APIS & SERVICES EXTERNES**

### **Google Fonts API**
- **Usage** : Chargement des polices
- **Optimisation** : Preconnect, DNS prefetch, async loading

### **Supabase API**
- **Endpoints** :
  - Authentication API
  - REST API (PostgreSQL)
  - Realtime API
  - Storage API

---

## 🔧 **OUTILS DE DÉVELOPPEMENT**

### **Node.js & npm**
- **Usage** : Gestion des dépendances
- **Scripts** :
  - `npm run dev` : Serveur de développement
  - `npm run build` : Build de production
  - `npm run preview` : Prévisualisation du build

### **Git**
- **Usage** : Contrôle de version
- **Fichiers** : `.gitignore` configuré

---

## 📦 **OUTILS DE BUILD & DÉPLOIEMENT**

### **Terser**
- **Usage** : Minification JavaScript
- **Configuration** :
  - Suppression des console.log
  - Compression du code
  - Optimisation des performances

### **Rollup** (via Vite)
- **Usage** : Bundling et code splitting
- **Configuration** : Manual chunks pour optimiser le chargement

### **Build Scripts**
- **Windows** : `build-production.bat`
- **Linux/Mac** : `build-production.sh`
- **Fonctionnalités** :
  - Vérification des variables d'environnement
  - Build automatique
  - Préparation pour déploiement

---

## 🌍 **HÉBERGEMENT & DÉPLOIEMENT**

### **Hostinger**
- **Type** : Hébergement web
- **Configuration** :
  - `.htaccess` pour routing SPA
  - Déploiement via File Manager
  - Support HTTPS

### **Variables d'environnement**
- **Fichiers** :
  - `.env` : Développement
  - `.env.production` : Production
- **Variables** :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 📊 **ARCHITECTURE & PATTERNS**

### **Architecture**
- **Pattern** : Component-based architecture
- **Structure** :
  ```
  src/
  ├── components/     # Composants réutilisables
  ├── pages/         # Pages de l'application
  ├── stores/        # Zustand stores
  ├── hooks/         # Custom React hooks
  ├── utils/         # Utilitaires
  ├── db/            # Configuration Dexie
  ├── lib/           # Bibliothèques externes
  ├── core/          # Logique métier
  └── styles/        # Fichiers CSS
  ```

### **Design Patterns**
- **Container/Presentational** : Séparation logique/UI
- **Custom Hooks** : Réutilisation de la logique
- **Store Pattern** : Gestion d'état centralisée
- **Lazy Loading** : Chargement à la demande

---

## 🎯 **OPTIMISATIONS & PERFORMANCE**

### **Code Splitting**
- **Lazy Loading** : Pages chargées à la demande
- **Manual Chunks** : Séparation des vendors
- **Dynamic Imports** : Import dynamique des modules

### **Performance**
- **Tree Shaking** : Suppression du code mort
- **Minification** : Compression du code
- **Asset Optimization** : Images, fonts optimisées
- **Caching** : Service Worker + Workbox

### **Mobile Optimizations**
- **Responsive Design** : Media queries
- **Touch Optimizations** : Touch targets optimisés
- **Animation Reduction** : Animations réduites sur mobile
- **Lazy Loading** : Chargement progressif

---

## 🔒 **SÉCURITÉ**

### **Supabase Security**
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **Authentication** : JWT tokens
- **API Keys** : Clés sécurisées

### **Best Practices**
- **Environment Variables** : Secrets non commités
- **HTTPS** : Communication sécurisée
- **CSP** : Content Security Policy (recommandé)

---

## 📈 **SEO & MÉTADONNÉES**

### **SEO**
- **Meta Tags** : Title, description, keywords
- **Open Graph** : Partage social
- **Twitter Cards** : Partage Twitter
- **Structured Data** : JSON-LD schema.org
- **Sitemap.xml** : Plan du site
- **robots.txt** : Instructions pour les crawlers

### **Accessibility**
- **ARIA Labels** : Attributs d'accessibilité
- **Semantic HTML** : HTML sémantique
- **Keyboard Navigation** : Navigation au clavier

---

## 🧪 **TESTING & QUALITÉ**

### **TypeScript**
- **Type Checking** : Vérification des types
- **Strict Mode** : Mode strict activé
- **Linting** : Détection d'erreurs

### **Build Verification**
- **Scripts de vérification** : `check:config`
- **Build validation** : Vérification post-build

---

## 📚 **DOCUMENTATION**

### **Fichiers de documentation**
- `README.md` : Documentation principale
- `SUPABASE_SETUP.md` : Configuration Supabase
- `DEPLOY_HOSTINGER.md` : Guide de déploiement
- `SEO_GUIDE.md` : Guide SEO
- `EMAIL_SETUP.md` : Configuration email
- `TECHNOLOGIES.md` : Ce document

---

## 🎨 **DESIGN SYSTEM**

### **Couleurs**
- **Primary** : #f48c25 (Orange)
- **Secondary** : #10b981 (Vert)
- **Thèmes** : Light & Dark mode
- **Variables CSS** : Système de couleurs centralisé

### **Typography**
- **Font Family** : Plus Jakarta Sans
- **Weights** : 300-800
- **Icons** : Material Symbols Outlined, Lucide React

### **Spacing**
- **Système** : Variables CSS (--space-1 à --space-12)
- **Responsive** : Adaptatif selon l'écran

---

## 📱 **COMPATIBILITÉ**

### **Navigateurs supportés**
- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (iOS 12+)
- Opera (dernières versions)

### **Appareils**
- **Desktop** : Tous les écrans
- **Tablette** : iPad, Android tablets
- **Mobile** : iOS 12+, Android 8+

---

## 🚀 **FONCTIONNALITÉS AVANCÉES**

### **Offline-First**
- **IndexedDB** : Stockage local
- **Service Worker** : Cache des assets
- **Sync** : Synchronisation automatique

### **Reconnaissance vocale**
- **Web Speech API** : Saisie vocale
- **Nouchi Support** : Langue locale ivoirienne
- **Transcription** : Conversion parole → texte

### **Analytics & Tracking**
- **Prêt pour** : Google Analytics, Plausible, etc.
- **Events** : Système d'événements intégré

---

## 📝 **RÉSUMÉ TECHNIQUE**

### **Stack Principal**
```
Frontend: React 19 + TypeScript + Vite
Styling: CSS3 + Framer Motion
State: Zustand
Database: Dexie (local) + Supabase (cloud)
PWA: vite-plugin-pwa + Workbox
Build: Vite + Rollup + Terser
```

### **Taille des bundles** (après optimisation)
- **Main bundle** : ~218 KB (gzipped: ~68 KB)
- **React vendor** : ~46 KB (gzipped: ~16 KB)
- **Framer Motion** : ~124 KB (gzipped: ~40 KB)
- **Utils** : ~94 KB (gzipped: ~31 KB)
- **PDF** : ~413 KB (gzipped: ~132 KB) - chargé à la demande

---

## 🔄 **VERSIONS**

| Technologie | Version |
|------------|---------|
| React | 19.2.4 |
| TypeScript | 5.9.3 |
| Vite | 7.2.4 |
| Zustand | 5.0.10 |
| Dexie | 4.3.0 |
| Supabase | 2.93.3 |
| Framer Motion | 12.29.2 |
| React Router | 7.2.0 |

---

**Dernière mise à jour** : Décembre 2024
**Version de l'application** : 0.0.0 (Développement)

