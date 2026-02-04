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
  problemDetails?: string[] // Détails supplémentaires sur les problèmes
  frequency?: Record<string, string> // Fréquence des problèmes (ex: "tous les mois", "chaque semaine")
  amounts?: Record<string, number> // Montants spécifiques mentionnés pour chaque problème
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

  // Detect challenges - Enhanced detection with more variations
  const challenges: string[] = []
  
  // Dépenses excessives générales
  if (lowerMessage.includes('dépense trop') || lowerMessage.includes('dépenses trop') ||
      lowerMessage.includes('je depense trop') || lowerMessage.includes('je depense beaucoup') ||
      lowerMessage.includes('trop depense') || lowerMessage.includes('argent part') ||
      lowerMessage.includes('argent s\'en va') || lowerMessage.includes('argent disparait')) {
    challenges.push('Dépenses excessives')
  }
  
  // Difficultés en fin de mois
  if (lowerMessage.includes('fin du mois') || lowerMessage.includes('fin de mois') ||
      lowerMessage.includes('du mal en fin') || lowerMessage.includes('plus d\'argent en fin') ||
      lowerMessage.includes('vide en fin') || lowerMessage.includes('difficile en fin') ||
      lowerMessage.includes('plus rien a la fin')) {
    challenges.push('Difficultés en fin de mois')
  }
  
  // Dépenses imprévues
  if (lowerMessage.includes('imprévu') || lowerMessage.includes('imprevu') ||
      lowerMessage.includes('urgence') || lowerMessage.includes('depense inattendue') ||
      lowerMessage.includes('probleme inattendu') || lowerMessage.includes('surprise')) {
    challenges.push('Dépenses imprévues')
  }
  
  // Dépenses de loisirs élevées
  if (lowerMessage.includes('restaurant') || lowerMessage.includes('maquis') || 
      lowerMessage.includes('sortie') || lowerMessage.includes('sorties') ||
      lowerMessage.includes('depense trop en sorties') || lowerMessage.includes('loisir') ||
      lowerMessage.includes('divertissement') || lowerMessage.includes('fete') ||
      lowerMessage.includes('soiree') || lowerMessage.includes('boire') ||
      lowerMessage.includes('manger dehors') || lowerMessage.includes('manger au restaurant')) {
    challenges.push('Dépenses de loisirs élevées')
  }
  
  // Coûts de transport
  if (lowerMessage.includes('transport') || lowerMessage.includes('taxi') || 
      lowerMessage.includes('gbaka') || lowerMessage.includes('woro') ||
      lowerMessage.includes('depense trop en transport') || lowerMessage.includes('transport me coute') ||
      lowerMessage.includes('transport cher') || lowerMessage.includes('deplacement') ||
      lowerMessage.includes('trajet') || lowerMessage.includes('voyage')) {
    challenges.push('Coûts de transport')
  }
  
  // Obligations familiales
  if (lowerMessage.includes('famille') || lowerMessage.includes('aider') ||
      lowerMessage.includes('aide ma famille') || lowerMessage.includes('aide beaucoup') ||
      lowerMessage.includes('donner a la famille') || lowerMessage.includes('obligation familiale') ||
      lowerMessage.includes('soutien famille') || lowerMessage.includes('parent') ||
      lowerMessage.includes('frere') || lowerMessage.includes('soeur') ||
      lowerMessage.includes('oncle') || lowerMessage.includes('tante')) {
    challenges.push('Obligations familiales')
  }
  
  // Charges de logement
  if (lowerMessage.includes('loyer') || lowerMessage.includes('logement') ||
      lowerMessage.includes('maison') || lowerMessage.includes('appartement') ||
      lowerMessage.includes('charges') || lowerMessage.includes('facture logement') ||
      lowerMessage.includes('habitation') || lowerMessage.includes('location')) {
    challenges.push('Charges de logement')
  }
  
  // Nourriture trop chère
  if (lowerMessage.includes('nourriture') || lowerMessage.includes('manger') ||
      lowerMessage.includes('alimentation') || lowerMessage.includes('course') ||
      lowerMessage.includes('depense trop en nourriture') || lowerMessage.includes('manger cher') ||
      lowerMessage.includes('aliment cher')) {
    challenges.push('Dépenses alimentaires élevées')
  }
  
  if (challenges.length > 0) {
    newContext.challenges = [...(currentContext.challenges || []), ...challenges].filter((v, i, a) => a.indexOf(v) === i)
    newContext.hasSharedProblem = true
  }

  // Extract detailed problem information from longer explanations
  const problemDetails: string[] = []
  const frequency: Record<string, string> = { ...currentContext.frequency }
  const amounts: Record<string, number> = { ...currentContext.amounts }

  // Detect frequency indicators
  if (lowerMessage.includes('tous les jours') || lowerMessage.includes('chaque jour') || lowerMessage.includes('quotidien')) {
    frequency['general'] = 'quotidien'
  }
  if (lowerMessage.includes('toutes les semaines') || lowerMessage.includes('chaque semaine') || lowerMessage.includes('hebdomadaire')) {
    frequency['general'] = 'hebdomadaire'
  }
  if (lowerMessage.includes('tous les mois') || lowerMessage.includes('chaque mois') || lowerMessage.includes('mensuel')) {
    frequency['general'] = 'mensuel'
  }

  // Extract specific amounts mentioned for problems
  challenges.forEach(challenge => {
    // Try to find amounts related to this specific challenge
    const challengeKeywords: Record<string, string[]> = {
      'Dépenses de loisirs élevées': ['sortie', 'maquis', 'restaurant', 'loisir', 'fete'],
      'Coûts de transport': ['transport', 'taxi', 'gbaka', 'deplacement'],
      'Obligations familiales': ['famille', 'aider', 'donner'],
      'Charges de logement': ['loyer', 'logement', 'maison'],
      'Dépenses alimentaires élevées': ['nourriture', 'manger', 'alimentation', 'course']
    }

    const keywords = challengeKeywords[challenge] || []
    keywords.forEach(keyword => {
      // Look for amounts near the keyword
      const keywordIndex = lowerMessage.indexOf(keyword)
      if (keywordIndex !== -1) {
        // Search for numbers near the keyword (within 30 characters)
        const contextAround = lowerMessage.substring(Math.max(0, keywordIndex - 30), Math.min(lowerMessage.length, keywordIndex + 30))
        const amountMatch = contextAround.match(/(\d[\d\s]*)\s*(?:francs?|f(?:cfa)?|fcfa)/i)
        if (amountMatch) {
          const amount = parseInt(amountMatch[1].replace(/\s/g, ''), 10)
          if (amount >= 1000 && amount <= 10000000) {
            amounts[challenge] = amount
            extractedInfo.push(`${challenge}: ${formatCurrency(amount)}`)
          }
        }
      }
    })
  })

  // Extract problem details from longer explanations
  // Look for sentences that explain the problem
  const sentences = message.split(/[.!?]\s+/)
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase()
    // Check if sentence contains problem indicators
    if (lowerSentence.includes('probleme') || lowerSentence.includes('difficulte') || 
        lowerSentence.includes('situation') || lowerSentence.includes('je ne peux pas') ||
        lowerSentence.includes('impossible') || lowerSentence.includes('je n\'arrive pas')) {
      // Extract the core of the problem
      let detail = sentence.trim()
      // Remove common filler words
      detail = detail.replace(/^(c\'est|ce|le|la|les|un|une|des|mon|ma|mes)\s+/i, '')
      if (detail.length > 20 && detail.length < 200) {
        problemDetails.push(detail)
      }
    }
  })

  if (problemDetails.length > 0) {
    newContext.problemDetails = [...(currentContext.problemDetails || []), ...problemDetails].slice(0, 5) // Keep max 5 details
  }
  if (Object.keys(frequency).length > 0) {
    newContext.frequency = frequency
  }
  if (Object.keys(amounts).length > 0) {
    newContext.amounts = amounts
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
• Des depenses specifiques a reduire ?
• Un nouveau defi a prendre en compte ?

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
        response: "Avant de creer ton PDF, j'ai besoin de quelques informations. Peux-tu me dire quelles sont tes difficultes pour epargner et quel est ton objectif d'epargne ?",
        shouldGeneratePlan: false
      }
    }
  }

  // Check if user wants a new/updated plan
  if (lowerMessage.includes('plan') || lowerMessage.includes('aide') || lowerMessage.includes('conseil') || 
      lowerMessage.includes('nouveau') || lowerMessage.includes('regenerer') || lowerMessage.includes('refaire') ||
      lowerMessage.includes('creer') || lowerMessage.includes('donne-moi')) {
    // If we have income (from app or user), we can generate a plan
    if (context.income) {
      // If user hasn't shared problems yet, ask for them first
      if (!context.hasSharedProblem) {
        return {
          response: `Parfait ! Je vais te creer un plan personnalise. Mais d'abord, dis-moi rapidement :

• Quelles sont tes principales difficultes pour epargner ? (ex: "je depense trop en sorties", "j'ai du mal en fin de mois")
• As-tu un objectif precis ? (ex: "je veux economiser 500 000 F en 6 mois pour un mariage")

Ou si tu veux, je peux te proposer un plan general adapte a ton revenu de ${formatCurrency(context.income)}/mois. Dis "plan general" ou "plan rapide".`,
          shouldGeneratePlan: false
        }
      }
      
      const prefix = hasPreviousPlan 
        ? "Voici ton nouveau plan d'epargne mis a jour !\n\n" 
        : ""
      return {
        response: prefix + generatePlanSummary(context),
        shouldGeneratePlan: true
      }
    } else {
      // No income yet - but we should use app data if available
      return {
        response: `Je vais te creer un plan personnalise ! Pour cela, j'ai besoin de connaitre :

• Quelles sont tes difficultes pour epargner ?
• Quel est ton objectif d'epargne (montant et duree) ?

Ou si tu veux, je peux analyser tes donnees existantes dans l'app pour te proposer un plan adapte. Dis "analyse mes donnees" ou "plan automatique".`,
        shouldGeneratePlan: false
      }
    }
  }

  // User continues conversation after a plan was generated
  if (hasPreviousPlan && context.income) {
    // Check if user is providing new information to update the plan
    const { context: updatedContext, extractedInfo } = analyzeMessage(userMessage, context)
    
    if (extractedInfo.length > 0) {
      // Merge updated context with existing context (preserve income and expenses from app)
      const mergedContext: ConversationContext = {
        ...context,
        ...updatedContext,
        // Preserve real data from app
        income: context.income,
        expenses: context.expenses,
        categorySpending: context.categorySpending || updatedContext.categorySpending
      }
      return {
        response: `J'ai bien note les nouvelles informations :
${extractedInfo.map(info => '• ' + info).join('\n')}

Je mets a jour ton plan en consequence. Voici la nouvelle version :

${generatePlanSummary(mergedContext)}`,
        shouldGeneratePlan: true
      }
    }
    
    // Check if user is asking questions about their budget/expenses
    if (lowerMessage.includes('depense') || lowerMessage.includes('budget') || 
        lowerMessage.includes('combien') || lowerMessage.includes('ou va')) {
      let budgetAdvice = ''
      
      if (context.expenses && context.expenses > 0) {
        budgetAdvice = `\n\nD'apres tes donnees, tu depenses environ ${formatCurrency(context.expenses)} par mois. `
        const savings = context.income - context.expenses
        if (savings > 0) {
          budgetAdvice += `Tu peux donc economiser ${formatCurrency(savings)} par mois. `
        } else {
          budgetAdvice += `Attention, tes depenses depassent ou egalent ton revenu. Il faut reduire certaines depenses. `
        }
      }
      
      if (context.categorySpending && Object.keys(context.categorySpending).length > 0) {
        const topCategory = Object.entries(context.categorySpending)
          .sort(([, a], [, b]) => b - a)[0]
        if (topCategory) {
          const [category, amount] = topCategory
          const categoryNames: Record<string, string> = {
            'nourriture': 'nourriture',
            'transport': 'transport',
            'divertissement': 'divertissement',
            'logement': 'logement',
            'communication': 'communication',
            'sante': 'santé',
            'education': 'éducation',
            'autre': 'autres dépenses'
          }
          budgetAdvice += `\n\nTa plus grosse depense est en **${categoryNames[category] || category}** : ${formatCurrency(amount)}/mois. On peut reduire ça pour augmenter ton epargne !`
        }
      }
      
      return {
        response: `Voici ce que je peux te dire sur ton budget :${budgetAdvice}

Tu veux que je te donne des conseils specifiques pour reduire tes depenses ou augmenter ton epargne ?`,
        shouldGeneratePlan: false
      }
    }
    
    // If user just says something else, offer to help more
    return {
      response: `Je suis la si tu as besoin d'autre chose ! Tu peux :

• **Modifier ton plan** : dis-moi ce que tu veux changer (objectif, duree...)
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
• Quelles sont tes difficultes pour epargner ?
• As-tu un objectif particulier (mariage, voiture, urgence...) ?
• Combien voudrais-tu economiser et en combien de temps ?

Plus tu me donnes de details, plus je pourrai t'aider avec un plan personnalise !`,
      shouldGeneratePlan: false
    }
  }

  // If we have income, ask about challenges
  if (context.income && !context.hasSharedProblem) {
    // Use real category spending if available to give personalized advice
    let personalizedAdvice = ''
    if (context.categorySpending) {
      const topCategory = Object.entries(context.categorySpending)
        .sort(([, a], [, b]) => b - a)[0]
      if (topCategory) {
        const [category, amount] = topCategory
        const categoryNames: Record<string, string> = {
          'nourriture': 'nourriture',
          'transport': 'transport',
          'divertissement': 'divertissement',
          'logement': 'logement',
          'communication': 'communication',
          'sante': 'santé',
          'education': 'éducation',
          'autre': 'autres dépenses'
        }
        personalizedAdvice = `\n\nJe vois que tu depenses beaucoup en **${categoryNames[category] || category}** (${formatCurrency(amount)}). On peut optimiser ça ! `
      }
    }
    
    return {
      response: `D'accord, je vois que tu gagnes ${formatCurrency(context.income)} par mois.${personalizedAdvice}C'est un bon debut pour planifier !

Maintenant, **explique-moi en detail** tes difficultes :
• Qu'est-ce qui t'empeche d'epargner actuellement ? (decris-moi ta situation)
• Ou va ton argent en general ? (transport, nourriture, sorties...)
• As-tu des depenses fixes importantes (loyer, factures) ?
• Combien tu depenses environ dans chaque categorie ?

**Plus tu me donnes de details, plus je pourrai te proposer une strategie precise et adaptee !** Sois honnete, je suis la pour t'aider, pas pour te juger !`,
      shouldGeneratePlan: false
    }
  }

  // If we have challenges but no income
  if (context.hasSharedProblem && !context.income) {
    const challengesList = context.challenges?.join(', ') || 'tes difficultes'
    let detailAcknowledgment = ''
    if (context.problemDetails && context.problemDetails.length > 0) {
      detailAcknowledgment = `\n\nJ'ai bien note : "${context.problemDetails[0]}"\n`
    }
    
    return {
      response: `Je comprends, ${challengesList} - c'est des defis courants.${detailAcknowledgment}On va trouver des solutions ensemble !

Pour te faire un plan sur mesure, j'ai besoin de savoir :
• Combien tu voudrais economiser et en combien de temps ?
• As-tu un objectif precis (mariage, voiture, urgence...) ?
• Peux-tu me donner plus de details sur ta situation financiere actuelle ?

Avec ces infos, je pourrai te creer un plan d'epargne realiste et adapte a ta situation.`,
      shouldGeneratePlan: false
    }
  }

  // If we have enough info, generate advice
  if (context.income && context.hasSharedProblem) {
    // Check if user gave detailed explanation
    const hasDetailedExplanation = context.problemDetails && context.problemDetails.length > 0
    const hasSpecificAmounts = context.amounts && Object.keys(context.amounts).length > 0
    
    // Ask for savings goal if not provided
    if (!context.savingsGoal) {
      // Use real expenses if available to give better advice
      let expenseInfo = ''
      if (context.expenses && context.expenses > 0) {
        const savings = context.income - context.expenses
        if (savings > 0) {
          expenseInfo = `\n\nAvec tes depenses actuelles (${formatCurrency(context.expenses)}/mois), tu peux deja economiser environ ${formatCurrency(savings)} par mois. `
        } else {
          expenseInfo = `\n\nAttention : tes depenses (${formatCurrency(context.expenses)}/mois) depassent ou egalent ton revenu. On doit reduire certaines depenses pour pouvoir epargner. `
        }
      }
      
      let acknowledgment = ''
      if (hasDetailedExplanation) {
        acknowledgment = `\n\n💡 **J'ai bien compris ta situation** :\n`
        context.problemDetails?.slice(0, 2).forEach(detail => {
          acknowledgment += `• ${detail}\n`
        })
        acknowledgment += `\n`
      }
      if (hasSpecificAmounts && context.amounts) {
        acknowledgment += `💰 **Montants notes** :\n`
        Object.entries(context.amounts).forEach(([challenge, amount]) => {
          acknowledgment += `• ${challenge}: ${formatCurrency(amount)}\n`
        })
        acknowledgment += `\n`
      }
      
      return {
        response: `Super ! J'ai une bonne idee de ta situation.${acknowledgment}Avec ${formatCurrency(context.income)} par mois et les defis que tu as mentionnes, je peux deja te donner des conseils.${expenseInfo}

Mais pour un plan complet, dis-moi :
• Combien voudrais-tu economiser au total ?
• En combien de temps ? (3 mois, 6 mois, 1 an...)

Ou si tu veux, je peux te proposer directement un plan adapte a tes revenus ! Tape "creer mon plan" ou "donne-moi un plan".`,
        shouldGeneratePlan: false
      }
    }

    // Generate full plan with acknowledgment of detailed explanation
    let planResponse = generatePlanSummary(context)
    
    if (hasDetailedExplanation || hasSpecificAmounts) {
      let acknowledgment = `\n\n---\n\n💡 **J'ai bien pris en compte tous les details que tu m'as donnes.** `
      if (hasDetailedExplanation) {
        acknowledgment += `Ta situation est claire pour moi. `
      }
      if (hasSpecificAmounts) {
        acknowledgment += `Les montants que tu as mentionnes sont integres dans le plan. `
      }
      acknowledgment += `Si tu veux preciser ou modifier quelque chose, dis-le moi !`
      
      planResponse = planResponse.replace(
        /Tu peux aussi \*\*modifier\*\* ce plan si tu veux changer l'objectif ou la duree\./,
        `Tu peux aussi **modifier** ce plan si tu veux changer l'objectif ou la duree.${acknowledgment}`
      )
    }

    // Generate full plan
    return {
      response: planResponse,
      shouldGeneratePlan: true
    }
  }

  // Default response - ask for more info
  return {
    response: `Je vois ! Pour mieux t'aider, peux-tu me donner plus de details ?

• Quelles sont tes principales difficultes pour epargner ?
• As-tu un objectif d'epargne precis (montant et duree) ?
• Pour quoi veux-tu economiser (mariage, voiture, urgence...) ?

N'hesite pas a me parler de ta situation, je suis la pour ca !`,
    shouldGeneratePlan: false
  }
}

