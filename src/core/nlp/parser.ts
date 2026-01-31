import type { ExpenseCategory, PaymentMethod } from '../../db/schema'
import type { ParsedExpense } from '../../stores/expenseStore'
import {
  categoryLookup,
  paymentLookup,
  numberWords,
  spendingVerbs,
  incomeVerbs
} from './dictionary'

export interface ParseResult {
  success: boolean
  expense?: ParsedExpense
  isIncome?: boolean
  error?: string
}

// Normalize text: lowercase, remove accents, normalize spaces
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

// Extract amount from text
function extractAmount(text: string): { amount: number; confidence: number } | null {
  const normalizedText = normalizeText(text)
  
  // Pattern 1: Direct numbers with optional currency
  // Matches: "500", "1500 f", "2 000 fcfa", "5000 francs"
  const numberPatterns = [
    /(\d+(?:\s*\d+)*)\s*(?:f(?:cfa)?|francs?|cfa|balles?)?(?:\s|$|,|\.)/gi,
    /(?:^|\s)(\d+(?:\s*\d+)*)(?:\s|$)/gi
  ]
  
  for (const pattern of numberPatterns) {
    const matches = [...normalizedText.matchAll(pattern)]
    for (const match of matches) {
      const numStr = match[1].replace(/\s/g, '')
      const num = parseInt(numStr, 10)
      if (!isNaN(num) && num > 0 && num <= 10000000) { // Max 10 million
        return { amount: num, confidence: 0.9 }
      }
    }
  }
  
  // Pattern 2: Written numbers (mille, cent, etc.)
  // "deux mille", "cinq cents", "mille francs"
  const writtenMatch = extractWrittenNumber(normalizedText)
  if (writtenMatch) {
    return { amount: writtenMatch, confidence: 0.7 }
  }
  
  // Pattern 3: Shorthand like "2k" or "5k"
  const shorthandMatch = normalizedText.match(/(\d+)\s*k(?:\s|$)/i)
  if (shorthandMatch) {
    const num = parseInt(shorthandMatch[1], 10) * 1000
    return { amount: num, confidence: 0.8 }
  }
  
  return null
}

// Extract written numbers like "deux mille cinq cents"
function extractWrittenNumber(text: string): number | null {
  const words = text.split(/\s+/)
  let result = 0
  let current = 0
  let foundNumber = false
  
  for (const word of words) {
    const normalized = word.toLowerCase()
    
    if (numberWords[normalized] !== undefined) {
      foundNumber = true
      const value = numberWords[normalized]
      
      if (value === 1000) {
        current = current === 0 ? 1000 : current * 1000
        result += current
        current = 0
      } else if (value === 100) {
        current = current === 0 ? 100 : current * 100
      } else {
        current += value
      }
    }
  }
  
  if (current > 0) {
    result += current
  }
  
  return foundNumber && result > 0 ? result : null
}

// Extract category from text
function extractCategory(text: string): { category: ExpenseCategory; subcategory?: string; confidence: number } | null {
  const normalizedText = normalizeText(text)
  const words = normalizedText.split(/\s+/)
  
  // Try exact phrase matches first (higher confidence)
  for (const [term, value] of categoryLookup) {
    if (normalizedText.includes(term)) {
      return {
        category: value.category,
        subcategory: value.subcategory,
        confidence: 0.9
      }
    }
  }
  
  // Try individual word matches
  for (const word of words) {
    const match = categoryLookup.get(word)
    if (match) {
      return {
        category: match.category,
        subcategory: match.subcategory,
        confidence: 0.7
      }
    }
  }
  
  return null
}

// Extract payment method from text
function extractPaymentMethod(text: string): { method: PaymentMethod; confidence: number } {
  const normalizedText = normalizeText(text)
  
  // Try phrase matches first
  for (const [term, method] of paymentLookup) {
    if (normalizedText.includes(term)) {
      return { method, confidence: 0.9 }
    }
  }
  
  // Try word matches
  const words = normalizedText.split(/\s+/)
  for (const word of words) {
    const method = paymentLookup.get(word)
    if (method) {
      return { method, confidence: 0.7 }
    }
  }
  
  // Default to cash (most common in CI context)
  return { method: 'cash', confidence: 0.5 }
}

