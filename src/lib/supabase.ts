// Supabase Client Configuration
// This file sets up the Supabase client for authentication and database operations

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export interface SupabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
}

// Database types
export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          local_id: string
          user_id: string
          amount: number
          category: string
          subcategory: string | null
          description: string
          payment_method: string
          date: string
          created_at: string
          updated_at: string
          sync_status: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          local_id: string
          user_id: string
          amount: number
          category: string
          subcategory?: string | null
          description: string
          payment_method: string
          date: string
          created_at?: string
          updated_at?: string
          sync_status?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          local_id?: string
          user_id?: string
          amount?: number
          category?: string
          subcategory?: string | null
          description?: string
          payment_method?: string
          date?: string
          created_at?: string
          updated_at?: string
          sync_status?: string
          synced_at?: string | null
        }
      }
      incomes: {
        Row: {
          id: string
          local_id: string
          user_id: string
          amount: number
          source: string
          description: string
          date: string
          created_at: string
          updated_at: string
          sync_status: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          local_id: string
          user_id: string
          amount: number
          source: string
          description: string
          date: string
          created_at?: string
          updated_at?: string
          sync_status?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          local_id?: string
          user_id?: string
          amount?: number
          source?: string
          description?: string
          date?: string
          created_at?: string
          updated_at?: string
          sync_status?: string
          synced_at?: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          local_id: string
          user_id: string
          category: string
          amount: number
          period: 'daily' | 'weekly' | 'monthly'
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
          sync_status: string
        }
        Insert: {
          id?: string
          local_id: string
          user_id: string
          category: string
          amount: number
          period: 'daily' | 'weekly' | 'monthly'
          start_date: string
          end_date: string
          created_at?: string
          updated_at?: string
          sync_status?: string
        }
        Update: {
          id?: string
          local_id?: string
          user_id?: string
          category?: string
          amount?: number
          period?: 'daily' | 'weekly' | 'monthly'
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
          sync_status?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          name: string
          avatar: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_onboarding: {
        Row: {
          id: string
          user_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Create Supabase client
let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      // Production optimizations
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-client-info': 'geretondjai@1.0.0'
        }
      }
    })
    
    // Log connection in development only
    if (import.meta.env.DEV) {
      console.log('✅ Supabase client initialized')
    }
  }

  return supabaseClient
}

// Get Supabase configuration
export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

// Get current user from Supabase
export async function getCurrentUser() {
  const client = getSupabaseClient()
  if (!client) return null

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return null

  return user
}

// Get user profile
export async function getUserProfile(userId: string) {
  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data
}

// Sign up with email
export async function signUp(email: string, password: string, name: string) {
  const client = getSupabaseClient()
  if (!client) {
    return { user: null, error: 'Supabase not configured' }
  }

  // Validation basique
  if (!email || !email.includes('@')) {
    return { user: null, error: 'Email invalide' }
  }

  if (!password || password.length < 6) {
    return { user: null, error: 'Le mot de passe doit contenir au moins 6 caractères' }
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        // Désactiver l'email de confirmation Supabase (on utilise SMTP pour les emails personnalisés)
        emailRedirectTo: undefined,
        data: {
          name: name.trim()
        }
      }
    })

    if (error) {
      console.error('❌ Supabase signup error:', error)
      
      // Messages d'erreur plus clairs
      let errorMessage = error.message
      
      if (error.status === 422) {
        errorMessage = 'Erreur de validation. Vérifie que l\'inscription email est activée dans Supabase Dashboard → Authentication → Providers'
      } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'Cet email est déjà utilisé'
      } else if (error.message.includes('Email rate limit')) {
        errorMessage = 'Trop de tentatives. Réessaie dans quelques minutes'
      } else if (error.message.includes('signup is disabled')) {
        errorMessage = 'L\'inscription est désactivée. Active-la dans Supabase Dashboard → Authentication → Providers'
      }
      
      return { user: null, error: errorMessage }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('❌ Signup exception:', err)
    return { 
      user: null, 
      error: err instanceof Error ? err.message : 'Erreur lors de l\'inscription' 
    }
  }
}

// Sign in with email
export async function signIn(email: string, password: string) {
  const client = getSupabaseClient()
  if (!client) {
    return { user: null, error: 'Supabase not configured' }
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { user: null, error: error.message }
  }

  return { user: data.user, error: null }
}

// Sign out
export async function signOut() {
  const client = getSupabaseClient()
  if (!client) return

  await client.auth.signOut()
}

// Get current session
export async function getSession() {
  const client = getSupabaseClient()
  if (!client) return null

  const { data: { session }, error } = await client.auth.getSession()
  if (error || !session) return null

  return session
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => {
    subscription.unsubscribe()
  }
}