// Generate personalized strategy based on user's specific problems
function generatePersonalizedStrategy(context: ConversationContext): string {
  if (!context.challenges || context.challenges.length === 0) {
    return ''
  }

  let strategy = `**Strategie personnalisee selon tes problemes :**\n\n`
  
  const income = context.income || 150000
  const challenges = context.challenges
  
  // Show understanding of detailed problem if available
  if (context.problemDetails && context.problemDetails.length > 0) {
    strategy += `💡 **Je comprends ta situation :**\n`
    context.problemDetails.slice(0, 2).forEach(detail => {
      strategy += `• ${detail}\n`
    })
    strategy += `\n`
  }

  // Strategy for "Dépenses de loisirs élevées"
  if (challenges.includes('Dépenses de loisirs élevées')) {
    const leisureAmount = context.amounts?.['Dépenses de loisirs élevées'] || context.categorySpending?.divertissement || Math.round(income * 0.10)
    const targetLeisure = Math.round(income * 0.05)
    const savings = leisureAmount - targetLeisure
    const frequency = context.frequency?.['general'] || 'hebdomadaire'
    
    strategy += `🎯 **Probleme : Tu depenses trop en sorties**\n`
    if (context.amounts?.['Dépenses de loisirs élevées']) {
      strategy += `• Tu depenses actuellement **${formatCurrency(leisureAmount)}/mois** en sorties\n`
      strategy += `• Objectif : reduire a **${formatCurrency(targetLeisure)}/mois** (economie de ${formatCurrency(savings)}/mois)\n`
    }
    if (frequency === 'quotidien' || frequency === 'hebdomadaire') {
      strategy += `• Tu sors ${frequency === 'quotidien' ? 'tous les jours' : 'toutes les semaines'} - c'est trop !\n`
      strategy += `• Limite a **1-2 fois par semaine maximum** (soit 4-8 fois/mois)\n`
    } else {
      strategy += `• Limite les sorties au maquis/restaurant a **1-2 fois par semaine maximum**\n`
    }
    strategy += `• Fixe un budget mensuel pour les sorties : **${formatCurrency(targetLeisure)}** (5% de ton revenu)\n`
    strategy += `• Organise des soirees a la maison entre amis (moins cher, aussi fun !)\n`
    strategy += `• Cherche des activites gratuites : plage, sport, evenements culturels\n`
    strategy += `• Avant chaque sortie, demande-toi : "Est-ce que je peux vraiment me le permettre ce mois ?"\n`
    if (savings > 0) {
      strategy += `• Avec cette reduction, tu economiseras **${formatCurrency(savings)}/mois** (${formatCurrency(savings * 12)}/an !)\n`
    }
    strategy += `\n`
  }

  // Strategy for "Difficultés en fin de mois"
  if (challenges.includes('Difficultés en fin de mois')) {
    strategy += `🎯 **Probleme : Tu as du mal en fin de mois**\n`
    strategy += `• **REGLE D'OR** : Epargne DES que tu recois ton salaire (pas ce qui reste !)\n`
    strategy += `• Divise ton budget mensuel en **4 semaines** : ${formatCurrency(Math.round(income / 4))}/semaine\n`
    strategy += `• Garde une reserve de **${formatCurrency(Math.round(income * 0.1))}** pour la derniere semaine\n`
    strategy += `• Utilise l'app pour suivre tes depenses quotidiennement\n`
    strategy += `• Fixe-toi une limite de **${formatCurrency(Math.round(income / 30))}/jour**\n`
    strategy += `• Evite les depenses importantes en fin de mois (attends le nouveau salaire)\n\n`
  }

  // Strategy for "Coûts de transport"
  if (challenges.includes('Coûts de transport')) {
    const transportAmount = context.amounts?.['Coûts de transport'] || context.categorySpending?.transport || Math.round(income * 0.15)
    const targetTransport = Math.round(income * 0.10)
    const savings = transportAmount - targetTransport
    const frequency = context.frequency?.['general']
    
    strategy += `🎯 **Probleme : Le transport te coute cher**\n`
    if (context.amounts?.['Coûts de transport']) {
      strategy += `• Tu depenses actuellement **${formatCurrency(transportAmount)}/mois** en transport\n`
      strategy += `• Objectif : reduire a **${formatCurrency(targetTransport)}/mois** (economie de ${formatCurrency(savings)}/mois)\n`
    }
    if (frequency === 'quotidien') {
      strategy += `• Tu utilises le transport tous les jours - optimisons ça !\n`
      strategy += `• Pour les trajets quotidiens, privilegie le **Gbaka/Woro-woro** (${formatCurrency(Math.round(targetTransport / 30))}/jour max)\n`
    } else {
      strategy += `• Privilegie le **Gbaka/Woro-woro** au taxi (economie de ${formatCurrency(Math.round(transportAmount * 0.4))}/mois)\n`
    }
    strategy += `• Regroupe tes deplacements : fais plusieurs courses en un seul trajet\n`
    strategy += `• Si possible, marche ou utilise un velo pour les courtes distances (< 2km)\n`
    strategy += `• Fixe un budget transport : **${formatCurrency(targetTransport)}/mois** (10% max)\n`
    strategy += `• Planifie tes deplacements a l'avance pour eviter les trajets inutiles\n`
    strategy += `• Partage les frais de transport avec des amis/collegues quand possible\n`
    if (savings > 0) {
      strategy += `• Avec cette reduction, tu economiseras **${formatCurrency(savings)}/mois**\n`
    }
    strategy += `\n`
  }

  // Strategy for "Obligations familiales"
  if (challenges.includes('Obligations familiales')) {
    strategy += `🎯 **Probleme : Tu aides beaucoup ta famille**\n`
    strategy += `• Fixe un **budget mensuel maximum** pour l'aide familiale : ${formatCurrency(Math.round(income * 0.15))} (15% max)\n`
    strategy += `• Apprends a dire **"non" gentiment** quand c'est au-dela de tes moyens\n`
    strategy += `• Explique ta situation : "Je dois aussi epargner pour mes projets personnels"\n`
    strategy += `• Propose des alternatives : aider en nature plutot qu'en argent quand possible\n`
    strategy += `• Priorise ton epargne : tu ne peux pas aider les autres si tu es toi-meme en difficulte\n`
    strategy += `• Si tu dois aider, fais-le de maniere planifiee, pas sur l'impulsion\n\n`
  }

  // Strategy for "Charges de logement"
  if (challenges.includes('Charges de logement')) {
    const currentHousing = context.categorySpending?.logement || Math.round(income * 0.35)
    const idealHousing = Math.round(income * 0.30)
    const savings = currentHousing - idealHousing
    strategy += `🎯 **Probleme : Les charges de logement sont elevees**\n`
    strategy += `• Le loyer ne devrait pas depasser **30% de ton revenu** (ideal : ${formatCurrency(idealHousing)})\n`
    if (savings > 0) {
      strategy += `• Tu depenses actuellement ${formatCurrency(currentHousing)}. Economie possible : ${formatCurrency(savings)}/mois\n`
    }
    strategy += `• Si ton loyer est trop eleve, cherche une alternative moins chere\n`
    strategy += `• Partage le logement avec quelqu'un pour diviser les frais\n`
    strategy += `• Negocie avec ton proprietaire si possible\n`
    strategy += `• Optimise les factures : eau, electricite (evite le gaspillage)\n\n`
  }

  // Strategy for "Dépenses imprévues"
  if (challenges.includes('Dépenses imprévues')) {
    const emergencyFund = Math.round((context.savingsGoal || income * 3) * 0.1)
    strategy += `🎯 **Probleme : Les depenses imprevues te derangent**\n`
    strategy += `• Cree un **fonds d'urgence** de ${formatCurrency(emergencyFund)} (10% de ton objectif)\n`
    strategy += `• Epargne ${formatCurrency(Math.round(emergencyFund / 6))}/mois pendant 6 mois pour le constituer\n`
    strategy += `• Ce fonds sert UNIQUEMENT pour les vraies urgences (sante, reparation essentielle)\n`
    strategy += `• Une fois le fonds d'urgence cree, continue avec ton objectif principal\n`
    strategy += `• Ne touche pas a ce fonds pour des depenses non urgentes\n\n`
  }

  // Strategy for "Dépenses excessives" (general)
  if (challenges.includes('Dépenses excessives')) {
    strategy += `🎯 **Probleme : Tu depenses trop en general**\n`
    strategy += `• Utilise la regle **50/30/20** :\n`
    strategy += `  - 50% pour les besoins essentiels (${formatCurrency(Math.round(income * 0.5))})\n`
    strategy += `  - 30% pour les envies/loisirs (${formatCurrency(Math.round(income * 0.3))})\n`
    strategy += `  - 20% pour l'epargne (${formatCurrency(Math.round(income * 0.2))})\n`
    strategy += `• Avant chaque achat, demande-toi : "En ai-je vraiment besoin ?"\n`
    strategy += `• Attends 24h avant d'acheter quelque chose de non essentiel\n`
    strategy += `• Suis tes depenses dans l'app chaque jour\n`
    strategy += `• Fixe-toi un "jour sans depense" par semaine\n\n`
  }

  // Strategy for "Dépenses alimentaires élevées"
  if (challenges.includes('Dépenses alimentaires élevées')) {
    const foodBudget = context.categorySpending?.nourriture || Math.round(income * 0.30)
    strategy += `🎯 **Probleme : Tu depenses trop en nourriture**\n`
    strategy += `• Fixe un budget nourriture : **${formatCurrency(Math.round(income * 0.25))}/mois** (25% max)\n`
    strategy += `• Cuisine plus a la maison (economie de ${formatCurrency(Math.round(foodBudget * 0.3))}/mois)\n`
    strategy += `• Fais tes courses avec une liste precise (evite les achats impulsifs)\n`
    strategy += `• Achete en gros les produits de base (riz, huile, etc.)\n`
    strategy += `• Limite les repas au restaurant/maquis a 2-3 fois par semaine max\n`
    strategy += `• Prepare tes repas a l'avance pour eviter de manger dehors\n\n`
  }

  return strategy
}

