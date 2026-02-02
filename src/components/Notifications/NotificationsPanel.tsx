import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore, checkBudgetAlerts, checkSavingsAlerts, type Notification } from '../../stores/notificationStore'
import { useExpenseStore } from '../../stores/expenseStore'
import { useBudgetStore } from '../../stores/budgetStore'
import { categoryMeta } from '../../db/schema'
import { AnimatedIcon } from '../common'
import './NotificationsPanel.css'

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    initNotifications,
    addNotification 
  } = useNotificationStore()
  const { totalExpenses, totalIncomes, categoryTotals } = useExpenseStore()
  const { budgets } = useBudgetStore()

  // Initialize notifications on mount
  useEffect(() => {
    initNotifications()
  }, [initNotifications])

  // Check for budget and savings alerts when data changes
  useEffect(() => {
    if (!isOpen) return
    
    // Create category labels map
    const categoryLabels: Record<string, string> = {}
    Object.entries(categoryMeta).forEach(([key, meta]) => {
      categoryLabels[key] = meta.label
    })
    
    // Check budget alerts
    checkBudgetAlerts(budgets, categoryTotals, categoryLabels).then(budgetAlerts => {
      budgetAlerts.forEach(alert => {
        // Check if similar notification already exists (by title and category)
        const exists = notifications.some(
          n => n.title === alert.title && n.category === alert.category
        )
        if (!exists) {
          addNotification(alert)
        }
      })
    })
    
    // Check savings alerts
    const savingsAlerts = checkSavingsAlerts(totalIncomes, totalExpenses)
    savingsAlerts.forEach(alert => {
      const exists = notifications.some(
        n => n.title === alert.title && n.category === alert.category
      )
      if (!exists) {
        addNotification(alert)
      }
    })
  }, [isOpen, budgets, categoryTotals, totalIncomes, totalExpenses])

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setSelectedNotification(notification)
  }

  const handleGoToPage = (notification: Notification) => {
    setSelectedNotification(null)
    onClose()
    
    // Navigate based on notification category
    switch (notification.category) {
      case 'budget':
        navigate('/budgets')
        break
      case 'savings':
        navigate('/advisor')
        break
      case 'tip':
        navigate('/advisor')
        break
      case 'achievement':
        navigate('/dashboard')
        break
      default:
        break
    }
  }

  const closeNotificationModal = () => {
    setSelectedNotification(null)
  }

  const getIconColor = (type: typeof notifications[0]['type']) => {
    switch (type) {
      case 'success': return 'var(--color-success)'
      case 'warning': return 'var(--color-warning)'
      case 'danger': return 'var(--color-danger)'
      default: return 'var(--color-primary)'
    }
  }

  const getBgColor = (type: typeof notifications[0]['type']) => {
    switch (type) {
      case 'success': return 'var(--color-success-bg)'
      case 'warning': return 'var(--color-warning-bg)'
      case 'danger': return 'var(--color-danger-bg)'
      default: return 'var(--color-primary-alpha-10)'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (!isOpen) return null

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-left">
            <h2 className="notifications-title">Notifications</h2>
            {unreadCount > 0 && (
              <span className="notifications-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notifications-header-right">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="notifications-mark-read">
                Tout marquer lu
              </button>
            )}
            <button onClick={onClose} className="notifications-close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div 
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div 
                  className="notification-icon"
                  style={{ 
                    backgroundColor: getBgColor(notification.type),
                    color: getIconColor(notification.type)
                  }}
                >
                  <span className="material-symbols-outlined">{notification.icon}</span>
                </div>
                <div className="notification-content">
                  <div className="notification-header-row">
                    <p className="notification-title">{notification.title}</p>
                    <span className="notification-time">{formatTime(notification.time)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.category && (
                    <span className="notification-category">
                      {notification.category === 'budget' && 'Budget'}
                      {notification.category === 'savings' && 'Épargne'}
                      {notification.category === 'tip' && 'Conseil'}
                      {notification.category === 'achievement' && 'Succès'}
                      {notification.category === 'system' && 'Système'}
                    </span>
                  )}
                </div>
                {!notification.read && (
                  <span className="notification-dot"></span>
                )}
                <button 
                  className="notification-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(notification.id)
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <span className="material-symbols-outlined">notifications_off</span>
              </div>
              <h3>Aucune notification</h3>
              <p>Vous n'avez pas de nouvelles notifications pour le moment.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notifications-footer">
          <p>GèreTonDjai - Gère ton djai comme un boss ! 🇨🇮</p>
          <p className="notifications-footer-credit">by Sam_k</p>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={closeNotificationModal}>
          <div className="notification-modal animate-scale-in" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="notification-modal-header">
              <div 
                className="notification-modal-icon"
                style={{ 
                  backgroundColor: getBgColor(selectedNotification.type),
                  color: getIconColor(selectedNotification.type)
                }}
              >
                <span className="material-symbols-outlined">{selectedNotification.icon}</span>
              </div>
              <button className="notification-modal-close" onClick={closeNotificationModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="notification-modal-content">
              <div className="notification-modal-meta">
                {selectedNotification.category && (
                  <span className="notification-modal-category">
                    {selectedNotification.category === 'budget' && (
                      <>
                        <AnimatedIcon emoji="💰" size={20} animation="pulse" /> Budget
                      </>
                    )}
                    {selectedNotification.category === 'savings' && (
                      <>
                        <AnimatedIcon emoji="🏦" size={20} animation="pulse" /> Épargne
                      </>
                    )}
                    {selectedNotification.category === 'tip' && (
                      <>
                        <AnimatedIcon emoji="💡" size={20} animation="pulse" /> Conseil
                      </>
                    )}
                    {selectedNotification.category === 'achievement' && (
                      <>
                        <AnimatedIcon emoji="🏆" size={20} animation="pulse" /> Succès
                      </>
                    )}
                    {selectedNotification.category === 'system' && (
                      <>
                        <AnimatedIcon emoji="⚙️" size={20} animation="rotate" /> Système
                      </>
                    )}
                  </span>
                )}
                <span className="notification-modal-time">
                  {formatTime(selectedNotification.time)}
                </span>
              </div>
              
              <h2 className="notification-modal-title">{selectedNotification.title}</h2>
              <p className="notification-modal-message">{selectedNotification.message}</p>
            </div>

            {/* Modal Actions */}
            <div className="notification-modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeNotificationModal}
              >
                Fermer
              </button>
              {selectedNotification.category && selectedNotification.category !== 'system' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleGoToPage(selectedNotification)}
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                  {selectedNotification.category === 'budget' && 'Voir mes budgets'}
                  {selectedNotification.category === 'savings' && 'Voir le conseiller'}
                  {selectedNotification.category === 'tip' && 'Voir le conseiller'}
                  {selectedNotification.category === 'achievement' && 'Voir le dashboard'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel
