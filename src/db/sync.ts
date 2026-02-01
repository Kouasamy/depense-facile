import { db, type SyncQueue, type Expense, type Income, type Budget } from './schema'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/supabase'

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

// Process sync queue
export async function processSyncQueue(): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Supabase non configuré']
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Client Supabase non disponible']
    }
  }

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: []
  }

  try {
    const pendingItems = await db.syncQueue
      .where('attempts')
      .below(5) // Max 5 attempts
      .toArray()

    for (const item of pendingItems) {
      try {
        await syncItem(item, client)
        await db.syncQueue.delete(item.id!)
        result.synced++
      } catch (error) {
        result.failed++
        const errorMsg = error instanceof Error ? error.message : String(error)
        result.errors.push(`Erreur sync ${item.table}: ${errorMsg}`)
        
        // Update attempt count
        await db.syncQueue.update(item.id!, {
          attempts: item.attempts + 1,
          lastAttempt: new Date()
        })
      }
    }
  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : String(error)
    result.errors.push(`Erreur générale: ${errorMsg}`)
  }

  return result
}

// Sync individual item
async function syncItem(
  item: SyncQueue, 
  client: ReturnType<typeof getSupabaseClient>
): Promise<void> {
  if (!client) throw new Error('Client Supabase non disponible')
  
  const data = JSON.parse(item.data)
  
  // Get current user
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    throw new Error('Utilisateur non authentifié')
  }
  
  // Ensure user_id is set
  data.user_id = user.id
  
  switch (item.operation) {
    case 'create':
      await syncCreate(item.table, data, client)
      break
    case 'update':
      await syncUpdate(item.table, data, client)
      break
    case 'delete':
      await syncDelete(item.table, data.localId, client)
      break
  }
}

// Convert local data format to Supabase format (snake_case)
function toSupabaseFormat(data: Record<string, unknown>): Record<string, unknown> {
  const converted: Record<string, unknown> = {}
  
  const keyMap: Record<string, string> = {
    localId: 'local_id',
    userId: 'user_id',
    paymentMethod: 'payment_method',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    syncStatus: 'sync_status',
    syncedAt: 'synced_at',
    startDate: 'start_date',
    endDate: 'end_date'
  }
  
  for (const [key, value] of Object.entries(data)) {
    // Skip local-only fields
    if (key === 'id') continue
    
    const newKey = keyMap[key] || key
    
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      converted[newKey] = value.toISOString()
    } else {
      converted[newKey] = value
    }
  }
  
  return converted
}

async function syncCreate(
  table: string, 
  data: Record<string, unknown>,
  client: ReturnType<typeof getSupabaseClient>
): Promise<void> {
  if (!client) throw new Error('Client Supabase non disponible')
  
  const supabaseData = toSupabaseFormat(data)
  
  let error
  
  switch (table) {
    case 'expenses':
      const { error: expenseError } = await client
        .from('expenses')
        .insert(supabaseData as Database['public']['Tables']['expenses']['Insert'])
      error = expenseError
      break
      
    case 'incomes':
      const { error: incomeError } = await client
        .from('incomes')
        .insert(supabaseData as Database['public']['Tables']['incomes']['Insert'])
      error = incomeError
      break
      
    case 'budgets':
      const { error: budgetError } = await client
        .from('budgets')
        .insert(supabaseData as Database['public']['Tables']['budgets']['Insert'])
      error = budgetError
      break
      
    default:
      throw new Error(`Table inconnue: ${table}`)
  }

  if (error) {
    throw new Error(`Sync create failed: ${error.message}`)
  }

  // Update local record sync status
  await updateLocalSyncStatus(table, data.localId as string, 'synced')
}

async function syncUpdate(
  table: string, 
  data: Record<string, unknown>,
  client: ReturnType<typeof getSupabaseClient>
): Promise<void> {
  if (!client) throw new Error('Client Supabase non disponible')
  
  const supabaseData = toSupabaseFormat(data)
  const localId = data.localId as string
  
  let error
  
  switch (table) {
    case 'expenses':
      const { error: expenseError } = await client
        .from('expenses')
        .update(supabaseData as Database['public']['Tables']['expenses']['Update'])
        .eq('local_id', localId)
      error = expenseError
      break
      
    case 'incomes':
      const { error: incomeError } = await client
        .from('incomes')
        .update(supabaseData as Database['public']['Tables']['incomes']['Update'])
        .eq('local_id', localId)
      error = incomeError
      break
      
    case 'budgets':
      const { error: budgetError } = await client
        .from('budgets')
        .update(supabaseData as Database['public']['Tables']['budgets']['Update'])
        .eq('local_id', localId)
      error = budgetError
      break
      
    default:
      throw new Error(`Table inconnue: ${table}`)
  }

  if (error) {
    throw new Error(`Sync update failed: ${error.message}`)
  }

  await updateLocalSyncStatus(table, localId, 'synced')
}

