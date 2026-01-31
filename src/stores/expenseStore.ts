import { create } from 'zustand'
import { 
  db,
  addExpense, 
  addIncome,
  deleteExpenseById,
  getTodayExpenses, 
  getThisMonthExpenses,
  getThisMonthIncomes,
  getTotalByCategory,
  getUserOnboardingStatus,
  setUserOnboardingCompleted,
  clearUserData,
  getSyncQueueCount,
  type Expense, 
  type Income,
  type ExpenseCategory, 
  type PaymentMethod 
} from '../db/schema'
import { useAuthStore } from './authStore'

// Parsed expense from NLP
export interface ParsedExpense {
  amount: number
  category: ExpenseCategory
  subcategory?: string
  description: string
  paymentMethod: PaymentMethod
  confidence: number
  originalText: string
}

// Store state
interface ExpenseState {
  // Onboarding
  hasCompletedOnboarding: boolean
  isLoadingOnboarding: boolean
  
  // UI State
  isRecording: boolean
  isProcessing: boolean
  currentTranscript: string
  parsedExpense: ParsedExpense | null
  showConfirmation: boolean
  
  // Data
  expenses: Expense[]
  incomes: Income[]
  todayExpenses: Expense[]
  monthExpenses: Expense[]
  monthIncomes: Income[]
  categoryTotals: Record<ExpenseCategory, number>
  
  // Computed
  totalExpenses: number
  totalIncomes: number
  
  // Sync
  isOnline: boolean
  pendingSyncCount: number
  isSyncing: boolean
  lastSyncAt: Date | null
  
  // Messages
  aiMessage: string
  
  // Actions
  setRecording: (recording: boolean) => void
  setProcessing: (processing: boolean) => void
  setTranscript: (transcript: string) => void
  setParsedExpense: (expense: ParsedExpense | null) => void
  setShowConfirmation: (show: boolean) => void
  setAiMessage: (message: string) => void
  
  // Onboarding actions
  completeOnboarding: () => Promise<void>
  checkOnboardingStatus: () => Promise<void>
  
