import { create } from 'zustand'
import { 
  getBudgets, 
  setBudget as dbSetBudget, 
  removeBudget as dbRemoveBudget,
  getThisMonthExpenses,
  type ExpenseCategory,
  type Expense 
} from '../db/schema'
import { useAuthStore } from './authStore'

export interface BudgetAlert {
  category: ExpenseCategory
  budget: number
  spent: number
  percentage: number
  status: 'ok' | 'warning' | 'over'
}

interface BudgetState {
  budgets: Record<ExpenseCategory, number>
  alerts: BudgetAlert[]
  isLoading: boolean
  
  // Actions
  loadBudgets: () => Promise<void>
  setBudget: (category: ExpenseCategory, amount: number) => Promise<void>
  removeBudget: (category: ExpenseCategory) => Promise<void>
  calculateAlerts: (expenses: Expense[]) => void
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  const authState = useAuthStore.getState()
  return authState.user?.id ?? null
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: {} as Record<ExpenseCategory, number>,
  alerts: [],
  isLoading: false,

  loadBudgets: async () => {
    const userId = getCurrentUserId()
    if (!userId) return

    set({ isLoading: true })
    
    try {
      const budgetRecords = await getBudgets(userId)
      const budgets: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>
      
      for (const budget of budgetRecords) {
        budgets[budget.category] = budget.amount
      }
      
      set({ budgets, isLoading: false })
      
      // Recalculate alerts with current expenses
      const expenses = await getThisMonthExpenses(userId)
      get().calculateAlerts(expenses)
    } catch (error) {
      console.error('Error loading budgets:', error)
      set({ isLoading: false })
    }
  },

  setBudget: async (category, amount) => {
    const userId = getCurrentUserId()
    if (!userId) return

    try {
      await dbSetBudget(userId, category, amount)
      
      const budgets = { ...get().budgets, [category]: amount }
      set({ budgets })
      
      // Recalculate alerts
      const expenses = await getThisMonthExpenses(userId)
      get().calculateAlerts(expenses)
    } catch (error) {
      console.error('Error setting budget:', error)
    }
  },

  removeBudget: async (category) => {
    const userId = getCurrentUserId()
    if (!userId) return

    try {
      await dbRemoveBudget(userId, category)
      
      const budgets = { ...get().budgets }
      delete budgets[category]
      set({ budgets })
      
      // Recalculate alerts
      const expenses = await getThisMonthExpenses(userId)
      get().calculateAlerts(expenses)
    } catch (error) {
      console.error('Error removing budget:', error)
    }
  },

  calculateAlerts: (expenses: Expense[]) => {
    const { budgets } = get()
    
    // Calculate spending by category
    const categorySpending: Record<ExpenseCategory, number> = {
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
    }

    for (const exp of expenses) {
      categorySpending[exp.category] += exp.amount
    }

    // Calculate alerts for categories with budgets
    const alerts: BudgetAlert[] = []
    
    for (const [category, budget] of Object.entries(budgets)) {
      if (budget && budget > 0) {
        const spent = categorySpending[category as ExpenseCategory] || 0
        const percentage = Math.round((spent / budget) * 100)
        
        let status: 'ok' | 'warning' | 'over' = 'ok'
        if (spent > budget) {
          status = 'over'
        } else if (percentage >= 80) {
          status = 'warning'
        }

        // Only add to alerts if warning or over
        if (status !== 'ok') {
          alerts.push({
            category: category as ExpenseCategory,
            budget,
            spent,
            percentage,
            status
          })
        }
      }
    }

    // Sort: over budget first, then by percentage
    alerts.sort((a, b) => {
      if (a.status === 'over' && b.status !== 'over') return -1
      if (a.status !== 'over' && b.status === 'over') return 1
      return b.percentage - a.percentage
    })

    set({ alerts })
  }
}))
