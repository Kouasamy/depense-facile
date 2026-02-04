import Dexie, { type EntityTable } from 'dexie'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'

// Types for our data models
export interface Expense {
  id?: number
  userId: string // User ID for multi-user support
  localId: string // UUID for sync
  amount: number
  category: ExpenseCategory
  subcategory?: string
  description: string
  paymentMethod: PaymentMethod
  date: Date
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
  syncedAt?: Date
}

export interface Income {
  id?: number
  userId: string
  localId: string
  amount: number
  source: string
  description: string
  date: Date
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
  syncedAt?: Date
}

export interface Budget {
  id?: number
  userId: string
  localId: string
  category: ExpenseCategory
  amount: number
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
}

export interface UserOnboarding {
  id?: number
  userId: string
  completed: boolean
  completedAt?: Date
}

// User account stored in database
export interface UserAccount {
  id?: number
  odId: string // Unique identifier
  email: string
  passwordHash: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// User session
export interface UserSession {
  id?: number
  odId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface SyncQueue {
  id?: number
  userId: string
  operation: 'create' | 'update' | 'delete'
  table: 'expenses' | 'incomes' | 'budgets'
  localId: string
  data: string // JSON stringified
  createdAt: Date
  attempts: number
  lastAttempt?: Date
}

export type ExpenseCategory = 
  | 'transport'
  | 'nourriture'
  | 'logement'
  | 'sante'
  | 'education'
  | 'communication'
  | 'divertissement'
  | 'vetements'
  | 'famille'
  | 'autre'

export type PaymentMethod = 
  | 'cash'
  | 'orange_money'
  | 'mtn_money'
  | 'moov_money'
  | 'wave'
  | 'carte_bancaire'
  | 'virement'
  | 'autre'

export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'error'

// Category metadata with icons and colors
export const categoryMeta: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  transport: { label: 'Transport', icon: '🚗', color: '#3498db' },
  nourriture: { label: 'Nourriture', icon: '🍽️', color: '#e74c3c' },
  logement: { label: 'Logement', icon: '🏠', color: '#9b59b6' },
  sante: { label: 'Santé', icon: '💊', color: '#1abc9c' },
  education: { label: 'Éducation', icon: '🎓', color: '#f39c12' },
  communication: { label: 'Communication', icon: '📱', color: '#2ecc71' },
  divertissement: { label: 'Divertissement', icon: '🎮', color: '#e91e63' },
  vetements: { label: 'Vêtements', icon: '👕', color: '#00bcd4' },
  famille: { label: 'Famille', icon: '👨‍👩‍👧', color: '#ff9800' },
  autre: { label: 'Autre', icon: '📦', color: '#607d8b' }
}

// Payment method metadata
export const paymentMethodMeta: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  cash: { label: 'Espèces', icon: '💵', color: '#2ecc71' },
  orange_money: { label: 'Orange Money', icon: '🟠', color: '#ff6600' },
  mtn_money: { label: 'MTN Money', icon: '🟡', color: '#ffcc00' },
  moov_money: { label: 'Moov Money', icon: '🔵', color: '#0066cc' },
  wave: { label: 'Wave', icon: '🌊', color: '#1dc8f2' },
  carte_bancaire: { label: 'Carte bancaire', icon: '💳', color: '#9b59b6' },
  virement: { label: 'Virement', icon: '🏦', color: '#3498db' },
  autre: { label: 'Autre', icon: '💰', color: '#607d8b' }
}

// Database class
class DepenseFacileDB extends Dexie {
  expenses!: EntityTable<Expense, 'id'>
  incomes!: EntityTable<Income, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  userOnboarding!: EntityTable<UserOnboarding, 'id'>
  userAccounts!: EntityTable<UserAccount, 'id'>
  userSessions!: EntityTable<UserSession, 'id'>
  syncQueue!: EntityTable<SyncQueue, 'id'>

  constructor() {
    super('DepenseFacileDB')
    
    // Version 3: Added user accounts and sessions tables
    this.version(3).stores({
      expenses: '++id, userId, localId, category, paymentMethod, date, syncStatus, createdAt',
      incomes: '++id, userId, localId, source, date, syncStatus, createdAt',
      budgets: '++id, userId, localId, category, period, syncStatus',
      userOnboarding: '++id, userId',
      userAccounts: '++id, odId, email',
      userSessions: '++id, odId, token',
      syncQueue: '++id, userId, operation, table, localId, createdAt'
    })
  }
}

// Create and export database instance
export const db = new DepenseFacileDB()

// Helper functions
export function generateLocalId(): string {
  return crypto.randomUUID()
}

// ==================== EXPENSE FUNCTIONS ====================