  // Data actions
  confirmExpense: () => Promise<void>
  cancelExpense: () => void
  updateParsedExpense: (updates: Partial<ParsedExpense>) => void
  refreshData: () => Promise<void>
  addNewExpense: (expense: Omit<Expense, 'id' | 'userId' | 'localId' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>
  addNewIncome: (income: Omit<Income, 'id' | 'userId' | 'localId' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>
  deleteExpense: (id: number) => Promise<void>
  resetStore: () => Promise<void>
  
  // Sync actions
  syncNow: () => Promise<void>
  initializeStore: () => Promise<void>
}

// AI Messages - chaleureux, style ivoirien
const aiMessages = {
  welcome: [
    "Salut chef ! Prêt à noter tes dépenses ?",
    "Hey ! Comment ça va aujourd'hui ?",
    "Bienvenue ! Dis-moi ce que tu as dépensé."
  ],
  confirmed: [
    "C'est noté, chef !",
    "Okay, j'ai enregistré ça !",
    "C'est bon, c'est fait !",
    "Parfait, c'est dans la boîte !",
    "Voilà, c'est enregistré !"
  ],
  cancelled: [
    "Pas de souci, on oublie ça.",
    "D'accord, j'annule.",
    "Ok, c'est annulé !"
  ],
  listening: [
    "Je t'écoute...",
    "Dis-moi tout...",
    "Oui, je note..."
  ],
  processing: [
    "Attends, je réfléchis...",
    "Je calcule ça...",
    "Un instant..."
  ],
  error: [
    "Aïe, j'ai pas compris. Tu peux répéter ?",
    "Hm, c'est pas clair. Essaie encore ?",
    "Désolé, j'ai raté ça. On recommence ?"
  ]
}

function getRandomMessage(type: keyof typeof aiMessages): string {
  const messages = aiMessages[type]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  const authState = useAuthStore.getState()
  return authState.user?.id ?? null
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  // Onboarding state
  hasCompletedOnboarding: false,
  isLoadingOnboarding: true,
  
  // Initial state
  isRecording: false,
  isProcessing: false,
  currentTranscript: '',
  parsedExpense: null,
  showConfirmation: false,
  
  expenses: [],
  incomes: [],
  todayExpenses: [],
  monthExpenses: [],
  monthIncomes: [],
  categoryTotals: {
    transport: 0,
    nourriture: 0,
    logement: 0,
    sante: 0,
    education: 0,
    communication: 0,
    divertissement: 0,
    vetements: 0,
    famille: 0,
    autre: 0
  },
  
  totalExpenses: 0,
  totalIncomes: 0,
  
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  isSyncing: false,
  lastSyncAt: null,
  
  aiMessage: getRandomMessage('welcome'),
  
  // Setters
  setRecording: (recording) => set({ 
    isRecording: recording,
    aiMessage: recording ? getRandomMessage('listening') : get().aiMessage
  }),
  
  setProcessing: (processing) => set({ 
    isProcessing: processing,
    aiMessage: processing ? getRandomMessage('processing') : get().aiMessage
  }),
  
  setTranscript: (transcript) => set({ currentTranscript: transcript }),
  
  setParsedExpense: (expense) => set({ 
    parsedExpense: expense,
    showConfirmation: expense !== null
  }),
  
  setShowConfirmation: (show) => set({ showConfirmation: show }),
  
  setAiMessage: (message) => set({ aiMessage: message }),
  
  // Check onboarding status for current user
  checkOnboardingStatus: async () => {
    const userId = getCurrentUserId()
    if (!userId) {
      set({ hasCompletedOnboarding: false, isLoadingOnboarding: false })
      return
    }
    
    try {
      const completed = await getUserOnboardingStatus(userId)
      set({ 
        hasCompletedOnboarding: completed,
        isLoadingOnboarding: false
      })
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      set({ hasCompletedOnboarding: false, isLoadingOnboarding: false })
    }
  },
  
  // Complete onboarding for current user
  completeOnboarding: async () => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      await setUserOnboardingCompleted(userId)
      set({ hasCompletedOnboarding: true })
      await get().refreshData()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  },
  
  // Update parsed expense (for manual corrections)
  updateParsedExpense: (updates) => {
    const current = get().parsedExpense
    if (current) {
      set({ parsedExpense: { ...current, ...updates } })
    }
  },
  
  // Add new expense
  addNewExpense: async (expense) => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      await addExpense(userId, expense)
      set({ aiMessage: getRandomMessage('confirmed') })
      await get().refreshData()
      const count = await getSyncQueueCount(userId)
      set({ pendingSyncCount: count })
    } catch (error) {
      console.error('Error saving expense:', error)
      set({ aiMessage: getRandomMessage('error') })
    }
  },
  
  // Confirm and save expense
  confirmExpense: async () => {
    const { parsedExpense, refreshData } = get()
    const userId = getCurrentUserId()
    if (!parsedExpense || !userId) return
    
    try {
      await addExpense(userId, {
        amount: parsedExpense.amount,
        category: parsedExpense.category,
        subcategory: parsedExpense.subcategory,
        description: parsedExpense.description,
        paymentMethod: parsedExpense.paymentMethod,
        date: new Date()
      })
      
      set({
        parsedExpense: null,
        showConfirmation: false,
        currentTranscript: '',
        aiMessage: getRandomMessage('confirmed')
      })
      
      await refreshData()
      
      const count = await getSyncQueueCount(userId)
      set({ pendingSyncCount: count })
      
    } catch (error) {
      console.error('Error saving expense:', error)
      set({ aiMessage: getRandomMessage('error') })
    }
  },
  
  // Cancel expense
  cancelExpense: () => {
    set({
      parsedExpense: null,
      showConfirmation: false,
      currentTranscript: '',
      aiMessage: getRandomMessage('cancelled')
    })
  },
  
  // Delete expense
  deleteExpense: async (id: number) => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      await deleteExpenseById(userId, id)
      await get().refreshData()
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  },
  
  // Add income
  addNewIncome: async (income) => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      await addIncome(userId, income)
      await get().refreshData()
      const count = await getSyncQueueCount(userId)
      set({ pendingSyncCount: count })
    } catch (error) {
      console.error('Error saving income:', error)
    }
  },
  
  // Reset store and clear all user data
  resetStore: async () => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      await clearUserData(userId)
      set({
        hasCompletedOnboarding: false,
        expenses: [],
        incomes: [],
        todayExpenses: [],
        monthExpenses: [],
        monthIncomes: [],
        totalExpenses: 0,
        totalIncomes: 0,
        pendingSyncCount: 0
      })
    } catch (error) {
      console.error('Error resetting store:', error)
    }
  },
  
  // Refresh all data for current user
  refreshData: async () => {
    const userId = getCurrentUserId()
    if (!userId) return
    
    try {
      const [today, month, incomes] = await Promise.all([
        getTodayExpenses(userId),
        getThisMonthExpenses(userId),
        getThisMonthIncomes(userId)
      ])
      
      // Calculate category totals for this month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      const totals = await getTotalByCategory(userId, startOfMonth, endOfMonth)
      
      const totalExp = month.reduce((sum, e) => sum + e.amount, 0)
      const totalInc = incomes.reduce((sum, i) => sum + i.amount, 0)
      
      set({
        expenses: month,
        incomes: incomes,
        todayExpenses: today,
        monthExpenses: month,
        monthIncomes: incomes,
        categoryTotals: totals,
        totalExpenses: totalExp,
        totalIncomes: totalInc
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  },
  
  // Sync with server
  syncNow: async () => {
    // Sync functionality disabled for now
    set({ isSyncing: false })
  },
  
  // Initialize store for current user
  initializeStore: async () => {
    // Set up online/offline listeners
    const handleOnline = () => set({ isOnline: true })
    const handleOffline = () => set({ isOnline: false })
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check onboarding status for current user
    await get().checkOnboardingStatus()
    
    // Load initial data
    await get().refreshData()
    
    // Get pending sync count
    const userId = getCurrentUserId()
    if (userId) {
      const count = await getSyncQueueCount(userId)
      set({ pendingSyncCount: count })
    }
  }
}))
