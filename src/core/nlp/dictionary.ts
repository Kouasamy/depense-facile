import type { ExpenseCategory, PaymentMethod } from '../../db/schema'

// Dictionnaire Nouchi/Français Ivoirien pour la reconnaissance
// Ce dictionnaire permet de mapper les termes locaux aux catégories et moyens de paiement

export interface DictionaryEntry {
  terms: string[]
  category: ExpenseCategory
  subcategory?: string
}

export interface PaymentEntry {
  terms: string[]
  method: PaymentMethod
}

// Transport - Termes locaux pour les moyens de transport
export const transportTerms: DictionaryEntry = {
  terms: [
    // Gbaka - Minibus collectif
    'gbaka', 'baka', 'le gbaka',
    // Woro-woro - Taxi collectif (et variantes simplifiées)
    'woro-woro', 'woro woro', 'woroworo', 'woro', 'warren', 'waren',
    // Pinasse/Pirogue
    'pinasse', 'pirogue',
    // Taxi
    'taxi', 'taxico', 'cab',
    // VTC/Uber
    'uber', 'yango', 'vtc', 'bolt',
    // Bus
    'bus', 'sotra', 'le bus',
    // Moto
    'moto', 'moto-taxi', 'okada',
    // Essence/Carburant
    'essence', 'gasoil', 'carburant', 'gazon',
    // Général transport
    'transport', 'déplacement', 'trajet', 'course', 'aller', 'voyage'
  ],
  category: 'transport'
}

// Nourriture - Plats locaux et termes alimentaires
export const foodTerms: DictionaryEntry[] = [
  {
    terms: [
      // Plats populaires
      'garba', 'le garba', 'garbadrome',
      'attiéké', 'attieke', 'atcheke', 'atieke',
      'alloco', 'allocodrome', 'aloco',
      'foutou', 'foufou', 'foutou banane',
      'placali', 'plakali',
      'kedjenou', 'kedjénou',
      'sauce graine', 'sauce arachide', 'sauce claire',
      'riz', 'riz sauce', 'riz gras',
      // Street food
      'brochette', 'choukouya', 'braisé',
      'pain', 'baguette', 'sandwich',
      // Boissons
      'bissap', 'gnamakoudji', 'gingembre',
      'bangui', 'vin de palme', 'koutoukou',
      // Général
      'manger', 'bouffe', 'nourriture', 'repas', 'déjeuner', 'dîner', 'petit-déjeuner',
      'resto', 'restaurant', 'maquis', 'cantine',
      'boire', 'boisson', 'jus', 'eau'
    ],
    category: 'nourriture'
  }
]

// Logement et maison
export const housingTerms: DictionaryEntry = {
  terms: [
    'loyer', 'le loyer', 'lover',
    'maison', 'appart', 'appartement', 'studio',
    'électricité', 'courant', 'cie', 'compteur',
    'eau', 'sodeci', 'facture eau',
    'gaz', 'bouteille gaz',
    'entretien', 'ménage', 'nettoyage',
    'réparation', 'plombier', 'électricien',
    'meuble', 'lit', 'matelas', 'chaise', 'table'
  ],
  category: 'logement'
}

// Santé
export const healthTerms: DictionaryEntry = {
  terms: [
    'médicament', 'médoc', 'pharmacie', 'pharma',
    'docteur', 'médecin', 'doc', 'toubib',
    'hôpital', 'clinique', 'chu',
    'consultation', 'consulte', 'visite médicale',
    'ordonnance', 'analyse', 'radio', 'scanner',
    'palu', 'paludisme', 'fièvre',
    'douleur', 'mal', 'maladie', 'malade',
    'santé', 'soin', 'soigner', 'traitement'
  ],
  category: 'sante'
}

// Éducation
export const educationTerms: DictionaryEntry = {
  terms: [
    'école', 'fac', 'université', 'uni',
    'cours', 'formation', 'stage',
    'livre', 'cahier', 'fourniture', 'stylo',
    'inscription', 'frais scolaire', 'scolarité',
    'uniforme', 'tenue',
    'prof', 'professeur', 'répétiteur',
    'examen', 'concours', 'bac',
    'étude', 'étudier', 'apprendre'
  ],
  category: 'education'
}

// Communication
export const communicationTerms: DictionaryEntry = {
  terms: [
    'crédit', 'forfait', 'data', 'internet',
    'orange', 'mtn', 'moov',
    'téléphone', 'tel', 'portable', 'phone',
    'appel', 'appeler', 'sms', 'message',
    'wifi', 'connexion', 'box', 'fibre',
    'recharge', 'top up'
  ],
  category: 'communication'
}

// Divertissement
export const entertainmentTerms: DictionaryEntry = {
  terms: [
    'sortie', 'soirée', 'fête', 'party',
    'boîte', 'club', 'bar', 'maquis', 'concert',
    'cinéma', 'ciné', 'film',
    'match', 'foot', 'football', 'sport',
    'jeu', 'jeux', 'pari', 'loto', 'pmu',
    'dja', 'ambiancer', 'ambiance',
    'chill', 'détente', 'loisir',
    'anniversaire', 'mariage', 'baptême', 'cérémonie'
  ],
  category: 'divertissement'
}