export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'localId' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<number> {
  const now = new Date()
  const newExpense: Omit<Expense, 'id'> = {
    ...expense,
    userId,
    localId: generateLocalId(),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending'
  }
  
  const id = await db.expenses.add(newExpense as Expense)
  
  // Add to sync queue
  await db.syncQueue.add({
    userId,
    operation: 'create',
    table: 'expenses',
    localId: newExpense.localId,
    data: JSON.stringify(newExpense),
    createdAt: now,
    attempts: 0
  })
  
  return id as number
}

export async function getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
  return db.expenses
    .where('userId')
    .equals(userId)
    .filter(exp => exp.date >= startDate && exp.date <= endDate)
    .reverse()
    .sortBy('date')
}

export async function getExpensesByCategory(userId: string, category: ExpenseCategory): Promise<Expense[]> {
  return db.expenses
    .where(['userId', 'category'])
    .equals([userId, category])
    .reverse()
    .sortBy('date')
}

export async function getTodayExpenses(userId: string): Promise<Expense[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return getExpensesByDateRange(userId, today, tomorrow)
}

export async function getThisMonthExpenses(userId: string): Promise<Expense[]> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  
  return getExpensesByDateRange(userId, startOfMonth, endOfMonth)
}

export async function getTotalByCategory(userId: string, startDate: Date, endDate: Date): Promise<Record<ExpenseCategory, number>> {
  const expenses = await getExpensesByDateRange(userId, startDate, endDate)
  
  const totals: Record<ExpenseCategory, number> = {
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
  
  for (const expense of expenses) {
    totals[expense.category] += expense.amount
  }
  
  return totals
}

export async function deleteExpenseById(userId: string, id: number): Promise<void> {
  const expense = await db.expenses.get(id)
  if (expense && expense.userId === userId) {
    await db.expenses.delete(id)
    
    // Add to sync queue for deletion
    await db.syncQueue.add({
      userId,
      operation: 'delete',
      table: 'expenses',
      localId: expense.localId,
      data: JSON.stringify({ id, localId: expense.localId }),
      createdAt: new Date(),
      attempts: 0
    })
  }
}

// ==================== INCOME FUNCTIONS ====================

export async function addIncome(
  userId: string,
  income: Omit<Income, 'id' | 'userId' | 'localId' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<number> {
  const now = new Date()
  const newIncome: Omit<Income, 'id'> = {
    ...income,
    userId,
    localId: generateLocalId(),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending'
  }
  
  const id = await db.incomes.add(newIncome as Income)
  
  await db.syncQueue.add({
    userId,
    operation: 'create',
    table: 'incomes',
    localId: newIncome.localId,
    data: JSON.stringify(newIncome),
    createdAt: now,
    attempts: 0
  })
  
  return id as number
}

export async function getThisMonthIncomes(userId: string): Promise<Income[]> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  
  return db.incomes
    .where('userId')
    .equals(userId)
    .filter(inc => inc.date >= startOfMonth && inc.date <= endOfMonth)
    .toArray()
}

export async function getAllIncomes(userId: string): Promise<Income[]> {
  return db.incomes
    .where('userId')
    .equals(userId)
    .toArray()
}

// ==================== ONBOARDING FUNCTIONS ====================

export async function getUserOnboardingStatus(userId: string): Promise<boolean> {
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data: profile, error } = await client
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', userId)
          .single()
        
        if (!error && profile) {
          const profileData = profile as { onboarding_completed?: boolean }
          if (profileData.onboarding_completed !== undefined) {
            return profileData.onboarding_completed
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding from Supabase:', error)
      }
    }
  }
  
  // Fallback to local database
  const onboarding = await db.userOnboarding
    .where('userId')
    .equals(userId)
    .first()
  
  return onboarding?.completed ?? false
}

export async function setUserOnboardingCompleted(userId: string): Promise<void> {
  // Update Supabase if configured
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()
    if (client) {
      try {
        const updateData = {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        }
        
        await (client
          .from('user_profiles')
          .update(updateData as unknown as never)
          .eq('id', userId) as unknown as Promise<{ error: any }>)
        
        // Also update local onboarding table
        const onboardingData = {
          user_id: userId,
          completed: true,
          completed_at: new Date().toISOString()
        }
        
        await (client
          .from('user_onboarding')
          .upsert(onboardingData as unknown as never) as unknown as Promise<{ error: any }>)
      } catch (error) {
        console.error('Error updating onboarding in Supabase:', error)
      }
    }
  }
  
  // Update local database
  const existing = await db.userOnboarding
    .where('userId')
    .equals(userId)
    .first()
  
  if (existing) {
    await db.userOnboarding.update(existing.id!, {
      completed: true,
      completedAt: new Date()
    })
  } else {
    await db.userOnboarding.add({
      userId,
      completed: true,
      completedAt: new Date()
    })
  }
}

// ==================== BUDGET FUNCTIONS ====================

export async function getBudgets(userId: string): Promise<Budget[]> {
  return db.budgets
    .where('userId')
    .equals(userId)
    .toArray()
}

