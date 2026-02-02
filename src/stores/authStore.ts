import { create } from 'zustand'
import { 
  getSupabaseClient,
  signUp as supabaseSignUp,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  getCurrentUser,
  getUserProfile,
  onAuthStateChange
} from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { emailService } from '../services/emailService'

// User type for the app
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

// Convert Supabase user to app User
async function toUser(supabaseUser: SupabaseUser): Promise<User | null> {
  const profile = await getUserProfile(supabaseUser.id)
  
  if (!profile || typeof profile !== 'object') {
    // Fallback to email if profile doesn't exist yet
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
      avatar: supabaseUser.user_metadata?.avatar,
      createdAt: new Date(supabaseUser.created_at)
    }
  }

  const profileData = profile as { name: string; avatar: string | null; created_at: string }
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profileData.name,
    avatar: profileData.avatar || undefined,
    createdAt: new Date(profileData.created_at)
  }
}

// Auth state
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Setup auth state listener
  const client = getSupabaseClient()
  if (client) {
    onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await toUser(session.user)
        set({ user, isAuthenticated: true, error: null })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, error: null })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const user = await toUser(session.user)
        set({ user, isAuthenticated: true })
      }
    })
  }

  return {
    user: null,
    isLoading: false, // Start as false to show landing page immediately
    isAuthenticated: false,
    error: null,
    
    // Check authentication status on app load
    checkAuth: async () => {
      set({ isLoading: true })
      
      try {
        const supabaseUser = await getCurrentUser()
        
        if (!supabaseUser) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
          return
        }
        
        const user = await toUser(supabaseUser)
        
        if (user) {
          set({ 
            user,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
        } else {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      }
    },
    
    // Login
    login: async (email: string, password: string): Promise<boolean> => {
      set({ isLoading: true, error: null })
      
      try {
        const { user: supabaseUser, error } = await supabaseSignIn(email, password)
        
        if (error || !supabaseUser) {
          set({ 
            isLoading: false, 
            error: error || 'Email ou mot de passe incorrect' 
          })
          return false
        }
        
        const user = await toUser(supabaseUser)
        
        if (!user) {
          set({ 
            isLoading: false, 
            error: 'Erreur lors de la récupération du profil' 
          })
          return false
        }
        
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        set({ 
          isLoading: false, 
          error: 'Une erreur est survenue lors de la connexion' 
        })
        return false
      }
    },
    
    // Register
    register: async (email: string, password: string, name: string): Promise<boolean> => {
      set({ isLoading: true, error: null })
      
      try {
        const { user: supabaseUser, error } = await supabaseSignUp(email, password, name)
        
        if (error) {
          set({ 
            isLoading: false, 
            error: error.includes('already registered') 
              ? 'Cet email est déjà utilisé' 
              : error 
          })
          return false
        }
        
        if (!supabaseUser) {
          // Email confirmation might be required
          set({ 
            isLoading: false, 
            error: 'Veuillez vérifier votre email pour confirmer votre compte' 
          })
          return false
        }
        
        // Auto-login after registration
        const user = await toUser(supabaseUser)
        
        if (!user) {
          set({ 
            isLoading: false, 
            error: 'Erreur lors de la création du profil' 
          })
          return false
        }
        
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })

        // Send welcome email IMMEDIATELY after successful registration
        // This runs asynchronously so it doesn't block the registration process
        if (emailService.isConfigured()) {
          console.log('📧 Sending welcome email to:', email)
          emailService.sendWelcomeEmail(email, name)
            .then(result => {
              if (result.success) {
                console.log('✅ Welcome email sent successfully to:', email)
              } else {
                console.error('❌ Failed to send welcome email:', result.error)
              }
            })
            .catch(error => {
              console.error('❌ Error sending welcome email:', error)
            })
        } else {
          console.warn('⚠️ Email service not configured. Welcome email not sent.')
        }
        
        return true
      } catch (error) {
        console.error('Register error:', error)
        set({ 
          isLoading: false, 
          error: 'Une erreur est survenue lors de l\'inscription' 
        })
        return false
      }
    },
    
    // Logout
    logout: async () => {
      try {
        await supabaseSignOut()
      } catch (error) {
        console.error('Logout error:', error)
      }
      
      set({ 
        user: null,
        isAuthenticated: false,
        error: null 
      })
    },
    
    // Clear error
    clearError: () => {
      set({ error: null })
    },
    
    // Update profile
    updateProfile: async (updates: Partial<Pick<User, 'name' | 'avatar'>>) => {
      const { user } = get()
      if (!user) return
      
      const client = getSupabaseClient()
      if (!client) return
      
      try {
        const updateData: Record<string, unknown> = {}
        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.avatar !== undefined) updateData.avatar = updates.avatar
        updateData.updated_at = new Date().toISOString()
        
        const { error } = await (client
          .from('user_profiles')
          .update(updateData as unknown as never)
          .eq('id', user.id) as unknown as Promise<{ error: any }>)
        
        if (error) {
          console.error('Update profile error:', error)
          return
        }
        
        set({ 
          user: { ...user, ...updates }
        })
      } catch (error) {
        console.error('Update profile error:', error)
      }
    }
  }
})