async function syncDelete(
  table: string, 
  localId: string,
  client: ReturnType<typeof getSupabaseClient>
): Promise<void> {
  if (!client) throw new Error('Client Supabase non disponible')
  
  let error
  
  switch (table) {
    case 'expenses':
      const { error: expenseError } = await client
        .from('expenses')
        .delete()
        .eq('local_id', localId)
      error = expenseError
      break
      
    case 'incomes':
      const { error: incomeError } = await client
        .from('incomes')
        .delete()
        .eq('local_id', localId)
      error = incomeError
      break
      
    case 'budgets':
      const { error: budgetError } = await client
        .from('budgets')
        .delete()
        .eq('local_id', localId)
      error = budgetError
      break
      
    default:
      throw new Error(`Table inconnue: ${table}`)
  }

  if (error) {
    throw new Error(`Sync delete failed: ${error.message}`)
  }
}

async function updateLocalSyncStatus(
  table: string, 
  localId: string, 
  status: 'synced' | 'error'
): Promise<void> {
  const tableMap: Record<string, typeof db.expenses | typeof db.incomes | typeof db.budgets> = {
    expenses: db.expenses,
    incomes: db.incomes,
    budgets: db.budgets
  }

  const dbTable = tableMap[table]
  if (!dbTable) return

  const record = await dbTable.where('localId').equals(localId).first()
  if (record && record.id) {
    await dbTable.update(record.id, { 
      syncStatus: status,
      syncedAt: status === 'synced' ? new Date() : undefined
    })
  }
}

// Clear old failed sync items (older than 7 days with 5+ attempts)
export async function clearOldSyncItems(): Promise<number> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const oldItems = await db.syncQueue
    .where('attempts')
    .aboveOrEqual(5)
    .filter(item => item.createdAt < sevenDaysAgo)
    .toArray()

  for (const item of oldItems) {
    await db.syncQueue.delete(item.id!)
  }

  return oldItems.length
}

// Setup automatic sync on connection restore
export function setupAutoSync(onSyncComplete?: (result: SyncResult) => void): () => void {
  const handleOnline = async () => {
    console.log('Connection restored, starting sync...')
    const result = await processSyncQueue()
    onSyncComplete?.(result)
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}

// Pull changes from server (for conflict resolution)
export async function pullFromServer(
  table: 'expenses' | 'incomes' | 'budgets', 
  since?: Date
): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured()) return []
  
  const client = getSupabaseClient()
  if (!client) return []
  
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  
  let query = client
    .from(table)
    .select('*')
    .eq('user_id', user.id)
  
  if (since) {
    query = query.gte('updated_at', since.toISOString()) as typeof query
  }
  
  const { data, error } = await query.order('updated_at', { ascending: false })
  
  if (error || !data) {
    console.error('Pull from server failed:', error)
    return []
  }
  
  return data as Record<string, unknown>[]
}

// Sync data from server to local (for initial load or conflict resolution)
export async function syncFromServer(): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Supabase non configuré']
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Client Supabase non disponible']
    }
  }

  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Utilisateur non authentifié']
    }
  }

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: []
  }

  try {
    // Pull expenses, incomes, and budgets from server
    const [expenses, incomes, budgets] = await Promise.all([
      pullFromServer('expenses'),
      pullFromServer('incomes'),
      pullFromServer('budgets')
    ])

    // Convert and store in local database
    // This is a simplified version - you might want to handle conflicts more carefully
    for (const expense of expenses) {
      try {
        const localExpense = await db.expenses
          .where('localId')
          .equals(expense.local_id as string)
          .first()

        if (!localExpense) {
          // New expense from server
          await db.expenses.add({
            userId: user.id,
            localId: expense.local_id as string,
            amount: expense.amount as number,
            category: expense.category as string,
            subcategory: expense.subcategory as string | undefined,
            description: expense.description as string,
            paymentMethod: expense.payment_method as string,
            date: new Date(expense.date as string),
            createdAt: new Date(expense.created_at as string),
            updatedAt: new Date(expense.updated_at as string),
            syncStatus: 'synced',
            syncedAt: new Date()
          } as Expense)
          result.synced++
        }
      } catch (error) {
        result.failed++
        result.errors.push(`Erreur sync expense ${expense.local_id}: ${error}`)
      }
    }

    // Similar for incomes and budgets...
    // (Implementation similar to expenses)

  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : String(error)
    result.errors.push(`Erreur générale: ${errorMsg}`)
  }

  return result
}
