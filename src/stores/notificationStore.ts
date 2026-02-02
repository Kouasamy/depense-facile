import { create } from 'zustand'
import { emailService } from '../services/emailService'
import { useAuthStore } from './authStore'

export interface Notification {
  id: string
  type: 'warning' | 'info' | 'success' | 'danger'
  title: string
  message: string
  icon: string
  time: Date
  read: boolean
  category?: 'budget' | 'savings' | 'tip' | 'achievement' | 'system'
  emailSent?: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  lastTipDate: string | null
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read' | 'emailSent'>) => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  getDailyTip: () => Notification
  checkAndAddDailyTip: () => Promise<void>
  initNotifications: () => void
}

// Daily tips that rotate
const dailyTips = [
  {
    title: "Conseil du jour",
    message: "Notez chaque dépense immédiatement pour ne rien oublier. La mémoire nous trahit souvent !",
    icon: "tips_and_updates"
  },
  {
    title: "Astuce épargne",
    message: "Essayez la règle 50/30/20 : 50% pour les besoins, 30% pour les envies, 20% pour l'épargne.",
    icon: "lightbulb"
  },
  {
    title: "Conseil du jour",
    message: "Avant d'acheter quelque chose, attendez 24h. Si vous en avez encore besoin, achetez-le.",
    icon: "tips_and_updates"
  },
  {
    title: "Astuce budget",
    message: "Fixez un budget hebdomadaire pour mieux contrôler vos dépenses au quotidien.",
    icon: "account_balance_wallet"
  },
  {
    title: "Conseil du jour",
    message: "Préparez vos repas à la maison. Vous économiserez jusqu'à 60% par rapport au restaurant.",
    icon: "restaurant"
  },
  {
    title: "Astuce transport",
    message: "Comparez les options : Gbaka, Woro-woro, taxi... Trouvez le meilleur rapport qualité-prix.",
    icon: "directions_bus"
  },
  {
    title: "Conseil du jour",
    message: "Utilisez Orange Money ou Wave pour suivre automatiquement vos dépenses électroniques.",
    icon: "phone_android"
  },
  {
    title: "Astuce épargne",
    message: "Mettez de côté au moins 10% de chaque revenu dès que vous le recevez.",
    icon: "savings"
  },
  {
    title: "Conseil du jour",
    message: "Faites une liste avant d'aller au marché. Vous éviterez les achats impulsifs.",
    icon: "checklist"
  },
  {
    title: "Astuce budget",
    message: "Divisez votre argent en enveloppes : transport, nourriture, loisirs... Ne dépassez pas !",
    icon: "folder"
  },
  {
    title: "Conseil du jour",
    message: "Comparez les prix avant d'acheter. Un même produit peut varier de 30% entre vendeurs.",
    icon: "compare"
  },
  {
    title: "Astuce santé financière",
    message: "Constituez un fonds d'urgence de 3 mois de dépenses. C'est votre coussin de sécurité.",
    icon: "shield"
  },
  {
    title: "Conseil du jour",
    message: "Négociez ! En Côte d'Ivoire, presque tout se négocie. N'ayez pas peur de demander.",
    icon: "handshake"
  },
  {
    title: "Astuce quotidienne",
    message: "Évitez les crédits à taux élevé. Ils peuvent doubler le prix de ce que vous achetez.",
    icon: "warning"
  },
  {
    title: "Conseil du jour",
    message: "Groupez vos achats au marché pour obtenir de meilleurs prix en gros.",
    icon: "shopping_basket"
  },
]

