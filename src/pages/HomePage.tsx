import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useExpenseStore } from '../stores/expenseStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { parseExpenseText, formatAmount } from '../core/nlp/parser'
import { categoryMeta, paymentMethodMeta, type Expense } from '../db/schema'
import { ExpenseInputModal } from '../components/ExpenseInput/ExpenseInputModal'
import { SearchModal } from '../components/Search/SearchModal'
import { NotificationsPanel } from '../components/Notifications/NotificationsPanel'
import './HomePage.css'

export function HomePage() {
  const { expenses, totalExpenses, totalIncomes, addNewExpense, refreshData } = useExpenseStore()
  const { user } = useAuthStore()
  const { unreadCount, initNotifications } = useNotificationStore()
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useVoiceRecognition()

  const [pendingExpense, setPendingExpense] = useState<Partial<Expense> | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    refreshData()
    initNotifications()
  }, [refreshData, initNotifications])

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (transcript && !isRecording && !showExpenseModal) {
      const result = parseExpenseText(transcript)
      if (result.success && result.expense && result.expense.amount > 0) {
        setPendingExpense({
          amount: result.expense.amount,
          category: result.expense.category,
          paymentMethod: result.expense.paymentMethod,
          date: new Date(),
          description: transcript,
        })
        setShowConfirmation(true)
      }
    }
  }, [transcript, isRecording, showExpenseModal])

  const handleConfirm = async () => {
    if (pendingExpense) {
      await addNewExpense(pendingExpense as Omit<Expense, 'id'>)
      await refreshData()
      setPendingExpense(null)
      setShowConfirmation(false)
      resetTranscript()
    }
  }

  const handleCancel = () => {
    setPendingExpense(null)
    setShowConfirmation(false)
    resetTranscript()
  }

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      resetTranscript()
      startRecording()
    }
  }

  // Stats
  const balance = totalIncomes - totalExpenses
  const firstName = user?.name?.split(' ')[0] || 'Utilisateur'
  const recentExpenses = expenses.slice(0, 5)

  // Today's expenses
  const today = new Date().toDateString()
  const todayExpenses = expenses.filter(e => new Date(e.date).toDateString() === today)
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="home-page">
      {/* Background decorations */}
      <div className="home-bg-blob home-bg-blob-1"></div>
      <div className="home-bg-blob home-bg-blob-2"></div>

      <div className="home-container">
        {/* Header */}
        <header className="home-header animate-fade-in">
          <div>
            <h1 className="home-greeting">Bonjour, {firstName} 👋</h1>
            <p className="home-subtext">Gère ton djai comme un boss !</p>
          </div>
          <div className="home-header-actions">
            <button 
              className="home-header-btn" 
              title="Rechercher"
              onClick={() => setShowSearch(true)}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button 
              className="home-header-btn notification-btn" 
              title="Notifications"
              onClick={() => setShowNotifications(true)}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* Hero Card */}
        <div className="home-hero-card card-glass animate-fade-in-up">
          <div className="home-hero-badge">
            <span className="badge badge-primary">Aujourd'hui</span>
          </div>
          <div className="home-hero-content">
            <p className="home-hero-label">Total des Dépenses</p>
            <h2 className="home-hero-amount">
              {formatAmount(todayTotal)} <span className="home-hero-currency">FCFA</span>
            </h2>
            <div className="home-hero-stats">
              <div className="home-hero-stat">
                <div className="home-hero-stat-icon success">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <div>
                  <p className="home-hero-stat-label">Budget Restant</p>
                  <p className="home-hero-stat-value">{formatAmount(Math.max(balance, 0))} F</p>
                </div>
              </div>
              <div className="home-hero-stat">
                <div className="home-hero-stat-icon primary">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="home-hero-stat-label">Ce Mois</p>
                  <p className="home-hero-stat-value">{formatAmount(totalExpenses)} F</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="home-stats-grid animate-fade-in-up delay-1">
          <div className="stat-card">
            <p className="stat-card-label">Revenus</p>
            <p className="stat-card-value">{formatAmount(totalIncomes)} <span>F</span></p>
            <div className="stat-card-badge text-success">
              <span className="material-symbols-outlined">trending_up</span>
              <span>Ce mois</span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Dépenses</p>
            <p className="stat-card-value">{formatAmount(totalExpenses)} <span>F</span></p>
            <div className="stat-card-badge text-danger">
              <span className="material-symbols-outlined">payments</span>
              <span>Ce mois</span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Économies</p>
            <p className="stat-card-value">{formatAmount(Math.max(balance, 0))} <span>F</span></p>
            <div className="stat-card-badge text-accent">
              <span className="material-symbols-outlined">savings</span>
              <span>Restant</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="home-quick-actions animate-fade-in-up delay-2">
          <button 
            className="quick-action-btn primary"
            onClick={() => setShowExpenseModal(true)}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Ajouter une dépense</span>
          </button>
          <Link to="/history" className="quick-action-btn secondary">
            <span className="material-symbols-outlined">history</span>
            <span>Historique</span>
          </Link>
          <Link to="/analytics" className="quick-action-btn secondary">
            <span className="material-symbols-outlined">query_stats</span>
            <span>Statistiques</span>
          </Link>
        </div>

        {/* Recent Transactions */}
        <section className="home-transactions animate-fade-in-up delay-3">
          <div className="home-section-header">
            <h3 className="home-section-title">Transactions Récentes</h3>
            <Link to="/history" className="home-section-link">
              Voir tout
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="home-transactions-list">
              {recentExpenses.map((expense) => {
                const catMeta = categoryMeta[expense.category]
                const payMeta = paymentMethodMeta[expense.paymentMethod]
                const expDate = new Date(expense.date)
                const timeAgo = getTimeAgo(expDate)

                return (
                  <div key={expense.id} className="home-transaction-item">
                    <div
                      className="transaction-icon"
                      style={{ backgroundColor: `${catMeta?.color}20`, color: catMeta?.color }}
                    >
                      {catMeta?.icon}
                    </div>
                    <div className="transaction-info">
                      <p className="transaction-title">{expense.description || catMeta?.label}</p>
                      <p className="transaction-meta">
                        <span>{timeAgo}</span>
                        <span>•</span>
                        <span>{payMeta?.label}</span>
                      </p>
                    </div>
                    <p className="transaction-amount">-{formatAmount(expense.amount)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="home-empty-state">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <p className="empty-state-title">Aucune dépense récente</p>
              <p className="empty-state-text">Commencez à suivre vos dépenses</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowExpenseModal(true)}
              >
                <span className="material-symbols-outlined">add</span>
                Ajouter une dépense
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Floating Action Buttons */}
      <div className="home-fab-container">
        {/* Voice Recording Button */}
        <button
          onClick={handleMicClick}
          className={`home-fab-voice ${isRecording ? 'recording' : ''}`}
          title={isRecording ? 'Arrêter' : 'Parler pour ajouter'}
        >
          <span className="material-symbols-outlined">
            {isRecording ? 'stop' : 'mic'}
          </span>
        </button>
        
        {/* Add Expense Button */}
        <button
          onClick={() => setShowExpenseModal(true)}
          className="home-fab-add"
          title="Ajouter une dépense"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Voice Transcript Display */}
      {transcript && !showConfirmation && !showExpenseModal && (
        <div className="voice-transcript-floating card-glass animate-fade-in">
          <span className="voice-transcript-dot"></span>
          <p>"{transcript}"</p>
        </div>
      )}

      {/* Voice Confirmation Modal */}
      {showConfirmation && pendingExpense && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-title">Confirmer la dépense</h2>
            </div>
            <div className="modal-body">
              <div className="confirm-expense-card">
                <div
                  className="confirm-expense-icon"
                  style={{
                    backgroundColor: `${categoryMeta[pendingExpense.category!]?.color}20`,
                    color: categoryMeta[pendingExpense.category!]?.color
                  }}
                >
                  {categoryMeta[pendingExpense.category!]?.icon}
                </div>
                <div className="confirm-expense-details">
                  <p className="confirm-expense-category">
                    {categoryMeta[pendingExpense.category!]?.label}
                  </p>
                  <p className="confirm-expense-amount">
                    {formatAmount(pendingExpense.amount || 0)} FCFA
                  </p>
                  <p className="confirm-expense-method">
                    {paymentMethodMeta[pendingExpense.paymentMethod!]?.icon}{' '}
                    {paymentMethodMeta[pendingExpense.paymentMethod!]?.label}
                  </p>
                </div>
              </div>
              {pendingExpense.description && (
                <p className="confirm-expense-transcript">
                  "{pendingExpense.description}"
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={handleCancel} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleConfirm} className="btn btn-primary">
                <span className="material-symbols-outlined">check</span>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Input Modal */}
      <ExpenseInputModal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}

function getTimeAgo(date: Date): string {
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

export default HomePage