// Check if text indicates income rather than expense
function isIncome(text: string): boolean {
  const normalizedText = normalizeText(text)
  return incomeVerbs.some(verb => normalizedText.includes(verb.toLowerCase()))
}

// Check if text indicates spending
function isSpending(text: string): boolean {
  const normalizedText = normalizeText(text)
  return spendingVerbs.some(verb => normalizedText.includes(verb.toLowerCase()))
}

// Generate description from parsed elements
function generateDescription(text: string, category: ExpenseCategory): string {
  // Clean up the text to create a description
  let description = text.trim()
  
  // Remove common filler words and verbs
  const fillerPatterns = [
    /^(j'ai |je |on a |on )/i,
    /(payé|payer|acheté|acheter|dépensé|dépenser|mis|mettre|donné|donner|pris|prendre|fait|faire)\s*/gi,
    /\d+\s*(f(?:cfa)?|francs?|cfa|balles?)?\s*/gi,
    /(avec |par |en )\s*(orange|mtn|moov|wave|carte|cash|espèce)/gi
  ]
  
  for (const pattern of fillerPatterns) {
    description = description.replace(pattern, '')
  }
  
  description = description.trim()
  
  // If description is empty, use category label
  if (!description || description.length < 2) {
    const categoryLabels: Record<ExpenseCategory, string> = {
      transport: 'Transport',
      nourriture: 'Nourriture',
      logement: 'Logement',
      sante: 'Santé',
      education: 'Éducation',
      communication: 'Communication',
      divertissement: 'Divertissement',
      vetements: 'Vêtements',
      famille: 'Famille',
      autre: 'Dépense'
    }
    description = categoryLabels[category]
  }
  
  // Capitalize first letter
  return description.charAt(0).toUpperCase() + description.slice(1)
}

// Main parsing function
export function parseExpenseText(text: string): ParseResult {
  if (!text || text.trim().length < 2) {
    return {
      success: false,
      error: "Texte trop court. Dis quelque chose comme 'Gbaka 500' ou 'J'ai payé 1500 pour le garba'."
    }
  }
  
  // Check if this is income
  if (isIncome(text) && !isSpending(text)) {
    return {
      success: false,
      isIncome: true,
      error: "Ça ressemble à un revenu, pas une dépense. Tu veux l'ajouter comme revenu ?"
    }
  }
  
  // Extract amount
  const amountResult = extractAmount(text)
  if (!amountResult) {
    return {
      success: false,
      error: "Je n'ai pas trouvé de montant. Essaie de dire le montant clairement, par exemple '500 francs'."
    }
  }
  
  // Extract category
  const categoryResult = extractCategory(text)
  const category = categoryResult?.category || 'autre'
  const subcategory = categoryResult?.subcategory
  
  // Extract payment method
  const paymentResult = extractPaymentMethod(text)
  
  // Generate description
  const description = generateDescription(text, category)
  
  // Calculate overall confidence
  const amountConfidence = amountResult.confidence
  const categoryConfidence = categoryResult?.confidence || 0.3
  const paymentConfidence = paymentResult.confidence
  const overallConfidence = (amountConfidence + categoryConfidence + paymentConfidence) / 3
  
  const expense: ParsedExpense = {
    amount: amountResult.amount,
    category,
    subcategory,
    description,
    paymentMethod: paymentResult.method,
    confidence: overallConfidence,
    originalText: text
  }
  
  return {
    success: true,
    expense
  }
}

// Format amount for display (with spaces for thousands)
export function formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Parse amount string back to number
export function parseAmountString(str: string): number {
  return parseInt(str.replace(/\s/g, ''), 10) || 0
}