const STORAGE_KEY = 'geretondjai_notifications'
const TIP_DATE_KEY = 'geretondjai_last_tip_date'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  lastTipDate: null,

  addNotification: async (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      time: new Date(),
      read: false,
      emailSent: false
    }
    
    set(state => {
      const updated = [newNotification, ...state.notifications].slice(0, 50) // Keep max 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return {
        notifications: updated,
        unreadCount: state.unreadCount + 1
      }
    })

    // Send email notification if enabled
    try {
      const { user } = useAuthStore.getState()
      if (user?.email && emailService.isConfigured()) {
        // Check if email notifications are enabled
        const shouldSend = shouldSendEmailNotification(notification.category)
        
        if (shouldSend) {
          const result = await emailService.sendNotificationEmail(user.email, {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category
          })

          if (result.success) {
            // Update notification to mark email as sent
            set(state => ({
              notifications: state.notifications.map(n =>
                n.id === newNotification.id ? { ...n, emailSent: true } : n
              )
            }))
          }
        }
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
      // Don't block notification creation if email fails
    }
  },

  markAsRead: (id) => {
    set(state => {
      const updated = state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length
      }
    })
  },

  markAllAsRead: () => {
    set(state => {
      const updated = state.notifications.map(n => ({ ...n, read: true }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return {
        notifications: updated,
        unreadCount: 0
      }
    })
  },

  removeNotification: (id) => {
    set(state => {
      const updated = state.notifications.filter(n => n.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length
      }
    })
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ notifications: [], unreadCount: 0 })
  },

  getDailyTip: () => {
    // Use day of year to select tip (so it changes daily)
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    const tipIndex = dayOfYear % dailyTips.length
    const tip = dailyTips[tipIndex]
    
    return {
      id: `tip-${getTodayString()}`,
      type: 'info' as const,
      title: tip.title,
      message: tip.message,
      icon: tip.icon,
      time: new Date(),
      read: false,
      category: 'tip' as const
    }
  },

  checkAndAddDailyTip: async () => {
    const today = getTodayString()
    const lastTipDate = localStorage.getItem(TIP_DATE_KEY)
    
    if (lastTipDate !== today) {
      const tip = get().getDailyTip()
      await get().addNotification({
        type: tip.type,
        title: tip.title,
        message: tip.message,
        icon: tip.icon,
        category: 'tip'
      })
      localStorage.setItem(TIP_DATE_KEY, today)
      set({ lastTipDate: today })

      // Send daily tip email
      try {
        const { user } = useAuthStore.getState()
        if (user?.email && emailService.isConfigured()) {
          await emailService.sendDailyTipEmail(user.email, {
            title: tip.title,
            message: tip.message
          })
        }
      } catch (error) {
        console.error('Error sending daily tip email:', error)
      }
    }
  },

  initNotifications: () => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const notifications = parsed.map((n: any) => ({
          ...n,
          time: new Date(n.time)
        }))
        set({
          notifications,
          unreadCount: notifications.filter((n: Notification) => !n.read).length
        })
      }
    } catch (e) {
      console.error('Error loading notifications:', e)
    }
    
    // Check for daily tip
    get().checkAndAddDailyTip()
  }
}))

// Helper function to check if email should be sent
export function shouldSendEmailNotification(category?: string): boolean {
  // For now, send emails for important notifications
  // You can enhance this by checking user preferences from database
  const importantCategories = ['budget', 'savings', 'tip']
  return !category || importantCategories.includes(category)
}

// Helper to check budget alerts
export async function checkBudgetAlerts(
  budgets: Record<string, number>,
  categoryTotals: Record<string, number>,
  categoryLabels: Record<string, string>
) {
  const notifications: Omit<Notification, 'id' | 'time' | 'read' | 'emailSent'>[] = []
  
  Object.entries(budgets).forEach(([category, budgetAmount]) => {
    const spent = categoryTotals[category] || 0
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
    const label = categoryLabels[category] || category

    if (percentage >= 100) {
      notifications.push({
        type: 'danger',
        title: 'Budget dépassé !',
        message: `Vous avez dépassé votre budget ${label}. Attention à vos dépenses !`,
        icon: 'warning',
        category: 'budget'
      })

      // Send email alert
      const { user } = useAuthStore.getState()
      if (user?.email && emailService.isConfigured()) {
        emailService.sendBudgetAlertEmail(user.email, label, spent, budgetAmount, percentage)
          .catch(error => console.error('Error sending budget alert email:', error))
      }
    } else if (percentage >= 90) {
      notifications.push({
        type: 'warning',
        title: 'Budget presque épuisé',
        message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget ${label}.`,
        icon: 'trending_up',
        category: 'budget'
      })

      // Send email alert
      const { user } = useAuthStore.getState()
      if (user?.email && emailService.isConfigured()) {
        emailService.sendBudgetAlertEmail(user.email, label, spent, budgetAmount, percentage)
          .catch(error => console.error('Error sending budget alert email:', error))
      }
    }
  })
  
  return notifications
}

// Helper to check savings alerts
export function checkSavingsAlerts(totalIncomes: number, totalExpenses: number) {
  const notifications: Omit<Notification, 'id' | 'time' | 'read'>[] = []
  
  if (totalIncomes <= 0) return notifications
  
  const savingsRate = ((totalIncomes - totalExpenses) / totalIncomes) * 100
  const balance = totalIncomes - totalExpenses
  
  if (balance < 0) {
    notifications.push({
      type: 'danger',
      title: 'Situation critique !',
      message: 'Vous dépensez plus que vos revenus. Il faut réagir maintenant !',
      icon: 'crisis_alert',
      category: 'savings'
    })
  } else if (savingsRate < 5) {
    notifications.push({
      type: 'warning',
      title: 'Attention aux finances',
      message: 'Votre taux d\'épargne est très faible. Essayez de réduire vos dépenses.',
      icon: 'trending_down',
      category: 'savings'
    })
  } else if (savingsRate >= 20) {
    notifications.push({
      type: 'success',
      title: 'Excellent !',
      message: `Vous épargnez ${savingsRate.toFixed(0)}% de vos revenus. Continuez ainsi !`,
      icon: 'thumb_up',
      category: 'achievement'
    })
  }
  
  return notifications
}

