import { db, type SyncQueue } from './schema'
import { 
  isSupabaseConfigured as checkSupabaseConfig, 
  supabaseFetch, 
  getAuthHeader, 
  getCurrentUser 
} from '../lib/supabase'

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

// Re-export the check function
export const isSupabaseConfigured = checkSupabaseConfig

// Process sync queue
export async function processSyncQueue(): Promise<SyncResult> {
  if (!checkSupabaseConfig()) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Supabase non configuré']
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
        await syncItem(item)
        await db.syncQueue.delete(item.id!)
        result.synced++
      } catch (error) {
        result.failed++
        result.errors.push(`Erreur sync ${item.table}: ${error}`)
        
        // Update attempt count
        await db.syncQueue.update(item.id!, {
          attempts: item.attempts + 1,
          lastAttempt: new Date()
        })
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Erreur générale: ${error}`)
  }

  return result
}

// Sync individual item
async function syncItem(item: SyncQueue): Promise<void> {
  const data = JSON.parse(item.data)
  
  // Add user_id if authenticated
  const user = getCurrentUser()
  if (user) {
    data.user_id = user.id
  }
  
  switch (item.operation) {
    case 'create':
      await syncCreate(item.table, data)
      break
    case 'update':
      await syncUpdate(item.table, data)
      break
    case 'delete':
      await syncDelete(item.table, data.localId)
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
    converted[newKey] = value
  }
  
  return converted
}

async function syncCreate(table: string, data: Record<string, unknown>): Promise<void> {
  if (!checkSupabaseConfig()) return
  
  const supabaseData = toSupabaseFormat(data)
  
  const { error } = await supabaseFetch(table, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(supabaseData)
  })

  if (error) {
    throw new Error(`Sync create failed: ${error}`)
  }

  // Update local record sync status
  await updateLocalSyncStatus(table, data.localId as string, 'synced')
}

async function syncUpdate(table: string, data: Record<string, unknown>): Promise<void> {
  if (!checkSupabaseConfig()) return
  
  const supabaseData = toSupabaseFormat(data)
  
  const { error } = await supabaseFetch(`${table}?local_id=eq.${data.localId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(supabaseData)
  })

  if (error) {
    throw new Error(`Sync update failed: ${error}`)
  }

  await updateLocalSyncStatus(table, data.localId as string, 'synced')
}

async function syncDelete(table: string, localId: string): Promise<void> {
  if (!checkSupabaseConfig()) return
  
  const { error } = await supabaseFetch(`${table}?local_id=eq.${localId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  })

  if (error) {
    throw new Error(`Sync delete failed: ${error}`)
  }
}

async function updateLocalSyncStatus(table: string, localId: string, status: 'synced' | 'error'): Promise<void> {
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

// Note: getSyncQueueCount is now in schema.ts with userId support

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
export async function pullFromServer(table: string, since?: Date): Promise<Record<string, unknown>[]> {
  if (!checkSupabaseConfig()) return []
  
  let endpoint = `${table}?select=*`
  
  if (since) {
    endpoint += `&updated_at=gte.${since.toISOString()}`
  }
  
  const { data, error } = await supabaseFetch<Record<string, unknown>[]>(endpoint, {
    headers: getAuthHeader()
  })
  
  if (error || !data) {
    console.error('Pull from server failed:', error)
    return []
  }
  
  return data
}

// Resolve sync conflicts (server wins by default, but we could implement custom logic)
export async function resolveConflict(
  table: string, 
  localId: string, 
  strategy: 'server-wins' | 'client-wins' | 'merge' = 'server-wins'
): Promise<void> {
  if (strategy === 'server-wins') {
    // Fetch server version and update local
    const { data } = await supabaseFetch<Record<string, unknown>[]>(
      `${table}?local_id=eq.${localId}&select=*`, 
      { headers: getAuthHeader() }
    )
    
    if (data && data.length > 0) {
      const serverRecord = data[0]
      // Update local record with server data
      // (Implementation depends on specific table)
      console.log('Resolved conflict with server data:', serverRecord)
    }
  } else if (strategy === 'client-wins') {
    // Force push local version to server
    // The next sync will overwrite server data
    console.log('Client wins strategy selected')
  }
  // 'merge' strategy would need custom logic per field
}