export async function setBudget(
  userId: string,
  category: ExpenseCategory,
  amount: number
): Promise<void> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  
  // Check if budget exists for this category and user
  const existing = await db.budgets
    .where('userId')
    .equals(userId)
    .filter(b => b.category === category)
    .first()
  
  if (existing) {
    await db.budgets.update(existing.id!, {
      amount,
      updatedAt: now
    })
  } else {
    await db.budgets.add({
      userId,
      localId: generateLocalId(),
      category,
      amount,
      period: 'monthly',
      startDate: startOfMonth,
      endDate: endOfMonth,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    })
  }
}

export async function removeBudget(userId: string, category: ExpenseCategory): Promise<void> {
  const budget = await db.budgets
    .where('userId')
    .equals(userId)
    .filter(b => b.category === category)
    .first()
  
  if (budget) {
    await db.budgets.delete(budget.id!)
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function clearUserData(userId: string): Promise<void> {
  // Clear all user-specific data
  await db.expenses.where('userId').equals(userId).delete()
  await db.incomes.where('userId').equals(userId).delete()
  await db.budgets.where('userId').equals(userId).delete()
  await db.userOnboarding.where('userId').equals(userId).delete()
  await db.syncQueue.where('userId').equals(userId).delete()
}

// Clear ALL local data (all users, all tables)
export async function clearAllLocalData(): Promise<void> {
  console.log('🗑️ Suppression de toutes les données locales...')
  
  // Clear all tables
  await db.expenses.clear()
  await db.incomes.clear()
  await db.budgets.clear()
  await db.userOnboarding.clear()
  await db.userAccounts.clear()
  await db.userSessions.clear()
  await db.syncQueue.clear()
  
  // Clear localStorage
  localStorage.clear()
  
  // Clear sessionStorage
  sessionStorage.clear()
  
  console.log('✅ Toutes les données locales ont été supprimées')
}

export async function getSyncQueueCount(userId: string): Promise<number> {
  return db.syncQueue.where('userId').equals(userId).count()
}

// ==================== AUTH FUNCTIONS ====================

// Simple hash function (for demo purposes - use bcrypt in production)
export function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36) + '_' + password.length
}

// Generate auth token
export function generateToken(): string {
  return crypto.randomUUID() + '_' + Date.now().toString(36)
}

// Register new user
export async function registerUser(email: string, password: string, name: string): Promise<UserAccount | null> {
  const normalizedEmail = email.toLowerCase().trim()
  
  // Check if email already exists
  const existing = await db.userAccounts
    .where('email')
    .equals(normalizedEmail)
    .first()
  
  if (existing) {
    return null // Email already exists
  }
  
  const now = new Date()
  const newUser: Omit<UserAccount, 'id'> = {
    odId: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    name: name.trim(),
    createdAt: now,
    updatedAt: now
  }
  
  await db.userAccounts.add(newUser as UserAccount)
  
  return { ...newUser, id: undefined } as UserAccount
}

// Login user
export async function loginUser(email: string, password: string): Promise<{ user: UserAccount; token: string } | null> {
  const normalizedEmail = email.toLowerCase().trim()
  
  const user = await db.userAccounts
    .where('email')
    .equals(normalizedEmail)
    .first()
  
  if (!user) {
    return null // User not found
  }
  
  if (user.passwordHash !== hashPassword(password)) {
    return null // Wrong password
  }
  
  // Create session
  const token = generateToken()
  const session: Omit<UserSession, 'id'> = {
    odId: user.odId,
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date()
  }
  
  await db.userSessions.add(session as UserSession)
  
  return { user, token }
}

// Get user by token
export async function getUserByToken(token: string): Promise<UserAccount | null> {
  const session = await db.userSessions
    .where('token')
    .equals(token)
    .first()
  
  if (!session) {
    return null
  }
  
  // Check if session expired
  if (new Date() > session.expiresAt) {
    await db.userSessions.delete(session.id!)
    return null
  }
  
  const user = await db.userAccounts
    .where('odId')
    .equals(session.odId)
    .first()
  
  return user || null
}

// Logout user (delete session)
export async function logoutUser(token: string): Promise<void> {
  await db.userSessions.where('token').equals(token).delete()
}

// Update user profile
export async function updateUserProfile(odId: string, updates: Partial<Pick<UserAccount, 'name' | 'avatar'>>): Promise<void> {
  const user = await db.userAccounts
    .where('odId')
    .equals(odId)
    .first()
  
  if (user) {
    await db.userAccounts.update(user.id!, {
      ...updates,
      updatedAt: new Date()
    })
  }
}

// Get user by ID
export async function getUserById(odId: string): Promise<UserAccount | null> {
  const user = await db.userAccounts
    .where('odId')
    .equals(odId)
    .first()
  return user ?? null
}
