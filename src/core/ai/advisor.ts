import type { ExpenseCategory } from '../../db/schema'

// Types for AI advice
export interface FinancialAdvice {
  id: string
  type: 'warning' | 'tip' | 'success' | 'info'
  title: string
  message: string
  action?: string
  priority: number // 1-10, higher = more important
  category?: ExpenseCategory
}

export interface BudgetRecommendation {
  category: ExpenseCategory
  suggestedAmount: number
  percentage: number
  reasoning: string
  priority: 'essential' | 'important' | 'optional'
}

export interface FinancialHealth {
  score: number // 0-100
  status: 'excellent' | 'good' | 'average' | 'warning' | 'critical'
  summary: string
  improvements: string[]
}

// Recommended budget percentages based on income (Ivorian context)
const BUDGET_PERCENTAGES: Record<ExpenseCategory, { min: number; max: number; priority: 'essential' | 'important' | 'optional' }> = {
  logement: { min: 25, max: 35, priority: 'essential' },
  nourriture: { min: 20, max: 30, priority: 'essential' },
  transport: { min: 10, max: 15, priority: 'essential' },
  sante: { min: 5, max: 10, priority: 'essential' },
  communication: { min: 3, max: 5, priority: 'important' },
  education: { min: 5, max: 15, priority: 'important' },
  famille: { min: 5, max: 10, priority: 'important' },
  vetements: { min: 3, max: 5, priority: 'optional' },
  divertissement: { min: 3, max: 5, priority: 'optional' },
  autre: { min: 5, max: 10, priority: 'optional' }
}

// Category labels in French
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: 'Transport',
  nourriture: 'Nourriture',
  logement: 'Logement',
  sante: 'Santé',
  education: 'Éducation',
  communication: 'Communication',
  divertissement: 'Divertissement',
  vetements: 'Vêtements',
  famille: 'Famille',
  autre: 'Autre'
}

