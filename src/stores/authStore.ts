import { create } from 'zustand'
import { 
  registerUser, 
  loginUser, 
  getUserByToken, 
  logoutUser,
  updateUserProfile,
  type UserAccount 
} from '../db/schema'

// User type for the app
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

// Convert UserAccount to User
function toUser(account: UserAccount): User {
  return {
    id: account.odId,
    email: account.email,
    name: account.name,
    avatar: account.avatar,
    createdAt: account.createdAt
  }
}

// Auth state
interface AuthState {
  user: User | null
  token: string | null
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

// Session storage key (only for current session token, not user data)
const SESSION_TOKEN_KEY = 'depense_facile_session_token'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  // Check authentication status on app load
  checkAuth: async () => {
    try {
      const token = localStorage.getItem(SESSION_TOKEN_KEY)
      
      if (!token) {
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false, 
          isLoading: false 
        })
        return
      }
      
      // Verify token and get user from database
      const userAccount = await getUserByToken(token)
      
      if (userAccount) {
        set({ 
          user: toUser(userAccount),
          token,
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
      } else {
        // Invalid or expired token
        localStorage.removeItem(SESSION_TOKEN_KEY)
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false, 
          isLoading: false 
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem(SESSION_TOKEN_KEY)
      set({ 
        user: null, 
        token: null,
        isAuthenticated: false, 
        isLoading: false 
      })
    }
  },
  
  // Login
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await loginUser(email, password)
      
      if (!result) {
        set({ 
          isLoading: false, 
          error: 'Email ou mot de passe incorrect' 
        })
        return false
      }
      
      // Store token in localStorage (only token, not user data)
      localStorage.setItem(SESSION_TOKEN_KEY, result.token)
      
      set({ 
        user: toUser(result.user),
        token: result.token,
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
      // Register user in database
      const newUser = await registerUser(email, password, name)
      
      if (!newUser) {
        set({ 
          isLoading: false, 
          error: 'Cet email est déjà utilisé' 
        })
        return false
      }
      
      // Auto-login after registration
      const result = await loginUser(email, password)
      
      if (!result) {
        set({ 
          isLoading: false, 
          error: 'Erreur lors de la connexion automatique' 
        })
        return false
      }
      
      localStorage.setItem(SESSION_TOKEN_KEY, result.token)
      
      set({ 
        user: toUser(result.user),
        token: result.token,
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      })
      
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
    const { token } = get()
    
    try {
      if (token) {
        await logoutUser(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem(SESSION_TOKEN_KEY)
    
    set({ 
      user: null,
      token: null,
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
    
    try {
      await updateUserProfile(user.id, updates)
      
      set({ 
        user: { ...user, ...updates }
      })
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }
}))