// Generate plan summary text
function generatePlanSummary(context: ConversationContext): string {
  const income = context.income || 150000
  const savingsGoal = context.savingsGoal || Math.round(income * 3) // Default: 3 months of income
  const timeline = context.timeline || Math.max(6, Math.ceil(savingsGoal / (income * 0.2))) // At least 6 months
  const savingsPerMonth = Math.round(savingsGoal / timeline)
  const savingsPercentage = Math.round((savingsPerMonth / income) * 100)

  let response = `**Voici ton plan d'epargne personnalise !**\n\n`
  
  response += `**Ta situation :**\n`
  response += `- Revenu mensuel : ${formatCurrency(income)}\n`
  
  // Use real expenses if available
  if (context.expenses && context.expenses > 0) {
    response += `- Depenses actuelles : ${formatCurrency(context.expenses)}/mois\n`
    const currentSavings = income - context.expenses
    if (currentSavings > 0) {
      response += `- Epargne actuelle possible : ${formatCurrency(currentSavings)}/mois\n`
    } else {
      response += `- ⚠️ Tes depenses depassent ton revenu. Il faut reduire certaines depenses.\n`
    }
  }
  
  // Show category breakdown if available
  if (context.categorySpending && Object.keys(context.categorySpending).length > 0) {
    const topCategories = Object.entries(context.categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amount]) => {
        const categoryNames: Record<string, string> = {
          'nourriture': 'Nourriture',
          'transport': 'Transport',
          'divertissement': 'Divertissement',
          'logement': 'Logement',
          'communication': 'Communication',
          'sante': 'Santé',
          'education': 'Éducation',
          'autre': 'Autres'
        }
        return `${categoryNames[cat] || cat}: ${formatCurrency(amount)}`
      })
      .join(', ')
    if (topCategories) {
      response += `- Top depenses : ${topCategories}\n`
    }
  }
  
  if (context.challenges && context.challenges.length > 0) {
    response += `- Defis identifies : ${context.challenges.join(', ')}\n`
  }
  response += `\n`

  response += `**Objectif :**\n`
  response += `- Epargner ${formatCurrency(savingsGoal)} en ${timeline} mois\n`
  response += `- Soit ${formatCurrency(savingsPerMonth)}/mois (${savingsPercentage}% de ton revenu)\n\n`

  // Add personalized strategy based on user's problems
  const personalizedStrategy = generatePersonalizedStrategy(context)
  if (personalizedStrategy) {
    response += personalizedStrategy
  }

  response += `**Actions generales :**\n`
  response += `- Suis tes depenses quotidiennement dans l'app\n`
  response += `- Fixe-toi une limite de ${formatCurrency(Math.round((income - savingsPerMonth) / 30))}/jour\n`
  response += `- Epargne DES que tu recois ton salaire (pas ce qui reste !)\n`
  response += `- Reviens ici chaque semaine pour faire le point\n\n`

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
      'Je depense trop en sorties',
      'J\'ai du mal en fin de mois',
      'Le transport me coute cher',
      'J\'aide beaucoup ma famille'
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

