import type { ExpenseCategory } from '../../db/schema'

// Message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  savingsPlan?: SavingsPlan
}

// Savings plan structure
export interface SavingsPlan {
  id: string
  title: string
  summary: string
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  savingsPercentage: number
  timelineMonths: number
  categories: SavingsPlanCategory[]
  steps: SavingsPlanStep[]
  tips: string[]
  createdAt: Date
}

export interface SavingsPlanCategory {
  category: ExpenseCategory
  currentAmount: number
  suggestedAmount: number
  savings: number
  priority: 'reduce' | 'maintain' | 'increase'
}

export interface SavingsPlanStep {
  week: number
  action: string
  target: number
  description: string
}

// Context for conversation
export interface ConversationContext {
  income?: number
  expenses?: number
  savingsGoal?: number
  timeline?: number
  challenges?: string[]
  priorities?: string[]
  categorySpending?: Record<ExpenseCategory, number>
  hasSharedProblem?: boolean
}

// Analyze user message to extract financial context
export function analyzeMessage(message: string, currentContext: ConversationContext): {
  context: ConversationContext
  extractedInfo: string[]
} {
  const lowerMessage = message.toLowerCase()
  const extractedInfo: string[] = []
  const newContext = { ...currentContext }

  // Extract income
  const incomeMatch = message.match(/(\d[\d\s]*)\s*(?:francs?|f(?:cfa)?|fcfa)?\s*(?:par mois|\/mois|mensuel|de salaire|de revenu|je gagne)/i) ||
                      message.match(/(?:je gagne|salaire|revenu|income).*?(\d[\d\s]*)/i) ||
                      message.match(/(\d{4,})(?:\s*f)?/i)
  if (incomeMatch) {
    const amount = parseInt(incomeMatch[1].replace(/\s/g, ''), 10)
    if (amount >= 10000 && amount <= 10000000) {
      newContext.income = amount
      extractedInfo.push(`Revenu mensuel: ${formatCurrency(amount)}`)
    }
  }

  // Extract savings goal
  const goalMatch = message.match(/(?:économiser|épargner|mettre de côté|objectif).*?(\d[\d\s]*)/i) ||
                    message.match(/(\d[\d\s]*)\s*(?:francs?|f)?\s*(?:d'économie|d'épargne|à économiser)/i)
  if (goalMatch) {
    const amount = parseInt(goalMatch[1].replace(/\s/g, ''), 10)
    if (amount > 0) {
      newContext.savingsGoal = amount
      extractedInfo.push(`Objectif d'épargne: ${formatCurrency(amount)}`)
    }
  }

  // Extract timeline
  const timelineMatch = message.match(/(\d+)\s*mois/i) ||
                        message.match(/(?:en|dans|d'ici)\s*(\d+)\s*(?:mois|semaines)/i)
  if (timelineMatch) {
    const months = parseInt(timelineMatch[1], 10)
    if (months > 0 && months <= 60) {
      newContext.timeline = months
      extractedInfo.push(`Durée: ${months} mois`)
    }
  }

  // Detect challenges
  const challenges: string[] = []
  if (lowerMessage.includes('dépense trop') || lowerMessage.includes('dépenses trop')) {
    challenges.push('Dépenses excessives')
  }
  if (lowerMessage.includes('fin du mois') || lowerMessage.includes('fin de mois')) {
    challenges.push('Difficultés en fin de mois')
  }
  if (lowerMessage.includes('imprévu') || lowerMessage.includes('urgence')) {
    challenges.push('Dépenses imprévues')
  }
  if (lowerMessage.includes('restaurant') || lowerMessage.includes('maquis') || lowerMessage.includes('sortie')) {
    challenges.push('Dépenses de loisirs élevées')
  }
  if (lowerMessage.includes('transport') || lowerMessage.includes('taxi') || lowerMessage.includes('gbaka')) {
    challenges.push('Coûts de transport')
  }
  if (lowerMessage.includes('famille') || lowerMessage.includes('aider')) {
    challenges.push('Obligations familiales')
  }
  if (lowerMessage.includes('loyer') || lowerMessage.includes('logement')) {
    challenges.push('Charges de logement')
  }
  if (challenges.length > 0) {
    newContext.challenges = [...(currentContext.challenges || []), ...challenges].filter((v, i, a) => a.indexOf(v) === i)
    newContext.hasSharedProblem = true
  }

  // Detect priorities
  const priorities: string[] = []
  if (lowerMessage.includes('mariage') || lowerMessage.includes('cérémonie')) {
    priorities.push('Événement (mariage/cérémonie)')
  }
  if (lowerMessage.includes('voiture') || lowerMessage.includes('moto')) {
    priorities.push('Achat de véhicule')
  }
  if (lowerMessage.includes('maison') || lowerMessage.includes('terrain') || lowerMessage.includes('immobilier')) {
    priorities.push('Projet immobilier')
  }
  if (lowerMessage.includes('business') || lowerMessage.includes('commerce') || lowerMessage.includes('entreprise')) {
    priorities.push('Création d\'entreprise')
  }
  if (lowerMessage.includes('étude') || lowerMessage.includes('formation') || lowerMessage.includes('école')) {
    priorities.push('Éducation/Formation')
  }
  if (lowerMessage.includes('urgence') || lowerMessage.includes('imprévu')) {
    priorities.push('Fonds d\'urgence')
  }
  if (priorities.length > 0) {
    newContext.priorities = [...(currentContext.priorities || []), ...priorities].filter((v, i, a) => a.indexOf(v) === i)
  }

  return { context: newContext, extractedInfo }
}

// Generate AI response based on context
export function generateResponse(
  userMessage: string,
  context: ConversationContext,
  messageHistory: ChatMessage[],
  hasPreviousPlan: boolean = false
): { response: string; shouldGeneratePlan: boolean } {
  const lowerMessage = userMessage.toLowerCase()
  const isFirstMessage = messageHistory.filter(m => m.role === 'user').length <= 1

  // Check if user wants to modify the plan
  const wantsToModify = lowerMessage.includes('modifier') || 
                        lowerMessage.includes('changer') || 
                        lowerMessage.includes('ajuster') ||
                        lowerMessage.includes('augmenter') ||
                        lowerMessage.includes('diminuer') ||
                        lowerMessage.includes('reduire') ||
                        lowerMessage.includes('plus') ||
                        lowerMessage.includes('moins') ||
                        lowerMessage.includes('different') ||
                        lowerMessage.includes('autre')

  // If user wants to modify an existing plan
  if (hasPreviousPlan && wantsToModify) {
    return {
      response: `Pas de probleme ! Je peux ajuster ton plan. Dis-moi ce que tu veux modifier :

• Un nouvel objectif d'epargne ? (ex: "je veux economiser 200 000 F")
• Une nouvelle duree ? (ex: "je veux le faire en 3 mois")
• Un nouveau revenu ? (ex: "en fait je gagne 180 000 F")
• Des depenses specifiques a reduire ?

Donne-moi les nouvelles infos et je te prepare un nouveau plan adapte !`,
      shouldGeneratePlan: false
    }
  }

  // Check if user wants a PDF
  if (lowerMessage.includes('pdf') || lowerMessage.includes('document') || lowerMessage.includes('telecharger')) {
    if (context.income && context.hasSharedProblem) {
      return {
        response: "Parfait ! Je vais generer ton plan d'epargne personnalise en PDF. Clique sur le bouton ci-dessous pour telecharger ton plan.",
        shouldGeneratePlan: true
      }
    } else {
      return {
        response: "Avant de creer ton PDF, j'ai besoin de quelques informations. Peux-tu me dire combien tu gagnes par mois et quelles sont tes difficultes pour epargner ?",
        shouldGeneratePlan: false
      }
    }
  }

  // Check if user wants a new/updated plan
  if (lowerMessage.includes('plan') || lowerMessage.includes('aide') || lowerMessage.includes('conseil') || 
      lowerMessage.includes('nouveau') || lowerMessage.includes('regenerer') || lowerMessage.includes('refaire')) {
    if (context.income && context.hasSharedProblem) {
      const prefix = hasPreviousPlan 
        ? "Voici ton nouveau plan d'epargne mis a jour !\n\n" 
        : ""
      return {
        response: prefix + generatePlanSummary(context),
        shouldGeneratePlan: true
      }
    }
  }

  // User continues conversation after a plan was generated
  if (hasPreviousPlan && context.income) {
    // Check if user is providing new information to update the plan
    const { extractedInfo } = analyzeMessage(userMessage, context)
    
    if (extractedInfo.length > 0) {
      return {
        response: `J'ai bien note les nouvelles informations :
${extractedInfo.map(info => '• ' + info).join('\n')}

Je mets a jour ton plan en consequence. Voici la nouvelle version :

${generatePlanSummary(context)}`,
        shouldGeneratePlan: true
      }
    }
    
    // If user just says something else, offer to help more
    return {
      response: `Je suis la si tu as besoin d'autre chose ! Tu peux :

• **Modifier ton plan** : dis-moi ce que tu veux changer (objectif, duree, revenu...)
• **Telecharger le PDF** : tape "telecharger PDF"
• **Obtenir plus de conseils** : pose-moi des questions sur ton budget
• **Recommencer** : dis "nouveau plan" pour repartir de zero

Qu'est-ce que je peux faire pour toi ?`,
      shouldGeneratePlan: false
    }
  }

  // First message - greeting
  if (isFirstMessage) {
    return {
      response: `Salut ! Je suis ton assistant financier personnel. Je suis la pour t'aider a mieux gerer ton argent et atteindre tes objectifs d'epargne.

Dis-moi :
• Combien tu gagnes par mois ?
• Quelles sont tes difficultes pour epargner ?
• As-tu un objectif particulier (mariage, voiture, urgence...) ?

Plus tu me donnes de details, plus je pourrai t'aider avec un plan personnalise !`,
      shouldGeneratePlan: false
    }
  }

  // If we have income, ask about challenges
  if (context.income && !context.hasSharedProblem) {
    return {
      response: `D'accord, tu gagnes ${formatCurrency(context.income)} par mois. C'est un bon debut pour planifier !

Maintenant, parle-moi de tes difficultes :
• Qu'est-ce qui t'empeche d'epargner actuellement ?
• Ou va ton argent en general ? (transport, nourriture, sorties...)
• As-tu des depenses fixes importantes (loyer, factures) ?

Sois honnete, je suis la pour t'aider, pas pour te juger !`,
      shouldGeneratePlan: false
    }
  }

  // If we have challenges but no income
  if (context.hasSharedProblem && !context.income) {
    const challengesList = context.challenges?.join(', ') || 'tes difficultes'
    return {
      response: `Je comprends, ${challengesList} - c'est des defis courants. On va trouver des solutions ensemble !

Pour te faire un plan sur mesure, j'ai besoin de savoir :
• Combien tu gagnes par mois (salaire, revenus) ?
• Combien tu voudrais economiser et en combien de temps ?

Avec ces infos, je pourrai te creer un plan d'epargne realiste et adapte a ta situation.`,
      shouldGeneratePlan: false
    }
  }

  // If we have enough info, generate advice
  if (context.income && context.hasSharedProblem) {
    // Ask for savings goal if not provided
    if (!context.savingsGoal) {
      return {
        response: `Super ! J'ai une bonne idee de ta situation. Avec ${formatCurrency(context.income)} par mois et les defis que tu as mentionnes, je peux deja te donner des conseils.

Mais pour un plan complet, dis-moi :
• Combien voudrais-tu economiser au total ?
• En combien de temps ? (3 mois, 6 mois, 1 an...)

Ou si tu veux, je peux te proposer directement un plan adapte a tes revenus ! Tape "creer mon plan" ou "donne-moi un plan".`,
        shouldGeneratePlan: false
      }
    }

    // Generate full plan
    return {
      response: generatePlanSummary(context),
      shouldGeneratePlan: true
    }
  }

  // Default response - ask for more info
  return {
    response: `Je vois ! Pour mieux t'aider, peux-tu me donner plus de details ?

• Quel est ton revenu mensuel ?
• Quelles sont tes principales depenses ?
• As-tu un objectif d'epargne precis ?

N'hesite pas a me parler de ta situation, je suis la pour ca !`,
    shouldGeneratePlan: false
  }
}

// Generate plan summary text
function generatePlanSummary(context: ConversationContext): string {
  const income = context.income || 150000
  const savingsGoal = context.savingsGoal || Math.round(income * 0.2)
  const timeline = context.timeline || 6
  const savingsPerMonth = Math.round(savingsGoal / timeline)
  const savingsPercentage = Math.round((savingsPerMonth / income) * 100)

  let response = `**Voici ton plan d'epargne personnalise !**\n\n`
  
  response += `**Ta situation :**\n`
  response += `- Revenu mensuel : ${formatCurrency(income)}\n`
  if (context.challenges && context.challenges.length > 0) {
    response += `- Defis identifies : ${context.challenges.join(', ')}\n`
  }
  response += `\n`

  response += `**Objectif :**\n`
  response += `- Epargner ${formatCurrency(savingsGoal)} en ${timeline} mois\n`
  response += `- Soit ${formatCurrency(savingsPerMonth)}/mois (${savingsPercentage}% de ton revenu)\n\n`

  response += `**Actions recommandees :**\n`
  
  if (context.challenges?.includes('Dépenses de loisirs élevées')) {
    response += `- Limite les sorties au maquis a 1-2x/semaine\n`
  }
  if (context.challenges?.includes('Coûts de transport')) {
    response += `- Privilegie le Gbaka au taxi quand possible\n`
  }
  if (context.challenges?.includes('Difficultés en fin de mois')) {
    response += `- Mets ton epargne de cote DES que tu recois ton salaire\n`
  }
  if (context.challenges?.includes('Dépenses imprévues')) {
    response += `- Cree un mini fonds d'urgence (10% de ton objectif)\n`
  }
  
  response += `- Suis tes depenses quotidiennement dans l'app\n`
  response += `- Fixe-toi une limite de ${formatCurrency(Math.round((income - savingsPerMonth) / 30))}/jour\n\n`

  response += `Tu veux ce plan en **PDF** ? Tape "telecharger PDF" ou clique sur le bouton ci-dessous !\n\n`
  response += `Tu peux aussi **modifier** ce plan si tu veux changer l'objectif ou la duree.`

  return response
}

// Interface for real user data
export interface RealUserData {
  actualIncome: number
  actualExpenses: number
  categorySpending?: Record<ExpenseCategory, number>
}

// Generate full savings plan with real user data
export function generateSavingsPlan(context: ConversationContext, realData?: RealUserData): SavingsPlan {
  // Use real data from the app if available, otherwise fallback to context or default
  const income = realData?.actualIncome || context.income || 150000
  const actualMonthlyExpenses = realData?.actualExpenses || context.expenses || Math.round(income * 0.8)
  const savingsGoal = context.savingsGoal || Math.round(income * 3) // 3 months of income by default
  const timeline = context.timeline || Math.max(6, Math.ceil(savingsGoal / (income * 0.2))) // At least 6 months
  const savingsPerMonth = Math.round(savingsGoal / timeline)
  const savingsPercentage = Math.round((savingsPerMonth / income) * 100)
  const monthlyExpenses = Math.max(actualMonthlyExpenses, income - savingsPerMonth)

  // Get real category spending if available
  const realCategorySpending = realData?.categorySpending || context.categorySpending

  // Generate category breakdown using real data when available
  const categories: SavingsPlanCategory[] = [
    {
      category: 'logement',
      currentAmount: realCategorySpending?.logement || Math.round(income * 0.35),
      suggestedAmount: Math.round(income * 0.30),
      savings: Math.round((realCategorySpending?.logement || Math.round(income * 0.35)) - Math.round(income * 0.30)),
      priority: context.challenges?.includes('Charges de logement') ? 'reduce' : 'maintain'
    },
    {
      category: 'nourriture',
      currentAmount: realCategorySpending?.nourriture || Math.round(income * 0.30),
      suggestedAmount: Math.round(income * 0.25),
      savings: Math.round((realCategorySpending?.nourriture || Math.round(income * 0.30)) - Math.round(income * 0.25)),
      priority: 'reduce'
    },
    {
      category: 'transport',
      currentAmount: realCategorySpending?.transport || Math.round(income * 0.15),
      suggestedAmount: Math.round(income * 0.10),
      savings: Math.round((realCategorySpending?.transport || Math.round(income * 0.15)) - Math.round(income * 0.10)),
      priority: context.challenges?.includes('Coûts de transport') ? 'reduce' : 'maintain'
    },
    {
      category: 'divertissement',
      currentAmount: realCategorySpending?.divertissement || Math.round(income * 0.10),
      suggestedAmount: Math.round(income * 0.05),
      savings: Math.round((realCategorySpending?.divertissement || Math.round(income * 0.10)) - Math.round(income * 0.05)),
      priority: context.challenges?.includes('Dépenses de loisirs élevées') ? 'reduce' : 'maintain'
    },
    {
      category: 'communication',
      currentAmount: realCategorySpending?.communication || Math.round(income * 0.05),
      suggestedAmount: Math.round(income * 0.03),
      savings: Math.round((realCategorySpending?.communication || Math.round(income * 0.05)) - Math.round(income * 0.03)),
      priority: 'maintain'
    }
  ]

  // Generate weekly steps
  const steps: SavingsPlanStep[] = [
    {
      week: 1,
      action: 'Mettre en place l\'épargne automatique',
      target: savingsPerMonth,
      description: `Dès réception du salaire, mets ${formatCurrency(savingsPerMonth)} de côté`
    },
    {
      week: 2,
      action: 'Analyser et réduire les dépenses',
      target: Math.round(monthlyExpenses * 0.9),
      description: 'Identifie 2-3 dépenses non essentielles à réduire'
    },
    {
      week: 3,
      action: 'Optimiser le quotidien',
      target: Math.round((income - savingsPerMonth) / 30),
      description: 'Respecte ta limite de dépenses quotidienne'
    },
    {
      week: 4,
      action: 'Bilan et ajustement',
      target: savingsPerMonth,
      description: 'Vérifie que tu as atteint ton objectif mensuel'
    }
  ]

  // Generate tips based on challenges
  const tips: string[] = [
    'Épargne DÈS que tu reçois ton salaire, pas ce qui reste à la fin du mois',
    'Utilise l\'app chaque jour pour noter tes dépenses',
    'Fixe-toi un "jour sans dépense" par semaine'
  ]

  if (context.challenges?.includes('Dépenses de loisirs élevées')) {
    tips.push('Remplace 1 sortie au maquis par une soirée à la maison entre amis')
    tips.push('Cherche des activités gratuites : plage, sport, événements culturels')
  }
  if (context.challenges?.includes('Coûts de transport')) {
    tips.push('Prends le Gbaka ou Woro-woro plutôt que le taxi')
    tips.push('Regroupe tes déplacements pour économiser')
  }
  if (context.challenges?.includes('Difficultés en fin de mois')) {
    tips.push('Divise ton budget mensuel par 4 semaines')
    tips.push('Garde une petite réserve pour la dernière semaine')
  }
  if (context.challenges?.includes('Obligations familiales')) {
    tips.push('Fixe un budget mensuel maximum pour l\'aide familiale')
    tips.push('Apprends à dire non gentiment quand c\'est au-delà de tes moyens')
  }

  // Generate title based on priorities
  let title = 'Plan d\'épargne personnalisé'
  if (context.priorities && context.priorities.length > 0) {
    title = `Plan d'épargne : ${context.priorities[0]}`
  }

  return {
    id: crypto.randomUUID(),
    title,
    summary: `Plan pour économiser ${formatCurrency(savingsGoal)} en ${timeline} mois avec un revenu de ${formatCurrency(income)}/mois`,
    monthlyIncome: income,
    monthlyExpenses,
    savingsGoal,
    savingsPercentage,
    timelineMonths: timeline,
    categories,
    steps,
    tips,
    createdAt: new Date()
  }
}

// Helper function
function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F'
}

// Quick replies suggestions
export function getQuickReplies(context: ConversationContext, hasPreviousPlan: boolean = false): string[] {
  // If a plan was already generated, show modification options
  if (hasPreviousPlan) {
    return [
      'Telecharger en PDF',
      'Modifier mon objectif',
      'Changer la duree',
      'Nouveau plan',
      'Plus de conseils'
    ]
  }

  if (!context.income) {
    return [
      'Je gagne 100 000 F/mois',
      'Je gagne 150 000 F/mois',
      'Je gagne 200 000 F/mois',
      'Je gagne 300 000 F/mois'
    ]
  }
  
  if (!context.hasSharedProblem) {
    return [
      'Je depense trop en sorties',
      'J\'ai du mal en fin de mois',
      'Le transport me coute cher',
      'J\'aide beaucoup ma famille'
    ]
  }

  if (!context.savingsGoal) {
    return [
      'Je veux economiser 100 000 F',
      'Je veux economiser 500 000 F',
      'Creer mon plan d\'epargne',
      'Telecharger en PDF'
    ]
  }

  return [
    'Creer mon plan',
    'Telecharger en PDF',
    'Plus de conseils',
    'Recommencer'
  ]
}

