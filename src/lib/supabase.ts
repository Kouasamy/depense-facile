// Supabase Client Configuration
// This file sets up the Supabase client for authentication and database operations

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export interface SupabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
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

// Simple fetch wrapper for Supabase REST API
// We use this instead of the full Supabase client to keep the bundle small
export async function supabaseFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { data: null, error: errorText || response.statusText }
    }

    // Check if response has content
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return { data, error: null }
    }

    return { data: null, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network error' 
    }
  }
}

// Supabase Auth helpers (minimal implementation)
export interface AuthUser {
  id: string
  email: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  user: AuthUser
}

let currentSession: AuthSession | null = null

// Store session in localStorage
function saveSession(session: AuthSession | null): void {
  if (session) {
    localStorage.setItem('supabase_session', JSON.stringify(session))
  } else {
    localStorage.removeItem('supabase_session')
  }
  currentSession = session
}

// Load session from localStorage
export function loadSession(): AuthSession | null {
  if (currentSession) return currentSession
  
  const stored = localStorage.getItem('supabase_session')
  if (stored) {
    try {
      currentSession = JSON.parse(stored)
      return currentSession
    } catch {
      localStorage.removeItem('supabase_session')
    }
  }
  return null
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  const session = loadSession()
  return session?.user || null
}

// Sign up with email
export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase not configured' }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      return { user: null, error: data.msg || data.error_description || 'Sign up failed' }
    }

    if (data.access_token) {
      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: { id: data.user.id, email: data.user.email }
      }
      saveSession(session)
      return { user: session.user, error: null }
    }

    return { user: null, error: null } // Email confirmation required
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// Sign in with email
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase not configured' }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      return { user: null, error: data.msg || data.error_description || 'Sign in failed' }
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: { id: data.user.id, email: data.user.email }
    }
    saveSession(session)
    return { user: session.user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// Sign out
export function signOut(): void {
  saveSession(null)
}

// Get auth header for API requests
export function getAuthHeader(): Record<string, string> {
  const session = loadSession()
  if (session?.access_token) {
    return { 'Authorization': `Bearer ${session.access_token}` }
  }
  return { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
}