// Generate budget recommendations based on income
export function generateBudgetRecommendations(
  monthlyIncome: number,
  currentSpending: Record<ExpenseCategory, number>
): BudgetRecommendation[] {
  const recommendations: BudgetRecommendation[] = []
  
  for (const [category, config] of Object.entries(BUDGET_PERCENTAGES)) {
    const cat = category as ExpenseCategory
    const avgPercentage = (config.min + config.max) / 2
    const suggestedAmount = Math.round((monthlyIncome * avgPercentage) / 100)
    const currentAmount = currentSpending[cat] || 0
    
    let reasoning = ''
    
    if (currentAmount > suggestedAmount * 1.5) {
      reasoning = `Tu dépenses beaucoup plus que recommandé en ${CATEGORY_LABELS[cat].toLowerCase()}. Essaie de réduire progressivement.`
    } else if (currentAmount > suggestedAmount) {
      reasoning = `Tes dépenses en ${CATEGORY_LABELS[cat].toLowerCase()} sont légèrement au-dessus de la moyenne. Reste vigilant.`
    } else if (currentAmount < suggestedAmount * 0.5 && config.priority === 'essential') {
      reasoning = `N'oublie pas d'allouer un budget suffisant pour ${CATEGORY_LABELS[cat].toLowerCase()}, c'est essentiel.`
    } else {
      reasoning = `Bon équilibre pour ${CATEGORY_LABELS[cat].toLowerCase()}. Continue comme ça !`
    }
    
    recommendations.push({
      category: cat,
      suggestedAmount,
      percentage: avgPercentage,
      reasoning,
      priority: config.priority
    })
  }
  
  // Sort by priority
  const priorityOrder = { essential: 0, important: 1, optional: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

// Generate personalized financial advice
export function generateFinancialAdvice(
  monthlyIncome: number,
  _monthlyExpenses: number, // Unused but kept for API compatibility
  categorySpending: Record<ExpenseCategory, number>,
  savingsRate: number // percentage of income saved
): FinancialAdvice[] {
  const advice: FinancialAdvice[] = []
  
  // Advice based on savings rate
  if (savingsRate < 0) {
    advice.push({
      id: 'debt-warning',
      type: 'warning',
      title: '⚠️ Attention : Dépenses supérieures aux revenus',
      message: `Tu dépenses plus que ce que tu gagnes. C'est une situation dangereuse qui peut mener à l'endettement.`,
      action: 'Réduis tes dépenses non essentielles immédiatement',
      priority: 10
    })
  } else if (savingsRate < 10) {
    advice.push({
      id: 'low-savings',
      type: 'warning',
      title: '💰 Épargne insuffisante',
      message: `Tu n'épargnes que ${savingsRate.toFixed(0)}% de tes revenus. L'idéal est d'épargner au moins 20%.`,
      action: 'Essaie de mettre de côté au moins 20% de tes revenus chaque mois',
      priority: 8
    })
  } else if (savingsRate >= 20) {
    advice.push({
      id: 'good-savings',
      type: 'success',
      title: '🎉 Excellent taux d\'épargne !',
      message: `Bravo ! Tu épargnes ${savingsRate.toFixed(0)}% de tes revenus. C'est une excellente habitude.`,
      priority: 3
    })
  }
  
  // Advice based on category spending
  for (const [category, amount] of Object.entries(categorySpending)) {
    const cat = category as ExpenseCategory
    const config = BUDGET_PERCENTAGES[cat]
    const spendingPercentage = (amount / monthlyIncome) * 100
    
    if (spendingPercentage > config.max * 1.5) {
      advice.push({
        id: `overspend-${cat}`,
        type: 'warning',
        title: `🚨 ${CATEGORY_LABELS[cat]} : Dépenses excessives`,
        message: `Tu consacres ${spendingPercentage.toFixed(0)}% de tes revenus à ${CATEGORY_LABELS[cat].toLowerCase()}, bien au-dessus des ${config.max}% recommandés.`,
        action: `Réduis tes dépenses en ${CATEGORY_LABELS[cat].toLowerCase()} de ${Math.round(spendingPercentage - config.max)}%`,
        priority: 9,
        category: cat
      })
    } else if (spendingPercentage > config.max) {
      advice.push({
        id: `high-${cat}`,
        type: 'info',
        title: `📊 ${CATEGORY_LABELS[cat]} : À surveiller`,
        message: `Tes dépenses en ${CATEGORY_LABELS[cat].toLowerCase()} (${spendingPercentage.toFixed(0)}%) dépassent légèrement le seuil recommandé (${config.max}%).`,
        priority: 5,
        category: cat
      })
    }
  }
  
  // General tips based on income level (FCFA context)
  if (monthlyIncome < 100000) {
    advice.push({
      id: 'low-income-tips',
      type: 'tip',
      title: '💡 Conseils pour petits budgets',
      message: 'Avec un budget serré, concentre-toi sur les besoins essentiels : logement, nourriture, transport. Évite les achats impulsifs.',
      action: 'Planifie tes repas à l\'avance pour économiser sur la nourriture',
      priority: 6
    })
  } else if (monthlyIncome >= 300000) {
    advice.push({
      id: 'investment-tip',
      type: 'tip',
      title: '📈 Pense à investir',
      message: 'Avec tes revenus, tu peux commencer à investir pour faire fructifier ton argent.',
      action: 'Renseigne-toi sur les options d\'investissement locales (tontines, placements bancaires)',
      priority: 4
    })
  }
  
  // Emergency fund advice
  const emergencyFund = monthlyIncome * 3
  advice.push({
    id: 'emergency-fund',
    type: 'tip',
    title: '🛡️ Fonds d\'urgence',
    message: `L'idéal est d'avoir un fonds d'urgence de ${formatCurrency(emergencyFund)} (3 mois de revenus) pour faire face aux imprévus.`,
    priority: 5
  })
  
  // Sort by priority (highest first)
  return advice.sort((a, b) => b.priority - a.priority)
}

// Calculate financial health score
export function calculateFinancialHealth(
  monthlyIncome: number,
  monthlyExpenses: number,
  categorySpending: Record<ExpenseCategory, number>
): FinancialHealth {
  let score = 100
  const improvements: string[] = []
  
  // Factor 1: Expense ratio (max 40 points)
  const expenseRatio = monthlyExpenses / monthlyIncome
  if (expenseRatio > 1) {
    score -= 40
    improvements.push('Réduire les dépenses pour ne pas dépasser les revenus')
  } else if (expenseRatio > 0.9) {
    score -= 30
    improvements.push('Augmenter l\'épargne à au moins 10% des revenus')
  } else if (expenseRatio > 0.8) {
    score -= 15
    improvements.push('Viser un taux d\'épargne de 20%')
  } else if (expenseRatio > 0.7) {
    score -= 5
  }
  
  // Factor 2: Budget balance (max 30 points)
  let categoriesOverBudget = 0
  for (const [category, amount] of Object.entries(categorySpending)) {
    const cat = category as ExpenseCategory
    const config = BUDGET_PERCENTAGES[cat]
    const percentage = (amount / monthlyIncome) * 100
    
    if (percentage > config.max * 1.5) {
      categoriesOverBudget += 2
      improvements.push(`Réduire les dépenses en ${CATEGORY_LABELS[cat].toLowerCase()}`)
    } else if (percentage > config.max) {
      categoriesOverBudget += 1
    }
  }
  score -= Math.min(30, categoriesOverBudget * 5)
  
  // Factor 3: Essential categories covered (max 20 points)
  const essentialCategories: ExpenseCategory[] = ['logement', 'nourriture', 'transport', 'sante']
  let essentialsMissing = 0
  for (const cat of essentialCategories) {
    if (!categorySpending[cat] || categorySpending[cat] === 0) {
      essentialsMissing++
    }
  }
  if (essentialsMissing > 0) {
    score -= essentialsMissing * 5
    improvements.push('Allouer un budget pour tous les besoins essentiels')
  }
  
  // Determine status
  let status: FinancialHealth['status']
  let summary: string
  
  if (score >= 90) {
    status = 'excellent'
    summary = 'Félicitations ! Ta gestion financière est exemplaire. Continue comme ça !'
  } else if (score >= 75) {
    status = 'good'
    summary = 'Bonne gestion financière ! Quelques ajustements peuvent encore améliorer ta situation.'
  } else if (score >= 60) {
    status = 'average'
    summary = 'Ta situation financière est correcte, mais il y a des points à améliorer.'
  } else if (score >= 40) {
    status = 'warning'
    summary = 'Attention, ta gestion financière nécessite des ajustements importants.'
  } else {
    status = 'critical'
    summary = 'Situation critique ! Il est urgent de revoir tes dépenses et ton budget.'
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    status,
    summary,
    improvements: improvements.slice(0, 5) // Max 5 improvements
  }
}

// Generate smart tips based on spending patterns
export function generateSmartTips(
  categorySpending: Record<ExpenseCategory, number>,
  monthlyIncome: number
): string[] {
  const tips: string[] = []
  
  // Transport tips
  const transportRatio = (categorySpending.transport || 0) / monthlyIncome
  if (transportRatio > 0.15) {
    tips.push('🚌 Privilégie le Gbaka ou le Woro-woro au taxi pour économiser sur le transport')
    tips.push('🚶 Pour les courtes distances, marche ! C\'est gratuit et bon pour la santé')
  }
  
  // Food tips
  const foodRatio = (categorySpending.nourriture || 0) / monthlyIncome
  if (foodRatio > 0.30) {
    tips.push('🍳 Cuisine à la maison plus souvent, c\'est moins cher que manger dehors')
    tips.push('🛒 Fais tes courses au marché plutôt qu\'au supermarché pour économiser')
    tips.push('📝 Planifie tes repas de la semaine pour éviter le gaspillage')
  }
  
  // Communication tips
  const commRatio = (categorySpending.communication || 0) / monthlyIncome
  if (commRatio > 0.05) {
    tips.push('📱 Compare les forfaits Orange, MTN et Moov pour trouver le meilleur rapport qualité-prix')
    tips.push('📶 Utilise le Wi-Fi gratuit quand c\'est possible pour économiser tes données')
  }
  
  // Entertainment tips
  const entertainmentRatio = (categorySpending.divertissement || 0) / monthlyIncome
  if (entertainmentRatio > 0.05) {
    tips.push('🎬 Profite des activités gratuites : plages, parcs, événements culturels')
    tips.push('👫 Organise des sorties entre amis à la maison plutôt qu\'au maquis')
  }
  
  // General savings tips
  tips.push('💵 Mets de l\'argent de côté dès que tu reçois ton salaire, pas à la fin du mois')
  tips.push('🎯 Fixe-toi un objectif d\'épargne mensuel et respecte-le')
  tips.push('📊 Vérifie tes dépenses chaque semaine pour rester sur la bonne voie')
  
  // Shuffle and return a subset
  return shuffleArray(tips).slice(0, 5)
}

// Daily spending limit calculation
export function calculateDailyLimit(
  monthlyIncome: number,
  fixedExpenses: number, // Rent, bills, etc.
  savingsGoal: number // Percentage to save
): { dailyLimit: number; explanation: string } {
  const daysInMonth = 30
  const targetSavings = monthlyIncome * (savingsGoal / 100)
  const availableForSpending = monthlyIncome - fixedExpenses - targetSavings
  const dailyLimit = Math.round(availableForSpending / daysInMonth)
  
  let explanation: string
  if (dailyLimit > 0) {
    explanation = `Après tes dépenses fixes et ton épargne de ${savingsGoal}%, tu peux dépenser jusqu'à ${formatCurrency(dailyLimit)} par jour.`
  } else {
    explanation = `Attention ! Tes dépenses fixes et ton objectif d'épargne dépassent tes revenus. Revois ton budget.`
  }
  
  return { dailyLimit: Math.max(0, dailyLimit), explanation }
}

// Helper functions
function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F'
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Income-based lifestyle tips
export function getLifestyleTips(monthlyIncome: number): string[] {
  if (monthlyIncome < 75000) {
    return [
      '💪 Chaque franc compte ! Note toutes tes dépenses, même les plus petites.',
      '🍚 Privilégie les aliments de base locaux : riz, attiéké, plantain.',
      '🚶 Marche quand c\'est possible pour économiser sur le transport.',
      '💡 Éteins les appareils électriques pour réduire ta facture.',
      '🤝 Rejoins une tontine pour t\'aider à épargner régulièrement.'
    ]
  } else if (monthlyIncome < 150000) {
    return [
      '📊 Alloue 50% aux besoins, 30% aux envies, 20% à l\'épargne.',
      '🏠 Le logement ne devrait pas dépasser 30% de tes revenus.',
      '🍽️ Limite les restaurants à 1-2 fois par semaine.',
      '📱 Un forfait mobile de 5000 F devrait suffire.',
      '💰 Vise à économiser au moins 30 000 F par mois.'
    ]
  } else if (monthlyIncome < 300000) {
    return [
      '🎯 Tu peux commencer à diversifier ton épargne.',
      '🏦 Ouvre un compte épargne pour séparer tes fonds.',
      '📈 Renseigne-toi sur les placements simples.',
      '🛡️ Pense à une assurance santé si tu n\'en as pas.',
      '💼 Investis dans ta formation pour augmenter tes revenus.'
    ]
  } else {
    return [
      '📈 Avec ces revenus, l\'investissement devient prioritaire.',
      '🏘️ Pense à l\'immobilier comme investissement long terme.',
      '💳 Construis un excellent historique bancaire.',
      '📚 Continue à te former pour augmenter ta valeur.',
      '🌍 Diversifie tes sources de revenus.'
    ]
  }
}