// Vêtements
export const clothingTerms: DictionaryEntry = {
  terms: [
    'habit', 'vêtement', 'fringue', 'sape',
    'chaussure', 'basket', 'sandale', 'talon',
    'pantalon', 'jean', 'short',
    'chemise', 'polo', 't-shirt', 'tee',
    'robe', 'jupe', 'pagne',
    'costume', 'boubou', 'bazin',
    'couture', 'tailleur', 'couturier',
    'coiffure', 'salon', 'coiffeur', 'barbier', 'tresse', 'mèche'
  ],
  category: 'vetements'
}

// Famille
export const familyTerms: DictionaryEntry = {
  terms: [
    'famille', 'parent', 'père', 'mère', 'maman', 'papa',
    'enfant', 'fils', 'fille', 'bébé',
    'frère', 'sœur', 'cousin', 'cousine',
    'oncle', 'tante', 'grand-père', 'grand-mère',
    'dôkô', 'doko', // argent envoyé à la famille
    'aide', 'aider', 'soutien', 'envoyer',
    'cadeau', 'don', 'cotisation', 'tontine'
  ],
  category: 'famille'
}

// Moyens de paiement
export const paymentMethods: PaymentEntry[] = [
  {
    terms: ['cash', 'espèce', 'espèces', 'liquide', 'argent', 'billet', 'monnaie', 'pièce'],
    method: 'cash'
  },
  {
    terms: ['orange', 'orange money', 'om', 'orangemoney'],
    method: 'orange_money'
  },
  {
    terms: ['mtn', 'mtn money', 'momo', 'mobile money mtn'],
    method: 'mtn_money'
  },
  {
    terms: ['moov', 'moov money', 'flooz'],
    method: 'moov_money'
  },
  {
    terms: ['wave', 'wave money'],
    method: 'wave'
  },
  {
    terms: ['carte', 'cb', 'carte bancaire', 'visa', 'mastercard', 'carte bleue'],
    method: 'carte_bancaire'
  },
  {
    terms: ['virement', 'transfert', 'banque'],
    method: 'virement'
  }
]

// Action verbs that indicate spending
export const spendingVerbs = [
  'payé', 'payer', 'acheté', 'acheter', 'dépensé', 'dépenser',
  'donné', 'donner', 'mis', 'mettre', 'sorti', 'sortir',
  'j\'ai payé', 'j\'ai acheté', 'j\'ai dépensé', 'j\'ai donné',
  'je paie', 'je paye', 'j\'achète',
  'pris', 'prendre', 'fait', 'faire'
]

// Income verbs
export const incomeVerbs = [
  'reçu', 'recevoir', 'gagné', 'gagner', 'touché', 'toucher',
  'j\'ai reçu', 'j\'ai gagné', 'j\'ai touché',
  'encaissé', 'encaisser', 'rentré', 'rentrer'
]

// Currency patterns (CFA Francs)
export const currencyPatterns = [
  /(\d+(?:\s*\d+)*)\s*(?:f|fcfa|francs?|cfa|balles?)?/gi,
  /(?:f|fcfa|francs?|cfa)\s*(\d+(?:\s*\d+)*)/gi
]

// Number words in French
export const numberWords: Record<string, number> = {
  'zéro': 0, 'zero': 0,
  'un': 1, 'une': 1,
  'deux': 2,
  'trois': 3,
  'quatre': 4,
  'cinq': 5,
  'six': 6,
  'sept': 7,
  'huit': 8,
  'neuf': 9,
  'dix': 10,
  'onze': 11,
  'douze': 12,
  'treize': 13,
  'quatorze': 14,
  'quinze': 15,
  'seize': 16,
  'vingt': 20,
  'trente': 30,
  'quarante': 40,
  'cinquante': 50,
  'soixante': 60,
  'cent': 100,
  'mille': 1000,
  'milles': 1000
}

// All category entries combined
export const allCategoryTerms: DictionaryEntry[] = [
  transportTerms,
  ...foodTerms,
  housingTerms,
  healthTerms,
  educationTerms,
  communicationTerms,
  entertainmentTerms,
  clothingTerms,
  familyTerms
]

// Build a flat lookup map for faster searching
export function buildCategoryLookup(): Map<string, { category: ExpenseCategory; subcategory?: string }> {
  const lookup = new Map<string, { category: ExpenseCategory; subcategory?: string }>()
  
  for (const entry of allCategoryTerms) {
    for (const term of entry.terms) {
      lookup.set(term.toLowerCase(), {
        category: entry.category,
        subcategory: entry.subcategory
      })
    }
  }
  
  return lookup
}

// Build payment method lookup
export function buildPaymentLookup(): Map<string, PaymentMethod> {
  const lookup = new Map<string, PaymentMethod>()
  
  for (const entry of paymentMethods) {
    for (const term of entry.terms) {
      lookup.set(term.toLowerCase(), entry.method)
    }
  }
  
  return lookup
}

// Pre-built lookups
export const categoryLookup = buildCategoryLookup()
export const paymentLookup = buildPaymentLookup()

